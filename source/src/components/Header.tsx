/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings, Volume2, VolumeX, Crown, Home, WifiOff, Save, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../game/audio';

interface HeaderProps {
  score: number;
  bestScore: number;
  combo: number;
  onOpenSettings: () => void;
  sfxEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
  isOnline?: boolean;
  onSaveNow?: () => void;
  isSavedRecently?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  combo,
  onOpenSettings,
  sfxEnabled,
  onToggleSound,
  onGoHome,
  isOnline = true,
  onSaveNow,
  isSavedRecently = false,
}) => {
  return (
    <header
      className="w-full px-2 sm:px-2.5 pb-0.5 sm:pb-1 flex items-center justify-between z-20 shrink-0"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 8px)',
        paddingLeft: 'calc(max(env(safe-area-inset-left, 0px), var(--sal, 0px)) + 8px)',
        paddingRight: 'calc(max(env(safe-area-inset-right, 0px), var(--sar, 0px)) + 8px)',
      }}
    >
      {/* Cụm nút bên trái: Về trang chủ & Nút Lưu ván chơi & Cài đặt */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center shadow-md shadow-amber-500/30 border-2 border-white active:scale-95 transition-all cursor-pointer"
            title="Tạm dừng & Về trang chủ (Đã tự động lưu)"
            aria-label="Về trang chủ"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
          </button>
        )}

        {/* Nút lưu ván chơi dở dang thủ công */}
        {onSaveNow && (
          <button
            onClick={onSaveNow}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition-all cursor-pointer ${
              isSavedRecently
                ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-b from-teal-400 to-teal-600 text-white shadow-teal-500/30'
            }`}
            title="Lưu ván chơi dở dang (Hỗ trợ chơi Offline)"
            aria-label="Lưu ván chơi"
          >
            {isSavedRecently ? (
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs text-white" />
            ) : (
              <Save className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
            )}
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-b from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-500/30 border-2 border-white active:scale-95 transition-all cursor-pointer"
          title="Cài đặt & Chế độ Offline"
          aria-label="Cài đặt"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
        </button>
      </div>

      {/* Bảng hiệu gỗ: TRẠM Y TẾ MERGE + Bảng điểm gỗ nâu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Bảng hiệu gỗ TRẠM Y TẾ MERGE */}
        <div className="relative px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-2xl bg-gradient-to-b from-[#E7B988] to-[#C99156] border-2 border-[#8C5824] shadow-md flex items-center gap-1.5">
          {/* Dấu thập y tế đỏ */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white border border-red-200 flex items-center justify-center shadow-xs shrink-0">
            <span className="text-red-500 font-black text-xs sm:text-sm leading-none">✚</span>
          </div>

          <div className="flex flex-col items-start leading-none">
            <span className="text-[9px] sm:text-[10px] font-black text-sky-800 tracking-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
              TRẠM Y TẾ
            </span>
            <span className="text-[11px] sm:text-xs font-black text-amber-900 tracking-wider drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
              MERGE
            </span>
          </div>
        </div>

        {/* Khung gỗ nâu chứa ĐIỂM và KỶ LỤC */}
        <div className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-2xl bg-gradient-to-b from-[#7A4B24] to-[#593415] border-2 border-[#42240C] shadow-md flex items-center gap-2.5 sm:gap-3 text-white">
          {/* Điểm hiện tại */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-[#E7B988] tracking-wider leading-tight">
              ĐIỂM
            </span>
            <span className="text-xs sm:text-base font-black text-white tabular-nums tracking-wide leading-tight">
              {score.toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Vạch chia nhỏ */}
          <div className="w-px h-4 sm:h-5 bg-[#966336]" />

          {/* Kỷ lục có vương miện vàng */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[9px] font-extrabold uppercase text-amber-300 tracking-wider flex items-center gap-0.5 leading-tight">
              <Crown className="w-2.5 h-2.5 fill-amber-300 text-amber-300 inline" />
              KỶ LỤC
            </span>
            <span className="text-xs sm:text-base font-black text-amber-200 tabular-nums tracking-wide leading-tight">
              {bestScore.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      </div>

      {/* Cụm nút bên phải: Chỉ báo Offline (nếu mất mạng) & Nút Âm thanh */}
      <div className="flex items-center gap-1.5 shrink-0">
        {!isOnline && (
          <div
            className="px-1.5 sm:px-2 py-1 rounded-xl bg-amber-500/90 text-white text-[9.5px] sm:text-[10px] font-black flex items-center gap-1 shadow-sm border border-amber-300 animate-pulse"
            title="Đang chơi ở chế độ Ngoại tuyến (Offline) - Ván chơi vẫn được lưu đầy đủ"
          >
            <WifiOff className="w-3 h-3" />
            <span className="hidden sm:inline">Offline</span>
          </div>
        )}

        {/* Nút Âm thanh tròn xanh biển viền trắng giống ảnh mẫu */}
        <button
          onClick={() => {
            soundManager.initContext();
            onToggleSound();
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md border-2 border-white active:scale-95 transition-all cursor-pointer ${
            sfxEnabled
              ? 'bg-gradient-to-b from-sky-400 to-sky-600 text-white shadow-sky-500/30'
              : 'bg-gradient-to-b from-slate-400 to-slate-600 text-slate-200 shadow-slate-500/20'
          }`}
          title={sfxEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          aria-label="Bật tắt âm thanh"
        >
          {sfxEnabled ? (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
          ) : (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-xs" />
          )}
        </button>
      </div>
    </header>
  );
};
