/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Trophy, BookOpen, Settings, RotateCcw, Download, Zap, WifiOff, X, Save, AlertTriangle, Coins } from 'lucide-react';
import { soundManager } from '../../game/audio';
import { GameStorage } from '../../game/storage';
import { getItemConfigByLevel } from '../../game/config';
import { HomeTab } from '../../types/game';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { MissionsTab } from '../HomeScreen/MissionsTab';
import { SkinsTab } from '../HomeScreen/SkinsTab';

// ==========================================
// ICON CÁC TAB ĐIỀU HƯỚNG THEO HÌNH MẪU Y TẾ
// ==========================================
const StethoscopeTabIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0 drop-shadow-xs" fill="none">
    {/* Dây nghe tai U-tube */}
    <path
      d="M7 6 C7 14 11 18.5 16 18.5 C21 18.5 25 14 25 6"
      stroke="#06B6D4"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    {/* Nút tai trắng */}
    <circle cx="7" cy="6" r="2.2" fill="#FFFFFF" stroke="#0891B2" strokeWidth="0.9" />
    <circle cx="25" cy="6" r="2.2" fill="#FFFFFF" stroke="#0891B2" strokeWidth="0.9" />
    {/* Khớp nối chữ Y & đai hồng */}
    <rect x="13.5" y="17.5" width="5" height="4.5" rx="1.2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="0.9" />
    <rect x="13.5" y="20.5" width="5" height="2" rx="0.8" fill="#FB7185" />
    {/* Dây uốn nối mặt nghe */}
    <path
      d="M16 22.5 C16 28 21 29 23 26 C23.8 24.8 24 23 24 21.5"
      stroke="#06B6D4"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Trái tim hồng nổi bật cạnh mặt nghe */}
    <path
      d="M26.5 14.5 C26.5 12.2 23.8 12 23 14 C22.2 12 19.5 12.2 19.5 14.5 C19.5 17 23 19.5 23 19.5 C23 19.5 26.5 17 26.5 14.5 Z"
      fill="#FB7185"
    />
    {/* Mặt nghe tròn */}
    <circle cx="23" cy="21" r="4.2" fill="#FFFFFF" stroke="#0891B2" strokeWidth="1.2" />
    <circle cx="23" cy="21" r="2" fill="#06B6D4" />
  </svg>
);

const MedicalReportTabIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0 drop-shadow-xs" fill="none">
    {/* Tấm bìa kẹp hồ sơ màu tím than */}
    <rect x="3.5" y="4.5" width="18" height="24" rx="3.5" fill="#383D58" />
    {/* Kẹp tài liệu vàng cam ở đỉnh */}
    <rect x="8" y="2.5" width="9" height="4.5" rx="1.5" fill="#F59E0B" />
    <circle cx="12.5" cy="4.5" r="1.1" fill="#FDE68A" />
    {/* Trang giấy trắng */}
    <rect x="5.5" y="6.5" width="14" height="20" rx="2" fill="#FFFFFF" />
    {/* Huy hiệu ảnh hồ sơ xanh lá */}
    <circle cx="11" cy="11.5" r="3.2" fill="#6EE7B7" />
    <circle cx="11" cy="10.5" r="1.5" fill="#047857" />
    <path d="M8.5 13.2 C8.5 12 9.5 11.8 11 11.8 C12.5 11.8 13.5 12 13.5 13.2 Z" fill="#047857" />
    {/* Các dòng chữ thông tin */}
    <rect x="7" y="16" width="9.5" height="1.4" rx="0.7" fill="#64748B" />
    <rect x="7" y="18.8" width="7.8" height="1.4" rx="0.7" fill="#64748B" />
    <rect x="7" y="21.6" width="5.8" height="1.4" rx="0.7" fill="#64748B" />
    {/* Cây bút xanh chỉ vào hồ sơ */}
    <g transform="rotate(-38 23 10)">
      <rect x="20.5" y="8" width="4" height="11" rx="1.5" fill="#3B82F6" />
      <rect x="20.5" y="14" width="4" height="3" fill="#FFFFFF" />
      <polygon points="20.5,19 24.5,19 22.5,23.5" fill="#60A5FA" />
      <polygon points="21.8,22 23.2,22 22.5,24" fill="#1E3A8A" />
      <path d="M21 9 Q18 9 18 13 Q18 16 17 18" stroke="#383D58" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    {/* Huy hiệu dấu thập y tế tròn màu hồng đỏ */}
    <circle cx="23.5" cy="23.5" r="6.5" fill="#F43F5E" />
    <rect x="22.3" y="19.5" width="2.4" height="8" rx="0.8" fill="#FFFFFF" />
    <rect x="19.5" y="22.3" width="8" height="2.4" rx="0.8" fill="#FFFFFF" />
  </svg>
);

const DoctorCoatTabIcon: React.FC = () => (
  <svg viewBox="0 0 32 32" className="w-4 h-4 shrink-0 drop-shadow-xs" fill="none">
    {/* Nền tròn xanh ngọc cyan như trong ảnh doctor-coat.png */}
    <circle cx="16" cy="16" r="14.5" fill="#06B6D4" />
    {/* Đổ bóng nửa phải áo */}
    <path d="M16 5.5 L24.5 16 L20.5 19 L23 26 L16 26 Z" fill="#0891B2" opacity="0.35" />
    {/* Áo blouse trắng */}
    <path d="M10 5.5 L22 5.5 L22 26 L10 26 Z" fill="#FFFFFF" />
    {/* Cổ áo chữ V */}
    <polygon points="13.5,5.5 18.5,5.5 16,13.5" fill="#CBD5E1" />
    {/* Tay áo trái */}
    <path d="M10 6.5 L4.5 14.5 L7.5 16.5 L11 9.5 Z" fill="#F8FAFC" />
    {/* Tay áo phải */}
    <path d="M22 6.5 L27.5 14.5 L24.5 16.5 L21 9.5 Z" fill="#E2E8F0" />
    {/* Túi áo nhỏ bên vạt áo */}
    <rect x="11.5" y="18" width="3.8" height="4.5" rx="0.7" fill="#E2E8F0" />
    {/* Đường nẹp áo giữa */}
    <line x1="16" y1="13.5" x2="16" y2="26" stroke="#E2E8F0" strokeWidth="1" />
  </svg>
);

interface HomeScreenProps {
  bestScore: number;
  bestCombo: number;
  unlockedCount: number;
  totalItems: number;
  onPlay: (resume?: boolean) => void;
  onOpenCollection: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  bestScore,
  bestCombo,
  unlockedCount,
  totalItems,
  onPlay,
  onOpenCollection,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<HomeTab>('PLAY');
  const [coins, setCoins] = useState<number>(() => GameStorage.getCoins());
  const [activeSkin, setActiveSkin] = useState<string>(() => GameStorage.getActiveSkin());

  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const { isOnline } = useNetworkStatus();
  const [showIOSPrompt, setShowIOSPrompt] = useState<boolean>(false);
  const [showConfirmNewGame, setShowConfirmNewGame] = useState<boolean>(false);

  // Kiểm tra xem có ván chơi dở dang nào đã được lưu không
  const savedGame = GameStorage.getSavedGame();
  const hasSavedGame = savedGame !== null && savedGame.items && savedGame.items.length > 0;
  const highestSavedItem = hasSavedGame ? getItemConfigByLevel(savedGame.highestLevel || 1) : null;

  // Đếm số nhiệm vụ sẵn sàng nhận thưởng để hiển thị chấm đỏ thông báo
  const missionState = GameStorage.getDailyMissions();
  const unclaimedCount =
    missionState.missions.filter((m) => m.current >= m.target && !m.isClaimed).length +
    (missionState.missions.filter((m) => m.current >= m.target).length >= 3 && !missionState.milestoneClaimed ? 1 : 0);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
    } else {
      await install();
    }
  };

  const handleStartNewGame = () => {
    soundManager.initContext();
    soundManager.playDrop();
    GameStorage.clearSavedGame();
    onPlay(false);
  };

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-between px-3.5 sm:px-6 bg-gradient-to-b from-teal-50 via-sky-50 to-emerald-50 text-slate-800 overflow-y-auto"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 12px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 12px)',
        paddingLeft: 'calc(max(env(safe-area-inset-left, 0px), var(--sal, 0px)) + 14px)',
        paddingRight: 'calc(max(env(safe-area-inset-right, 0px), var(--sar, 0px)) + 14px)',
      }}
    >
      {/* 1. Header trên cùng: Kỷ lục & Số dư Xu Y Tế & Trạng thái Offline & Nút Cài đặt */}
      <div className="w-full flex items-center justify-between pt-0.5 gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {/* Huy hiệu Kỷ lục */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-teal-100 text-[11px] font-bold text-amber-700 shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{bestScore.toLocaleString('vi-VN')}</span>
          </div>

          {/* Huy hiệu Xu Y Tế 🪙 */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 backdrop-blur-md shadow-xs border border-amber-200 text-[11px] font-black text-amber-800 shrink-0">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>{coins.toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Huy hiệu Offline */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border shadow-xs ${
            isOnline
              ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
              : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
          }`}>
            {isOnline ? <Zap className="w-3 h-3 text-emerald-600 fill-emerald-500" /> : <WifiOff className="w-3 h-3 text-amber-600" />}
            <span className="hidden sm:inline">{isOnline ? 'Offline 100%' : 'Ngoại tuyến'}</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-xs border border-teal-100 text-slate-600 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
            title="Cài đặt"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* 2. Thanh chuyển Tab điều hướng (Segmented Control): CA TRỰC | NHIỆM VỤ | TRANG PHỤC */}
      <div className="w-full max-w-xs grid grid-cols-3 p-1 rounded-2xl bg-teal-900/10 backdrop-blur-md border border-teal-200/60 my-2 shadow-xs shrink-0">
        <button
          onClick={() => {
            soundManager.initContext();
            soundManager.playDrop();
            setActiveTab('PLAY');
          }}
          className={`py-1.5 px-1 rounded-xl text-[11.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'PLAY'
              ? 'bg-white text-teal-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center"><StethoscopeTabIcon /></span>
          <span>Ca Trực</span>
        </button>

        <button
          onClick={() => {
            soundManager.initContext();
            soundManager.playDrop();
            setActiveTab('MISSIONS');
          }}
          className={`relative py-1.5 px-1 rounded-xl text-[11.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'MISSIONS'
              ? 'bg-white text-teal-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center"><MedicalReportTabIcon /></span>
          <span>Nhiệm Vụ</span>
          {unclaimedCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse shrink-0" />
          )}
        </button>

        <button
          onClick={() => {
            soundManager.initContext();
            soundManager.playDrop();
            setActiveTab('SKINS');
          }}
          className={`py-1.5 px-1 rounded-xl text-[11.5px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'SKINS'
              ? 'bg-white text-teal-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center justify-center"><DoctorCoatTabIcon /></span>
          <span>Trang Phục</span>
        </button>
      </div>

      {/* 3. NỘI DUNG TỪNG TAB */}
      {activeTab === 'PLAY' && (
        <>
          {/* Khu vực Trung tâm: Tên Game & Chibi Doctor Mascot */}
          <div className="flex flex-col items-center text-center my-auto py-2">
            {/* Dấu thập đỏ phát sáng */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-200 mb-2 animate-bounce">
              ✚
            </div>

            {/* Tiêu đề Game */}
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-teal-900 drop-shadow-xs">
              TRẠM Y TẾ <span className="text-teal-600">MERGE</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-semibold text-teal-700/80 mt-0.5 max-w-xs">
              “Một ca trực thật bận rộn!”
            </p>

            {/* Mascot y tá Hamster / Gấu chibi (nhân vật vaccination.png) ở giữa với các vật phẩm bay quanh */}
            <div className="relative my-2 sm:my-4 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
              {/* Vòng hào quang sáng */}
              <div className="absolute inset-0 rounded-full bg-teal-200/40 blur-xl animate-pulse" />

              {/* Y tá Hamster minh họa sắc nét chuẩn hình mẫu */}
              <div className="relative z-10 w-28 h-28 sm:w-34 sm:h-34 flex items-center justify-center drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <svg viewBox="0 0 160 160" className="w-full h-full">
                  {/* Hai tai tròn */}
                  {/* Tai trái */}
                  <circle cx="40" cy="38" r="18" fill="#F7BD89" stroke="#C87A4A" strokeWidth="3" />
                  <circle cx="41" cy="39" r="10" fill="#FFF1E5" />
                  {/* Tai phải */}
                  <circle cx="120" cy="38" r="18" fill="#F7BD89" stroke="#C87A4A" strokeWidth="3" />
                  <circle cx="119" cy="39" r="10" fill="#FFF1E5" />

                  {/* Mũ y tá trắng chữ thập xanh ngọc (Teal Cyan) */}
                  <g>
                    <rect x="58" y="10" width="44" height="26" rx="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2.4" />
                    <rect x="75" y="14" width="10" height="18" rx="2" fill="#06B6D4" />
                    <rect x="71" y="18" width="18" height="10" rx="2" fill="#06B6D4" />
                  </g>

                  {/* Đầu phúng phính má hamster */}
                  <path
                    d="M 44 42 C 58 34, 102 34, 116 42 C 132 50, 140 66, 142 82 C 146 94, 142 106, 134 114 C 126 122, 114 126, 96 128 C 86 129, 74 129, 64 128 C 46 126, 34 122, 26 114 C 18 106, 14 94, 18 82 C 20 66, 28 50, 44 42 Z"
                    fill="#F7BD89"
                    stroke="#C87A4A"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />

                  {/* Vùng mõm kem sáng */}
                  <ellipse cx="80" cy="85" rx="26" ry="17" fill="#FFF6EC" />

                  {/* Mũi trái tim hồng */}
                  <path
                    d="M 80 73 C 76 69, 72 74, 80 78 C 88 74, 84 69, 80 73 Z"
                    fill="#F43F5E"
                  />
                  <line x1="80" y1="78" x2="80" y2="83" stroke="#946648" strokeWidth="1.8" />

                  {/* Miệng cười hở răng vui vẻ */}
                  <path d="M 68 83 Q 80 100 92 83 Z" fill="#F43F5E" stroke="#334155" strokeWidth="2.4" />
                  <path d="M 70 83.5 Q 80 90 90 83.5 L 90 83 L 70 83 Z" fill="#FFFFFF" />

                  {/* Đôi mắt cong vòm vui sướng ^  ^ */}
                  <path d="M 58 68 Q 67 56 74 68" fill="none" stroke="#334155" strokeWidth="3.6" strokeLinecap="round" />
                  <path d="M 86 68 Q 93 56 102 68" fill="none" stroke="#334155" strokeWidth="3.6" strokeLinecap="round" />

                  {/* Hai má hồng to tròn */}
                  <circle cx="44" cy="83" r="12" fill="#FB7185" opacity="0.85" />
                  <circle cx="116" cy="83" r="12" fill="#FB7185" opacity="0.85" />

                  {/* Ống tiêm y tế xanh ngọc cầm trên tay (như trong ảnh vaccination.png) */}
                  <g transform="rotate(-30 65 115)">
                    {/* Kim tiêm trắng */}
                    <polygon points="12,118 42,114 42,122" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
                    {/* Thân ống tiêm cyan */}
                    <rect x="42" y="106" width="52" height="24" rx="4" fill="#22D3EE" stroke="#0891B2" strokeWidth="2.2" />
                    {/* Vạch chia thuốc */}
                    <line x1="56" y1="110" x2="56" y2="126" stroke="#0891B2" strokeWidth="2" />
                    <line x1="68" y1="110" x2="68" y2="126" stroke="#0891B2" strokeWidth="2" />
                    <line x1="80" y1="110" x2="80" y2="126" stroke="#0891B2" strokeWidth="2" />
                    {/* Pít-tông trắng */}
                    <rect x="94" y="112" width="24" height="12" rx="2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                    <circle cx="120" cy="118" r="9" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="2" />
                  </g>

                  {/* Hai bàn tay gấu tròn ôm ống tiêm */}
                  <circle cx="62" cy="120" r="12" fill="#F7BD89" stroke="#C87A4A" strokeWidth="2.8" />
                  <circle cx="108" cy="126" r="12" fill="#F7BD89" stroke="#C87A4A" strokeWidth="2.8" />
                </svg>
              </div>

              {/* Các vật tư y tế chibi bay xung quanh */}
              <div className="absolute -top-1 left-2 animate-bounce text-xl" style={{ animationDuration: '2.5s' }}>
                💊
              </div>
              <div className="absolute top-2 -right-1 animate-bounce text-xl" style={{ animationDuration: '3.1s' }}>
                🩹
              </div>
              <div className="absolute -bottom-1 -left-1 animate-bounce text-xl" style={{ animationDuration: '2.8s' }}>
                🧴
              </div>
              <div className="absolute -bottom-2 right-2 animate-bounce text-xl" style={{ animationDuration: '3.4s' }}>
                🩺
              </div>
            </div>

            {/* Điểm thống kê nhỏ */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-1">
              <span>Combo cao nhất: <strong className="text-teal-700">x{bestCombo}</strong></span>
              <span>·</span>
              <span>Bộ sưu tập: <strong className="text-teal-700">{unlockedCount}/{totalItems}</strong></span>
            </div>
          </div>

          {/* Khu vực Nút bấm chính */}
          <div className="w-full max-w-xs flex flex-col gap-2 pb-2">
            {/* Trường hợp 1: ĐANG CÓ VÁN CHƠI DỞ DANG ĐÃ LƯU */}
            {hasSavedGame ? (
              <div className="flex flex-col gap-2 p-2.5 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-emerald-300 shadow-xl shadow-teal-900/10">
                {/* Header ván chơi dở dang */}
                <div className="flex items-center justify-between px-1">
                  <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 uppercase tracking-wider">
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    Ván chơi dở dang
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {GameStorage.formatSavedTime(savedGame.savedAt)}
                  </span>
                </div>

                {/* Chi tiết ván chơi */}
                <div className="p-2 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9.5px] font-extrabold text-slate-500 uppercase">Điểm đang có</span>
                    <span className="text-base font-black text-emerald-700 tabular-nums">
                      {savedGame.score.toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9.5px] font-extrabold text-slate-500 uppercase">Đang xếp</span>
                    <span className="text-xs font-black text-teal-800">
                      {savedGame.items.length} vật tư {highestSavedItem ? `• Lv.${highestSavedItem.level} ${highestSavedItem.name}` : ''}
                    </span>
                  </div>
                </div>

                {/* Nút Tiếp Tục Ván Chơi Dở Dang */}
                <button
                  onClick={() => {
                    soundManager.initContext();
                    soundManager.playDrop();
                    onPlay(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black shadow-lg shadow-emerald-500/25 hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-emerald-200"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span className="text-base font-black tracking-wide">TIẾP TỤC VÁN CHƠI</span>
                </button>

                {/* Nút Bắt Đầu Ván Mới */}
                <button
                  onClick={() => {
                    if (savedGame.score > 200 || savedGame.items.length > 3) {
                      setShowConfirmNewGame(true);
                    } else {
                      handleStartNewGame();
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold text-[11px] active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  <span>Bỏ ván này & Chơi ván mới</span>
                </button>
              </div>
            ) : (
              /* Trường hợp 2: KHÔNG CÓ VÁN CHƠI DỞ DANG -> BẮT ĐẦU MỚI */
              <button
                onClick={() => {
                  soundManager.initContext();
                  soundManager.playDrop();
                  onPlay(false);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-lg tracking-wide shadow-lg shadow-teal-500/25 hover:from-teal-600 hover:to-emerald-600 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border-2 border-teal-200"
              >
                <Play className="w-6 h-6 fill-current" />
                BẮT ĐẦU CA TRỰC
              </button>
            )}

            {/* Nút Cài đặt ứng dụng chơi Offline nếu chưa cài đặt */}
            {canInstall && !isInstalled && (
              <button
                onClick={handleInstallClick}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-sky-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cài đặt ứng dụng chơi Offline</span>
              </button>
            )}

            {/* Hàng nút phụ: Bộ sưu tập */}
            <button
              onClick={onOpenCollection}
              className="w-full py-2 px-3 rounded-xl bg-white/90 backdrop-blur-md border border-teal-200 text-teal-800 font-bold text-xs hover:bg-teal-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-teal-600" />
              BỘ SƯU TẬP VẬT TƯ
            </button>

            {/* Banner cam kết Offline */}
            <div className="text-center text-[10.5px] font-semibold text-teal-800/80 pt-0.5">
              ✓ Hỗ trợ chơi Ngoại tuyến 100% & Tự động lưu
            </div>
          </div>
        </>
      )}

      {/* TAB 2: NHIỆM VỤ HÀNG NGÀY (DAILY MISSIONS) */}
      {activeTab === 'MISSIONS' && (
        <MissionsTab
          coins={coins}
          onCoinsChange={setCoins}
          onSkinUnlocked={setActiveSkin}
        />
      )}

      {/* TAB 3: TRANG PHỤC GIAO DIỆN (COSMETIC SKINS) */}
      {activeTab === 'SKINS' && (
        <SkinsTab
          coins={coins}
          onCoinsChange={setCoins}
          activeSkin={activeSkin}
          onActiveSkinChange={setActiveSkin}
        />
      )}

      {/* Modal xác nhận bắt đầu ván mới khi đang có ván dở dang */}
      {showConfirmNewGame && (
        <div className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-2 border-amber-300 text-center animate-in zoom-in-95">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-black text-sm text-slate-800 mb-1">
              BỎ VÁN CHƠI DỞ DANG?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Bạn đang có một ván chơi với <strong>{savedGame?.score.toLocaleString('vi-VN')} điểm</strong> ({savedGame?.items.length} vật phẩm). Nếu chơi ván mới, tiến trình này sẽ bị xóa.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowConfirmNewGame(false);
                  handleStartNewGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs cursor-pointer"
              >
                Xóa & Chơi mới
              </button>
              <button
                onClick={() => setShowConfirmNewGame(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Giữ lại ván cũ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hướng dẫn thêm vào màn hình chính trên iOS Safari */}
      {showIOSPrompt && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border-2 border-teal-200 text-center animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="font-black text-sm text-teal-900 flex items-center gap-1.5">
                📲 Cài đặt trên iPhone / iPad
              </span>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-700 space-y-3 text-left font-medium">
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">1</span>
                <span>Chạm biểu tượng <strong>Chia sẻ (Share) ⎋</strong> ở thanh dưới cùng Safari.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">2</span>
                <span>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" ⊞ (Add to Home Screen)</strong>.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">3</span>
                <span>Mở game từ Màn hình chính để chơi <strong>toàn màn hình và 100% Offline</strong> không cần mạng!</span>
              </p>
            </div>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

