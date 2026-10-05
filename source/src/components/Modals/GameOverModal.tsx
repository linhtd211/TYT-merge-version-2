/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, BookOpen, Trophy, Sparkles } from 'lucide-react';
import { getItemConfigByLevel } from '../../game/config';
import { soundManager } from '../../game/audio';

interface GameOverModalProps {
  score: number;
  bestScore: number;
  isNewRecord: boolean;
  highestLevel: number;
  bestCombo: number;
  onRestart: () => void;
  onOpenCollection: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  isNewRecord,
  highestLevel,
  bestCombo,
  onRestart,
  onOpenCollection,
}) => {
  const highestItem = getItemConfigByLevel(highestLevel);
  const [canClick, setCanClick] = React.useState(false);

  React.useEffect(() => {
    // Chờ 650ms sau khi modal xuất hiện mới kích hoạt nút Chơi Lại,
    // ngăn ngừa triệt để tình trạng người chơi đang chạm màn hình vô tình kích hoạt restart làm mất sạch vật phẩm
    const timer = setTimeout(() => {
      setCanClick(true);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 16px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 16px)',
      }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-red-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Biểu tượng Cảnh báo quá tải */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
          ⚠️
        </div>

        {/* Tiêu đề Game Over */}
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          KHO VẬT TƯ QUÁ TẢI!
        </h2>
        <p className="text-xs font-medium text-slate-500 mt-0.5">
          Vật phẩm vượt vạch cảnh báo quá 4.5 giây.
        </p>

        {/* Nếu đạt kỷ lục mới */}
        {isNewRecord && (
          <div className="mt-3 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1 animate-pulse">
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            🏆 KỶ LỤC MỚI!
          </div>
        )}

        {/* Thẻ bảng điểm */}
        <div className="w-full bg-slate-50 rounded-2xl p-4 my-4 border border-slate-100 flex flex-col gap-2.5">
          {/* Điểm ván này */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-500">Điểm ca trực:</span>
            <span className="font-black text-2xl text-teal-800 tabular-nums">
              {score.toLocaleString('vi-VN')}
            </span>
          </div>

          <div className="h-px bg-slate-200 w-full" />

          {/* Kỷ lục */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Kỷ lục cao nhất:
            </span>
            <span className="font-bold text-slate-700 tabular-nums">
              {bestScore.toLocaleString('vi-VN')}
            </span>
          </div>

          {/* Cấp cao nhất đạt được */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Cấp cao nhất:</span>
            <span className="font-bold text-teal-700">
              {highestItem.name} (Lv.{highestLevel})
            </span>
          </div>

          {/* Combo tốt nhất */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500">Chuỗi combo tốt nhất:</span>
            <span className="font-bold text-amber-600">
              x{bestCombo}
            </span>
          </div>
        </div>

        {/* Hai nút hành động: Chơi lại & Xem bộ sưu tập */}
        <div className="w-full flex flex-col gap-2">
          <button
            disabled={!canClick}
            onClick={() => {
              if (!canClick) return;
              soundManager.playDrop();
              onRestart();
            }}
            className={`w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm tracking-wide shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer ${
              canClick
                ? 'hover:from-teal-600 hover:to-emerald-600 active:scale-95'
                : 'opacity-70 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            CHƠI LẠI
          </button>

          <button
            onClick={onOpenCollection}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            BỘ SƯU TẬP
          </button>
        </div>
      </div>
    </div>
  );
};
