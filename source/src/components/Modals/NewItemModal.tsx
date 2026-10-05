/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { getItemConfigByLevel } from '../../game/config';
import { drawMedicalMascot } from '../../game/renderer';
import { soundManager } from '../../game/audio';

interface NewItemModalProps {
  level: number;
  onContinue: () => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({ level, onContinue }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const config = getItemConfigByLevel(level);

  useEffect(() => {
    soundManager.playNewItem();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMedicalMascot(
      ctx,
      canvas.width / 2,
      canvas.height / 2,
      level,
      0,
      1.15,
      'merge_excited',
      performance.now(),
      36
    );
  }, [level]);

  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 16px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 16px)',
      }}
    >
      <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Huy hiệu lấp lánh */}
        <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black flex items-center gap-1 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          ✨ VẬT PHẨM MỚI!
        </div>

        {/* Khung vẽ Mascot phóng to với vầng hào quang */}
        <div className="relative w-28 h-28 flex items-center justify-center my-2">
          <div className="absolute inset-0 rounded-full bg-amber-200/50 blur-lg animate-pulse" />
          <canvas
            ref={canvasRef}
            width={110}
            height={110}
            className="w-28 h-28 relative z-10"
          />
        </div>

        {/* Tên vật phẩm & Cấp bậc */}
        <div className="my-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">
            Cấp {level} · {config.score} điểm
          </span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
            {config.name}
          </h2>
          <p className="text-xs font-medium text-slate-600 mt-1 max-w-[220px]">
            {config.shortDesc}
          </p>
        </div>

        {/* Nút Tiếp tục */}
        <button
          onClick={() => {
            soundManager.playDrop();
            onContinue();
          }}
          className="mt-4 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm tracking-wide shadow-md shadow-teal-500/20 hover:from-teal-600 hover:to-emerald-600 active:scale-95 transition-all cursor-pointer"
        >
          TIẾP TỤC CA TRỰC
        </button>
      </div>
    </div>
  );
};
