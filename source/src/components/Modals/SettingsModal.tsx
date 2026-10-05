/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Volume2, VolumeX, Music, Trash2, HelpCircle, Save, Wifi, WifiOff, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../game/audio';
import { GameStorage } from '../../game/storage';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface SettingsModalProps {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  onResetData: () => void;
  onClose: () => void;
  onManualSave?: () => void;
  lastSavedTime?: number | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
  onResetData,
  onClose,
  onManualSave,
  lastSavedTime,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { isOnline } = useNetworkStatus();
  const savedGame = GameStorage.getSavedGame();

  const handleSaveClick = () => {
    if (onManualSave) {
      onManualSave();
      soundManager.playNewItem();
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  return (
    <div
      className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 16px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 16px)',
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-black text-slate-800">CÀI ĐẶT TRẠM Y TẾ</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Các mục cài đặt */}
        <div className="my-4 space-y-3">
          {/* Chế độ chơi Offline & Lưu trữ */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-teal-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-xs text-teal-900">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-emerald-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-600" />
                )}
                <span>CHẾ ĐỘ OFFLINE 100%</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                isOnline
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {isOnline ? 'Sẵn sàng Offline' : 'Đang Ngoại tuyến'}
              </span>
            </div>

            <p className="text-[11px] font-medium text-teal-800/90 leading-relaxed">
              Trò chơi hoạt động độc lập không cần Internet. Tất cả thao tác thả và hợp nhất đều được <strong>tự động lưu dở dang</strong> trên máy.
            </p>

            {/* Nút lưu thủ công khi đang trong ván chơi */}
            {onManualSave && (
              <div className="pt-1">
                <button
                  onClick={handleSaveClick}
                  disabled={justSaved}
                  className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer ${
                    justSaved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
                  }`}
                >
                  {justSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>ĐÃ LƯU VÁN CHƠI THÀNH CÔNG!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>LƯU VÁN CHƠI DỞ DANG NGAY</span>
                    </>
                  )}
                </button>
                {lastSavedTime && (
                  <p className="text-[10px] text-teal-700 text-center mt-1">
                    Đã lưu: {GameStorage.formatSavedTime(lastSavedTime)}
                  </p>
                )}
              </div>
            )}

            {!onManualSave && savedGame && (
              <div className="pt-1 text-[11px] text-teal-900 bg-white/70 rounded-xl p-2 border border-teal-100">
                <div className="font-bold flex items-center gap-1">
                  <span>💾 Ván chơi đang chờ tiếp tục:</span>
                </div>
                <div className="mt-0.5 text-teal-700 font-semibold">
                  {savedGame.score.toLocaleString('vi-VN')} điểm • {savedGame.items.length} vật tư • Lưu {GameStorage.formatSavedTime(savedGame.savedAt)}
                </div>
              </div>
            )}
          </div>

          {/* Âm thanh hiệu ứng (SFX) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              {sfxEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-xs font-bold text-slate-700">
                Âm thanh hiệu ứng (SFX)
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.initContext();
                onToggleSfx();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                sfxEnabled ? 'bg-teal-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Nhạc nền (Music) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <Music
                className={`w-5 h-5 ${
                  musicEnabled ? 'text-teal-600' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold text-slate-700">
                Nhạc nền du dương (BGM)
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.initContext();
                onToggleMusic();
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                musicEnabled ? 'bg-teal-500 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Hướng dẫn cách chơi vắn tắt */}
          <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-100 text-xs text-teal-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-teal-800 mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>Cách chơi:</span>
            </div>
            <p>• Kéo ngang và thả tay để thả vật phẩm y tế vào thùng.</p>
            <p>• Hai vật CÙNG CẤP chạm nhau sẽ hợp nhất (Merge) thành vật cấp cao hơn.</p>
            <p>• Đừng để vật phẩm vượt quá VẠCH CẢNH BÁO QUÁ TẢI trong 4.5 giây!</p>
          </div>

          {/* Xóa dữ liệu & Kỷ lục */}
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Đặt lại toàn bộ kỷ lục & dữ liệu
            </button>
          ) : (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 flex flex-col gap-2">
              <p className="text-[11px] font-bold text-red-800 text-center">
                Bạn có chắc chắn muốn xóa hết kỷ lục, bộ sưu tập và ván chơi đã lưu?
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    GameStorage.resetAllData();
                    onResetData();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
                >
                  Xác nhận xóa
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 active:scale-98 transition-all cursor-pointer"
        >
          XONG
        </button>
      </div>
    </div>
  );
};
