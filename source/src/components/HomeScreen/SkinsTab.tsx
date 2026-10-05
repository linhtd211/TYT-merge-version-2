/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sparkles, ChevronLeft, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COSMETIC_SKINS, getSkinConfig } from '../../game/skins';
import { GameStorage } from '../../game/storage';
import { drawMedicalMascot } from '../../game/renderer';
import { soundManager } from '../../game/audio';
import { getItemConfigByLevel } from '../../game/config';

interface SkinsTabProps {
  coins: number;
  onCoinsChange: (newCoins: number) => void;
  activeSkin: string;
  onActiveSkinChange: (skinId: string) => void;
}

export const SkinsTab: React.FC<SkinsTabProps> = ({
  coins,
  onCoinsChange,
  activeSkin,
  onActiveSkinChange,
}) => {
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(() =>
    GameStorage.getUnlockedSkins()
  );
  const [selectedPreviewSkin, setSelectedPreviewSkin] = useState<string>(activeSkin);
  const [previewLevel, setPreviewLevel] = useState<number>(1);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Vòng lặp render mascot xem trước trên Canvas
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawMedicalMascot(
        ctx,
        canvas.width / 2,
        canvas.height / 2 + 4,
        previewLevel,
        0,
        1.1,
        'happy',
        time,
        undefined,
        selectedPreviewSkin
      );
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedPreviewSkin, previewLevel]);

  const currentPreviewItemConfig = getItemConfigByLevel(previewLevel);
  const selectedSkinData = getSkinConfig(selectedPreviewSkin);
  const isSelectedUnlocked = unlockedSkins.includes(selectedPreviewSkin);
  const isSelectedActive = activeSkin === selectedPreviewSkin;

  /**
   * Mặc trang phục
   */
  const handleEquip = (skinId: string) => {
    soundManager.playEquipSkin();
    GameStorage.setActiveSkin(skinId);
    onActiveSkinChange(skinId);
    setFeedbackToast(`Đã trang bị "${getSkinConfig(skinId).name}"!`);
    setTimeout(() => setFeedbackToast(null), 2200);
  };

  /**
   * Mua trang phục bằng Xu
   */
  const handleBuy = (skinId: string, price: number) => {
    if (coins < price) {
      setFeedbackToast('Bạn chưa đủ Xu Y Tế để mở khóa trang phục này!');
      setTimeout(() => setFeedbackToast(null), 2500);
      return;
    }

    const spent = GameStorage.spendCoins(price);
    if (spent) {
      soundManager.playGiftBox();
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#EC4899', '#06B6D4', '#10B981'],
        });
      } catch {
        //
      }

      GameStorage.unlockSkin(skinId);
      GameStorage.setActiveSkin(skinId);
      setUnlockedSkins(GameStorage.getUnlockedSkins());
      onCoinsChange(GameStorage.getCoins());
      onActiveSkinChange(skinId);

      setFeedbackToast(`Mở khóa thành công "${getSkinConfig(skinId).name}"!`);
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 py-1 text-slate-800 animate-in fade-in duration-200">
      {/* Toast phản hồi */}
      {feedbackToast && (
        <div className="p-2.5 rounded-2xl bg-slate-900/90 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 border border-slate-700 animate-in zoom-in-95">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. KHU VỰC XEM TRƯỚC SỐNG ĐỘNG (INTERACTIVE MASCOT PREVIEW) */}
      <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-teal-200 shadow-sm flex flex-col items-center relative overflow-hidden">
        {/* Hào quang nền */}
        <div
          className="absolute -top-10 inset-x-0 h-32 rounded-full blur-2xl opacity-30 transition-colors duration-500"
          style={{ backgroundColor: selectedSkinData.themeColor }}
        />

        {/* Tiêu đề & Chọn vật phẩm xem trước */}
        <div className="w-full flex items-center justify-between z-10 mb-1">
          <div className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-black text-slate-800">
              {selectedSkinData.name}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-0.5 border border-slate-200">
            <button
              onClick={() => setPreviewLevel((prev) => (prev > 1 ? prev - 1 : 12))}
              className="p-0.5 text-slate-600 hover:text-slate-900 active:scale-95"
              title="Vật phẩm trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-black text-slate-700 min-w-16 text-center truncate">
              Lv.{previewLevel} {currentPreviewItemConfig.name}
            </span>
            <button
              onClick={() => setPreviewLevel((prev) => (prev < 12 ? prev + 1 : 1))}
              className="p-0.5 text-slate-600 hover:text-slate-900 active:scale-95"
              title="Vật phẩm tiếp theo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Khung Canvas Mascot tương tác */}
        <div className="relative w-36 h-36 flex items-center justify-center my-1 z-10">
          <canvas
            ref={canvasRef}
            width={140}
            height={140}
            className="w-32 h-32 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => {
              setPreviewLevel((prev) => (prev < 12 ? prev + 1 : 1));
              soundManager.playDrop();
            }}
            title="Chạm để đổi vật tư xem trước"
          />
        </div>

        <p className="text-[10px] text-slate-500 font-medium text-center z-10">
          {selectedSkinData.subtitle} • Chạm hình để chuyển xem 12 cấp vật tư
        </p>
      </div>

      {/* 2. DANH SÁCH 4 BỘ TRANG PHỤC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {COSMETIC_SKINS.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isActive = activeSkin === skin.id;
          const isSelected = selectedPreviewSkin === skin.id;

          return (
            <div
              key={skin.id}
              onClick={() => setSelectedPreviewSkin(skin.id)}
              className={`p-3 rounded-2xl border-2 flex flex-col justify-between gap-2.5 cursor-pointer transition-all ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-400/40 bg-white shadow-md'
                  : 'border-slate-200 bg-white/80 hover:border-teal-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: skin.themeColor }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">
                      {skin.name}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {skin.subtitle}
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9.5px] border border-emerald-300 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    ĐANG DÙNG
                  </span>
                ) : isUnlocked ? (
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-black text-[9.5px] border border-teal-200">
                    ĐÃ SỞ HỮU
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[9.5px] border border-amber-300 flex items-center gap-0.5">
                    <span>{skin.priceCoins}</span>
                    <span>🪙</span>
                  </span>
                )}
              </div>

              {/* Mô tả tính năng */}
              <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-relaxed">
                {skin.desc}
              </p>

              {/* Nút hành động */}
              <div className="pt-1">
                {isActive ? (
                  <button
                    disabled
                    className="w-full py-1.5 px-3 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs border border-emerald-200 cursor-default flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ĐANG TRANG BỊ</span>
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEquip(skin.id);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>SỬ DỤNG TRANG PHỤC</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBuy(skin.id, skin.priceCoins);
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-sm active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    <span>MỞ KHÓA ({skin.priceCoins} 🪙)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
