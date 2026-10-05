/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_CONFIG, getRandomSpawnLevel, getItemConfigByLevel } from '../game/config';
import { PhysicsEngine, MedicalBody } from '../game/physics';
import { drawMedicalMascot, drawDoctorDropper } from '../game/renderer';
import { ParticleSystem } from '../game/particles';
import { soundManager } from '../game/audio';
import { GameStorage, SavedGameState } from '../game/storage';
import { MissionType } from '../types/game';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Header } from './Header';
import { TopPanels } from './TopPanels';
import { PowerUpsBar } from './PowerUpsBar';
import { GameOverModal } from './Modals/GameOverModal';
import { CollectionModal } from './Modals/CollectionModal';
import { SettingsModal } from './Modals/SettingsModal';
import { NewItemModal } from './Modals/NewItemModal';
import { GiftBoxModal, GiftRewardItem } from './Modals/GiftBoxModal';

const TOOL_REWARD_TEMPLATES: Record<'picker' | 'disinfect' | 'swap', GiftRewardItem> = {
  picker: {
    type: 'picker',
    name: 'Gắp Vật Tư',
    icon: '🧤',
    count: 1,
    desc: 'Gắp 1 vật tư bất kỳ ra khỏi thùng mica',
    color: '#0284C7',
    bgGradient: 'bg-gradient-to-r from-sky-50 to-blue-100',
  },
  disinfect: {
    type: 'disinfect',
    name: 'Khử Khuẩn',
    icon: '🧴',
    count: 1,
    desc: 'Xóa toàn bộ vật tư y tế cấp thấp nhất',
    color: '#0D9488',
    bgGradient: 'bg-gradient-to-r from-teal-50 to-emerald-100',
  },
  swap: {
    type: 'swap',
    name: 'Đổi Vật Phẩm',
    icon: '🔄',
    count: 1,
    desc: 'Hoán đổi vật phẩm hiện tại và tiếp theo',
    color: '#D97706',
    bgGradient: 'bg-gradient-to-r from-amber-50 to-orange-100',
  },
};

interface GameBoardProps {
  onGoHome?: () => void;
  resumeSavedGame?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onGoHome, resumeSavedGame = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isOnline } = useNetworkStatus();

  // Nạp ván chơi đã lưu nếu chọn tiếp tục
  const initialSavedGame = useRef<SavedGameState | null>(
    resumeSavedGame ? GameStorage.getSavedGame() : null
  ).current;

  // Tham chiếu các đối tượng logic game
  const physicsRef = useRef<PhysicsEngine | null>(null);
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const animationFrameRef = useRef<number | null>(null);

  // Trạng thái Điểm số & Kỷ lục
  const [score, setScore] = useState<number>(() => initialSavedGame?.score ?? 0);
  const [bestScore, setBestScore] = useState<number>(() => GameStorage.getBestScore());
  const [combo, setCombo] = useState<number>(() => initialSavedGame?.combo ?? 1);
  const [bestCombo, setBestCombo] = useState<number>(() => GameStorage.getBestCombo());
  const [highestLevel, setHighestLevel] = useState<number>(() => initialSavedGame?.highestLevel ?? GameStorage.getHighestLevel());
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => GameStorage.getUnlockedLevels());

  // Trạng thái Vật phẩm Hiện tại & Kế tiếp
  const [currentLevel, setCurrentLevel] = useState<number>(() => initialSavedGame?.currentLevel ?? getRandomSpawnLevel());
  const [nextLevel, setNextLevel] = useState<number>(() => initialSavedGame?.nextLevel ?? getRandomSpawnLevel());
  const [dropperX, setDropperX] = useState<number>(180);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const canDropRef = useRef<boolean>(true);

  // Trạng thái Power-up & Hộp Tiếp Tế (Mục tiêu 100/100 lần hợp nhất)
  const [powerups, setPowerups] = useState(() => initialSavedGame?.powerups ?? GAME_CONFIG.powerupInitialCounts);
  const [isPickMode, setIsPickMode] = useState<boolean>(false);
  const [supplyProgress, setSupplyProgress] = useState<number>(() => initialSavedGame?.supplyProgress ?? 0);
  const SUPPLY_TARGET = 100;

  // Trạng thái Mở Hộp Quà Tiếp Tế Công Cụ
  const [giftBoxData, setGiftBoxData] = useState<{
    reason: string;
    title?: string;
    rewards: GiftRewardItem[];
  } | null>(null);

  // Trạng thái Cảnh báo Quá tải & Game Over
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const overflowStartRef = useRef<number | null>(null);
  const lastWarningSoundRef = useRef<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Trạng thái Modal
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [newUnlockedLevel, setNewUnlockedLevel] = useState<number | null>(null);

  // Âm thanh
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(soundManager.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(soundManager.musicEnabled);

  // Combo timer
  const lastMergeTimeRef = useRef<number>(0);

  // Trạng thái lưu trữ ván chơi dở dang (Chế độ chơi offline)
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(() => initialSavedGame?.savedAt ?? null);
  const [showSaveToast, setShowSaveToast] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Thời điểm bắt đầu động tác thả để tính toán hoạt ảnh nảy ngược và mở tay mượt mà
  const dropStartTimeRef = useRef<number>(0);

  // Thông báo tiến độ/hoàn thành nhiệm vụ ngày (Daily Missions)
  const [missionToast, setMissionToast] = useState<string | null>(null);

  const checkMissions = useCallback((type: MissionType, amount: number, isAbsolute: boolean = false) => {
    try {
      const res = GameStorage.updateMissionProgress(type, amount, isAbsolute);
      if (res.completedAny && res.completedMissions.length > 0) {
        soundManager.playCoin();
        setMissionToast(`🎉 Hoàn thành nhiệm vụ: "${res.completedMissions[0].title}"! Nhận Xu tại Trang chủ`);
        setTimeout(() => setMissionToast(null), 3200);
      }
    } catch {
      //
    }
  }, []);

  // Hàm lưu trạng thái ván chơi dở dang vào LocalStorage (Chế độ chơi offline)
  const saveGameState = useCallback(() => {
    if (isGameOver || !physicsRef.current) return;
    const items = physicsRef.current.exportItems();
    if (items.length === 0 && score === 0) return;

    const now = Date.now();
    const success = GameStorage.saveGame({
      score,
      combo,
      highestLevel,
      currentLevel,
      nextLevel,
      supplyProgress,
      powerups,
      items,
      savedAt: now,
    });

    if (success) {
      setLastSavedTime(now);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2200);
    }
  }, [score, combo, highestLevel, currentLevel, nextLevel, supplyProgress, powerups, isGameOver]);

  const saveGameStateRef = useRef(saveGameState);
  useEffect(() => {
    saveGameStateRef.current = saveGameState;
  }, [saveGameState]);

  /**
   * Lưu ván chơi thủ công kèm hiệu ứng phản hồi
   */
  const handleManualSave = useCallback(() => {
    saveGameState();
    setShowSaveToast(true);
    soundManager.playDrop();
    setTimeout(() => setShowSaveToast(false), 2200);
  }, [saveGameState]);

  // Tự động lưu khi người chơi thoát app, tắt tab hoặc ẩn trình duyệt
  useEffect(() => {
    const handleSave = () => {
      saveGameStateRef.current?.();
    };

    window.addEventListener('beforeunload', handleSave);
    window.addEventListener('pagehide', handleSave);
    document.addEventListener('visibilitychange', handleSave);

    return () => {
      handleSave();
      window.removeEventListener('beforeunload', handleSave);
      window.removeEventListener('pagehide', handleSave);
      document.removeEventListener('visibilitychange', handleSave);
    };
  }, []);

  /**
   * Khởi tạo thế giới vật lý và kích thước Canvas
   */
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 560;

    const getRenderRatio = () => Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    let dpr = getRenderRatio();
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    setDropperX(width / 2);

    // Khởi tạo Matter.js Physics Engine
    const physics = new PhysicsEngine(width, height);
    physicsRef.current = physics;

    // Khôi phục các vật phẩm từ ván chơi dở dang nếu có
    if (initialSavedGame && initialSavedGame.items && initialSavedGame.items.length > 0) {
      physics.restoreItems(initialSavedGame.items);
    }

    // Đăng ký callback khi 2 vật phẩm hợp nhất (MERGE)
    physics.onMergeCallback = (midX, midY, newLevel, points) => {
      const now = performance.now();
      const timeSinceLastMerge = now - lastMergeTimeRef.current;
      lastMergeTimeRef.current = now;

      // Tính chuỗi Combo
      let currentComboMultiplier = 1;
      if (timeSinceLastMerge <= GAME_CONFIG.comboTimeoutMs) {
        setCombo((prev) => {
          const nextCombo = prev + 1;
          currentComboMultiplier = nextCombo;
          if (nextCombo > bestCombo) {
            setBestCombo(nextCombo);
            GameStorage.saveBestCombo(nextCombo);
          }
          soundManager.playCombo(nextCombo);
          particlesRef.current.addFloatingText(`COMBO x${nextCombo}!`, midX, midY - 26, '#F59E0B', 24);
          return nextCombo;
        });
      } else {
        setCombo(1);
        currentComboMultiplier = 1;
        soundManager.playMerge(newLevel);
      }

      // Điểm cộng kèm bonus theo combo
      const totalPoints = points * currentComboMultiplier;
      setScore((prevScore) => {
        const nextScore = prevScore + totalPoints;
        const reachedNewRecord = GameStorage.saveBestScore(nextScore);
        if (reachedNewRecord) {
          setBestScore(nextScore);
          setIsNewRecord(true);
        }
        return nextScore;
      });

      // Cập nhật tiến độ nhiệm vụ hàng ngày (Daily Missions)
      checkMissions('merge_count', 1);
      checkMissions('combo_reach', currentComboMultiplier, true);
      checkMissions('reach_level', newLevel, true);
      checkMissions('score_accumulate', totalPoints);
      checkMissions('supply_progress', 1);

      // Hiển thị chữ nổi điểm
      particlesRef.current.addFloatingText(
        `+${totalPoints}`,
        midX,
        midY - 8,
        getItemConfigByLevel(newLevel).color,
        20
      );

      // Tạo chùm hạt lấp lánh và sóng hào quang thỏa mãn (Merge Burst & Sparkles)
      particlesRef.current.emitMergeBurst(
        midX,
        midY,
        getItemConfigByLevel(newLevel).color,
        currentComboMultiplier
      );

      // Nếu đạt chuỗi combo >= 2 thì kích hoạt thêm chùm tia sáng vàng lấp lánh
      if (currentComboMultiplier >= 2) {
        particlesRef.current.emitComboSparkles(midX, midY, currentComboMultiplier);
      }

      // 1. TÍCH LŨY HỘP TIẾP TẾ Y TẾ (MỖI 100/100 LẦN HỢP NHẤT -> MỞ HỘP QUÀ TIẾP TẾ)
      setSupplyProgress((prev) => {
        const next = prev + 1;
        if (next >= SUPPLY_TARGET) {
          const toolKeys: Array<'swap' | 'picker' | 'disinfect'> = ['swap', 'picker', 'disinfect'];
          const chosen = toolKeys[Math.floor(Math.random() * toolKeys.length)];

          // Mở Hộp Quà Tiếp Tế Y Tế với hiệu ứng động
          setTimeout(() => {
            setGiftBoxData({
              title: 'HỘP QUÀ TIẾP TẾ Y TẾ 🎁',
              reason: 'TÍCH LŨY ĐỦ 100/100 LẦN HỢP NHẤT VẬT TƯ!',
              rewards: [{ ...TOOL_REWARD_TEMPLATES[chosen], count: 1 }],
            });
          }, 350);

          return 0; // Đặt lại về 0 để tiếp tục chu kỳ 100 lần kế tiếp
        }
        return next;
      });

      // 2. THƯỞNG CÔNG CỤ KHI ĐẠT CHUỖI COMBO TỪ x10 TRỞ LÊN
      if (currentComboMultiplier === 10) {
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ SIÊU COMBO 🔥',
            reason: 'ĐẠT CHUỖI COMBO x10 SIÊU ĐẲNG!',
            rewards: [
              { ...TOOL_REWARD_TEMPLATES.picker, count: 1 },
              { ...TOOL_REWARD_TEMPLATES.swap, count: 1 },
            ],
          });
        }, 350);
      } else if (currentComboMultiplier > 10 && currentComboMultiplier % 5 === 0) {
        setTimeout(() => {
          setGiftBoxData({
            title: `HỘP QUÀ COMBO x${currentComboMultiplier} ⚡`,
            reason: `CHUỖI COMBO x${currentComboMultiplier} XUẤT SẮC!`,
            rewards: [{ ...TOOL_REWARD_TEMPLATES.disinfect, count: 1 }],
          });
        }, 350);
      }

      // 3. THƯỞNG CÔNG CỤ KHI GHÉP ĐƯỢC VẬT PHẨM TỪ LV.8 TRỞ LÊN
      if (newLevel === 8) {
        // Lv.8: Máy đo huyết áp
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ THĂNG CẤP Y TẾ 🎉',
            reason: 'GHÉP THÀNH CÔNG MÁY ĐO HUYẾT ÁP (LV.8)!',
            rewards: [{ ...TOOL_REWARD_TEMPLATES.picker, count: 1 }],
          });
        }, 450);
      } else if (newLevel === 9) {
        // Lv.9: Túi cấp cứu
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ THĂNG CẤP Y TẾ 🎉',
            reason: 'GHÉP THÀNH CÔNG TÚI CẤP CỨU (LV.9)!',
            rewards: [{ ...TOOL_REWARD_TEMPLATES.swap, count: 1 }],
          });
        }, 450);
      } else if (newLevel === 10) {
        // Lv.10: Máy sốc tim
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ THĂNG CẤP Y TẾ ⚡',
            reason: 'GHÉP THÀNH CÔNG MÁY SỐC TIM (LV.10)!',
            rewards: [{ ...TOOL_REWARD_TEMPLATES.disinfect, count: 1 }],
          });
        }, 450);
      } else if (newLevel === 11) {
        // Lv.11: Giường bệnh viện
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ THĂNG CẤP Y TẾ 🏥',
            reason: 'GHÉP THÀNH CÔNG GIƯỜNG BỆNH VIỆN (LV.11)!',
            rewards: [{ ...TOOL_REWARD_TEMPLATES.picker, count: 1 }],
          });
        }, 450);
      } else if (newLevel === 12) {
        // Lv.12: Xe cứu thương tối thượng - Thưởng cả 3 công cụ!
        setTimeout(() => {
          setGiftBoxData({
            title: 'HỘP QUÀ CỨU SINH TỐI THƯỢNG 🚑',
            reason: 'TẠO NÊN XE CỨU THƯƠNG HUYỀN THOẠI (LV.12)!',
            rewards: [
              { ...TOOL_REWARD_TEMPLATES.picker, count: 1 },
              { ...TOOL_REWARD_TEMPLATES.disinfect, count: 1 },
              { ...TOOL_REWARD_TEMPLATES.swap, count: 1 },
            ],
          });
        }, 450);
      }

      // Cập nhật cấp cao nhất đạt được
      if (newLevel > highestLevel) {
        setHighestLevel(newLevel);
        GameStorage.saveHighestLevel(newLevel);
      }

      // Kiểm tra mở khóa vật phẩm mới trong Bộ Sưu Tập
      const isFirstDiscovery = GameStorage.unlockLevel(newLevel);
      if (isFirstDiscovery) {
        setUnlockedLevels(GameStorage.getUnlockedLevels());
        setTimeout(() => {
          setNewUnlockedLevel(newLevel);
        }, 400);
      }

      // Tự động lưu ván chơi dở dang sau khi hợp nhất thành công
      setTimeout(() => {
        saveGameStateRef.current?.();
      }, 120);
    };

    // Callback âm thanh va chạm nảy
    physics.onBounceCallback = (velocity) => {
      soundManager.playBounce(velocity);
    };

    // Resize observer theo dõi khi đổi kích thước
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !canvas) return;
      const newW = container.clientWidth || 360;
      const newH = container.clientHeight || 560;
      dpr = getRenderRatio();
      canvas.width = newW * dpr;
      canvas.height = newH * dpr;
      canvas.style.width = `${newW}px`;
      canvas.style.height = `${newH}px`;
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }
      physics.resize(newW, newH);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Vòng lặp Render chính 60 FPS
   */
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const physics = physicsRef.current;
      const particles = particlesRef.current;

      if (canvas && physics) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = physics.width;
          const h = physics.height;

          ctx.clearRect(0, 0, w, h);

          // Cập nhật vật lý Matter.js nếu không bị Game Over
          if (!isGameOver) {
            physics.update(delta);
            particles.update();

            // Kiểm tra trạng thái vượt vạch cảnh báo quá tải
            const dangerStatus = physics.checkDangerStatus();

            if (dangerStatus.isOverflowing) {
              if (overflowStartRef.current === null) {
                overflowStartRef.current = currentTime;
              }
              const overflowDuration = currentTime - overflowStartRef.current;
              setIsOverflowing(true);

              if (currentTime - lastWarningSoundRef.current > 800) {
                lastWarningSoundRef.current = currentTime;
                soundManager.playWarning();
              }

              if (overflowDuration >= GAME_CONFIG.gameOverDelayMs) {
                setIsGameOver(true);
                soundManager.playGameOver();
                GameStorage.clearSavedGame();
              }
            } else {
              overflowStartRef.current = null;
              setIsOverflowing(false);
            }
          }

          // 1. VẼ HẬU CẢNH PHÒNG KHÁM TRẠM Y TẾ ẤM ÁP (Xuyên qua thùng kính)
          ctx.save();
          // Màu tường kem vàng nhạt ấm áp
          ctx.fillStyle = '#FDF6E2';
          ctx.fillRect(0, 0, w, h);

          // Bức tranh cổ động chữ thập đỏ "Vì sức khỏe cộng đồng" trên tường phía sau
          const posterW = 68;
          const posterH = 88;
          const posterX = w - posterW - 20;
          const posterY = 60;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = '#E2D3B3';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(posterX, posterY, posterW, posterH, 6);
          ctx.fill();
          ctx.stroke();

          // Trái tim đỏ và chữ trên poster
          ctx.fillStyle = '#EF4444';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('♥', posterX + posterW / 2, posterY + 30);
          ctx.fillStyle = '#64748B';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('VÌ SỨC KHỎE', posterX + posterW / 2, posterY + 50);
          ctx.fillText('CỘNG ĐỒNG', posterX + posterW / 2, posterY + 62);

          // Cây xanh cảnh Monstera bên góc trái
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.ellipse(24, h * 0.45, 14, 26, -0.4, 0, Math.PI * 2);
          ctx.ellipse(36, h * 0.48, 16, 28, 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 2. VẼ THÙNG KÍNH MICA TRONG SUỐT (Translucent Acrylic Container)
          ctx.save();
          const pad = 12;
          const boxW = w - pad * 2;
          const boxH = h - pad - 6;

          // Nền kính trong suốt phản quang nhẹ
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.roundRect(pad, pad, boxW, boxH, [0, 0, 26, 26]);
          ctx.fill();

          // Viền thùng kính mica trắng sáng dày dặn
          ctx.strokeStyle = isOverflowing ? 'rgba(239, 68, 68, 0.85)' : 'rgba(255, 255, 255, 0.95)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Phản xạ ánh sáng bóng trên mặt kính (Góc trên bên trái)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.moveTo(pad + 8, pad + 10);
          ctx.lineTo(pad + 28, pad + 10);
          ctx.lineTo(pad + 12, h * 0.6);
          ctx.lineTo(pad + 8, h * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // 3. VẼ VẠCH CẢNH BÁO QUÁ TẢI (DANGER LINE CHUẨN MẪU CÓ ĐẾM NGƯỢC RÕ RÀNG)
          ctx.save();
          const dangerY = physics.dangerLineY;
          ctx.setLineDash([8, 6]);
          ctx.strokeStyle = isOverflowing
            ? `rgba(239, 68, 68, ${0.7 + Math.sin(currentTime * 0.02) * 0.3})`
            : 'rgba(239, 68, 68, 0.45)';
          ctx.lineWidth = isOverflowing ? 3.5 : 2;
          ctx.beginPath();
          ctx.moveTo(pad + 4, dangerY);
          ctx.lineTo(w - pad - 4, dangerY);
          ctx.stroke();

          if (isOverflowing && overflowStartRef.current !== null) {
            const elapsed = currentTime - overflowStartRef.current;
            const remainingSec = Math.max(0, (GAME_CONFIG.gameOverDelayMs - elapsed) / 1000).toFixed(1);

            // Banner đếm ngược quá tải to rõ ràng nổi bật ở giữa vạch
            const badgeW = 210;
            const badgeH = 26;
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.roundRect((w - badgeW) / 2, dangerY - badgeH / 2, badgeW, badgeH, 13);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`⚠️ QUÁ TẢI! KHO ĐẦY SAU: ${remainingSec}s`, w / 2, dangerY);
          } else {
            // Biểu tượng cảnh báo quá tải bên góc phải khi chưa đầy
            ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚠️ VẠCH CẢNH BÁO QUÁ TẢI', w - pad - 8, dangerY - 10);
          }
          ctx.restore();

          // 4. VẼ ĐƯỜNG GUIDE NÉT ĐỨT TỪ VỊ TRÍ THẢ
          const dropperY = Math.max(26, Math.min(36, h * 0.065));
          if (canDropRef.current && !isPickMode && !isGameOver) {
            ctx.save();
            ctx.setLineDash([5, 6]);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(dropperX, dropperY + 22);
            ctx.lineTo(dropperX, h - 16);
            ctx.stroke();
            ctx.restore();
          }

          // 5. VẼ TẤT CẢ VẬT PHẨM Y TẾ TRONG THÙNG VỚI HÌNH THỂ CHÂN THỰC
          for (let i = 0; i < physics.items.length; i++) {
            const item = physics.items[i];
            const data = item.customData;
            drawMedicalMascot(
              ctx,
              item.position.x,
              item.position.y,
              data.level,
              item.angle,
              data.scale * physics.scaleFactor,
              data.expression,
              currentTime
            );
          }

          // 6. VẼ Y TÁ HAMSTER / GẤU CHIBI CẦM VẬT PHẨM Ở TRÊN CÙNG
          if (!isGameOver) {
            drawDoctorDropper(
              ctx,
              dropperX,
              dropperY,
              currentLevel,
              isDropping,
              dropStartTimeRef.current,
              currentTime,
              physics.scaleFactor,
              isOverflowing,
              combo
            );
          }

          // 7. VẼ CÁC HIỆU ỨNG HẠT VÀ CHỮ NỔI
          particles.draw(ctx);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dropperX, currentLevel, isDropping, isGameOver, isOverflowing, isPickMode]);

  /**
   * Kéo ngang
   */
  const handlePointerMove = useCallback(
    (clientX: number) => {
      const container = containerRef.current;
      if (!container || !canDropRef.current || isPickMode || isGameOver) return;

      const rect = container.getBoundingClientRect();
      const currentConfig = getItemConfigByLevel(currentLevel);
      const currentScale = physicsRef.current?.scaleFactor || 1.0;
      const halfW = (Math.max(currentConfig.width, currentConfig.height) / 2) * currentScale;
      const minX = halfW + 16;
      const maxX = rect.width - halfW - 16;

      const relativeX = clientX - rect.left;
      const clampedX = Math.max(minX, Math.min(maxX, relativeX));
      setDropperX(clampedX);
    },
    [currentLevel, isPickMode, isGameOver]
  );

  /**
   * Thả vật phẩm từ tay y tá xuống thùng
   */
  const handleDrop = useCallback(() => {
    if (!canDropRef.current || isPickMode || isGameOver || !physicsRef.current) return;

    canDropRef.current = false;
    dropStartTimeRef.current = performance.now();
    setIsDropping(true);
    soundManager.playDrop();

    const currentConfig = getItemConfigByLevel(currentLevel);
    const currentScale = physicsRef.current.scaleFactor || 1.0;
    const itemH = (currentConfig.height || currentConfig.radius * 2) * currentScale;
    const h = physicsRef.current.height || 500;
    const dropperY = Math.max(26, Math.min(36, h * 0.065));
    const spawnY = dropperY + 14 + itemH / 2;
    physicsRef.current.spawnItem(dropperX, spawnY, currentLevel, true);

    setTimeout(() => {
      setIsDropping(false);
      setCurrentLevel(nextLevel);
      setNextLevel(getRandomSpawnLevel());
      canDropRef.current = true;
      saveGameStateRef.current?.();
    }, 420);
  }, [dropperX, currentLevel, nextLevel, isPickMode, isGameOver]);

  /**
   * Xử lý click khi bật Power-up Gắp vật tư
   */
  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPickMode || !physicsRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const items = physicsRef.current.items;
    let targetItem: MedicalBody | null = null;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      const config = getItemConfigByLevel(item.customData.level);
      const halfSize = Math.max(config.width, config.height) / 2;
      const dx = item.position.x - clickX;
      const dy = item.position.y - clickY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= halfSize + 10) {
        targetItem = item;
        break;
      }
    }

    if (targetItem) {
      soundManager.playPowerUp();
      particlesRef.current.emitMergeBurst(
        targetItem.position.x,
        targetItem.position.y,
        '#F59E0B',
        18
      );
      particlesRef.current.addFloatingText(
        'ĐÃ GẮP RA!',
        targetItem.position.x,
        targetItem.position.y - 10,
        '#D97706',
        18
      );

      physicsRef.current.removeBody(targetItem);
      setPowerups((prev) => ({ ...prev, picker: prev.picker - 1 }));
      setIsPickMode(false);
      checkMissions('use_powerup', 1);
      setTimeout(() => saveGameStateRef.current?.(), 120);
    }
  };

  /**
   * POWER-UP 1: Gắp vật tư
   */
  const handleUsePicker = () => {
    if (isPickMode) {
      setIsPickMode(false);
      return;
    }
    if (powerups.picker <= 0) return;
    soundManager.playPowerUp();
    setIsPickMode(true);
  };

  /**
   * POWER-UP 2: Khử khuẩn
   */
  const handleUseDisinfect = () => {
    if (powerups.disinfect <= 0 || !physicsRef.current) return;
    const items = physicsRef.current.items;
    if (items.length === 0) return;

    soundManager.playPowerUp();

    let lowestLevel = 12;
    for (const item of items) {
      if (item.customData.level < lowestLevel) {
        lowestLevel = item.customData.level;
      }
    }

    const toRemove: MedicalBody[] = [];
    for (const item of items) {
      if (item.customData.level === lowestLevel) {
        toRemove.push(item);
      }
    }

    toRemove.forEach((item) => {
      particlesRef.current.emitDisinfectBubbles(item.position.x, item.position.y, 16);
      physicsRef.current?.removeBody(item);
    });

    particlesRef.current.addFloatingText(
      '✨ ĐÃ KHỬ KHUẨN!',
      physicsRef.current.width / 2,
      physicsRef.current.height * 0.4,
      '#0D9488',
      24
    );

    setPowerups((prev) => ({ ...prev, disinfect: prev.disinfect - 1 }));
    checkMissions('use_powerup', 1);
    setTimeout(() => saveGameStateRef.current?.(), 120);
  };

  /**
   * POWER-UP 3: Đổi vật
   */
  const handleUseSwap = () => {
    if (powerups.swap <= 0) return;
    soundManager.playPowerUp();

    const temp = currentLevel;
    setCurrentLevel(nextLevel);
    setNextLevel(temp);

    setPowerups((prev) => ({ ...prev, swap: prev.swap - 1 }));
    checkMissions('use_powerup', 1);
    setTimeout(() => saveGameStateRef.current?.(), 120);
  };

  /**
   * Mở Hộp Quà Tiếp Tế chủ động khi đạt đủ 100/100 lần hợp nhất
   */
  const handleOpenManualGiftBox = () => {
    if (supplyProgress < SUPPLY_TARGET) return;
    const toolKeys: Array<'swap' | 'picker' | 'disinfect'> = ['swap', 'picker', 'disinfect'];
    const chosen = toolKeys[Math.floor(Math.random() * toolKeys.length)];
    setSupplyProgress(0);
    setGiftBoxData({
      title: 'HỘP QUÀ TIẾP TẾ Y TẾ 🎁',
      reason: 'TÍCH LŨY ĐỦ 100/100 LẦN HỢP NHẤT VẬT TƯ!',
      rewards: [{ ...TOOL_REWARD_TEMPLATES[chosen], count: 1 }],
    });
  };

  /**
   * Nhận phần thưởng từ Hộp Quà và đóng Modal
   */
  const handleClaimGiftRewards = () => {
    if (!giftBoxData) return;
    setPowerups((prev) => {
      const next = { ...prev };
      giftBoxData.rewards.forEach((item) => {
        next[item.type] = (next[item.type] || 0) + item.count;
      });
      return next;
    });

    if (physicsRef.current) {
      particlesRef.current.emitComboSparkles(
        physicsRef.current.width / 2,
        physicsRef.current.height * 0.45,
        6
      );
    }
    soundManager.playPowerUp();
    setGiftBoxData(null);
    setTimeout(() => saveGameStateRef.current?.(), 120);
  };

  /**
   * Tạm dừng và quay về trang chủ (tự động lưu ván chơi)
   */
  const handleGoHome = () => {
    saveGameState();
    if (onGoHome) {
      onGoHome();
    }
  };

  /**
   * Restart ván mới
   */
  const handleRestart = () => {
    GameStorage.clearSavedGame();
    if (physicsRef.current) {
      physicsRef.current.clearAllItems();
    }
    particlesRef.current.clear();
    setScore(0);
    setCombo(1);
    setIsGameOver(false);
    setIsNewRecord(false);
    setIsOverflowing(false);
    overflowStartRef.current = null;
    setIsPickMode(false);
    setPowerups(GAME_CONFIG.powerupInitialCounts);
    setSupplyProgress(0);
    setGiftBoxData(null);
    setCurrentLevel(getRandomSpawnLevel());
    setNextLevel(getRandomSpawnLevel());
    canDropRef.current = true;
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-b from-[#FDF8EC] via-[#FFF9ED] to-[#F5E6CC] overflow-hidden select-none">
      {/* 1. Header trên cùng: Cài đặt, Bảng hiệu Trạm Y Tế Merge, Điểm & Kỷ Lục, Âm thanh, Lưu ván & Nút về Home */}
      <Header
        score={score}
        bestScore={bestScore}
        combo={combo}
        onOpenSettings={() => setShowSettings(true)}
        sfxEnabled={sfxEnabled}
        onToggleSound={() => {
          const next = !sfxEnabled;
          setSfxEnabled(next);
          soundManager.setSfx(next);
        }}
        onGoHome={handleGoHome}
        isOnline={isOnline}
        onSaveNow={handleManualSave}
        isSavedRecently={isSavedRecently}
      />

      {/* Thông báo nổi khi lưu ván chơi dở dang thành công */}
      {showSaveToast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white font-black text-xs shadow-lg flex items-center gap-1.5 border border-emerald-300 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 58px)',
          }}
        >
          <span>💾</span>
          <span>Đã lưu ván chơi dở dang an toàn!</span>
        </div>
      )}

      {/* Thông báo nổi khi hoàn thành nhiệm vụ ngày */}
      {missionToast && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-amber-500/95 text-white font-black text-xs shadow-xl flex items-center gap-2 border-2 border-yellow-200 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200 text-center max-w-[90%]"
          style={{
            top: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 60px)',
          }}
        >
          <span>{missionToast}</span>
        </div>
      )}

      {/* 2. TopPanels: Bảng kẹp hồ sơ Clipboard bên trái, ô NEXT & nút BỘ SƯU TẬP bên phải */}
      <TopPanels
        nextLevel={nextLevel}
        unlockedCount={unlockedLevels.length}
        totalItems={GAME_CONFIG.items.length}
        onOpenCollection={() => setShowCollection(true)}
      />

      {/* Thông báo chế độ Gắp vật tư */}
      {isPickMode && (
        <div className="mx-4 my-0.5 py-1 px-3 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center justify-between shadow-md z-20 animate-pulse">
          <span>🧤 Hãy chạm vào 1 vật trong thùng để gắp ra!</span>
          <button
            onClick={() => setIsPickMode(false)}
            className="px-2 py-0.5 rounded-lg bg-amber-700 text-white text-[10px]"
          >
            Hủy
          </button>
        </div>
      )}

      {/* 3. KHU VỰC THÙNG KÍNH MICA CHƠI CHÍNH */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full mx-auto my-0.5 cursor-crosshair touch-none overflow-hidden"
        onPointerDown={(e) => handlePointerMove(e.clientX)}
        onPointerMove={(e) => handlePointerMove(e.clientX)}
        onPointerUp={handleDrop}
        onClick={handleContainerClick}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      </div>

      {/* 4. Thanh Power-ups ở bệ gỗ đáy màn hình */}
      <PowerUpsBar
        pickerCount={powerups.picker}
        disinfectCount={powerups.disinfect}
        swapCount={powerups.swap}
        isPickMode={isPickMode}
        supplyProgress={supplyProgress}
        supplyTarget={SUPPLY_TARGET}
        onUsePicker={handleUsePicker}
        onUseDisinfect={handleUseDisinfect}
        onUseSwap={handleUseSwap}
        onOpenGiftBox={handleOpenManualGiftBox}
      />

      {/* 5. CÁC MODAL HIỂN THỊ */}
      {giftBoxData !== null && (
        <GiftBoxModal
          title={giftBoxData.title}
          reason={giftBoxData.reason}
          rewards={giftBoxData.rewards}
          onClaim={handleClaimGiftRewards}
        />
      )}
      {isGameOver && (
        <GameOverModal
          score={score}
          bestScore={bestScore}
          isNewRecord={isNewRecord}
          highestLevel={highestLevel}
          bestCombo={bestCombo}
          onRestart={handleRestart}
          onOpenCollection={() => {
            setShowCollection(true);
          }}
        />
      )}

      {showCollection && (
        <CollectionModal
          unlockedLevels={unlockedLevels}
          onClose={() => setShowCollection(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          onToggleSfx={() => {
            const next = !sfxEnabled;
            setSfxEnabled(next);
            soundManager.setSfx(next);
          }}
          onToggleMusic={() => {
            const next = !musicEnabled;
            setMusicEnabled(next);
            soundManager.setMusic(next);
          }}
          onResetData={() => {
            setBestScore(0);
            setBestCombo(0);
            setHighestLevel(1);
            setUnlockedLevels([1]);
            handleRestart();
          }}
          onManualSave={handleManualSave}
          lastSavedTime={lastSavedTime}
          onClose={() => setShowSettings(false)}
        />
      )}

      {newUnlockedLevel !== null && (
        <NewItemModal
          level={newUnlockedLevel}
          onContinue={() => setNewUnlockedLevel(null)}
        />
      )}
    </div>
  );
};
