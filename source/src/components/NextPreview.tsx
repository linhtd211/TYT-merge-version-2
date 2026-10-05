/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { prepareCanvas } from '../game/canvasQuality';
import React, { useEffect, useRef } from 'react';
import { getItemConfigByLevel } from '../game/config';
import { drawMedicalMascot } from '../game/renderer';

interface NextPreviewProps {
  nextLevel: number;
}

export const NextPreview: React.FC<NextPreviewProps> = ({ nextLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const config = getItemConfigByLevel(nextLevel);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, 48, 48);
    if (!ctx) return;

    ctx.clearRect(0, 0, 48, 48);
    // Vẽ mascot tiếp theo ở kích thước vừa vặn trong ô
    drawMedicalMascot(
      ctx,
      48 / 2,
      48 / 2,
      nextLevel,
      0,
      1.0,
      'happy',
      performance.now(),
      20 // bán kính nhỏ gọn cho ô preview
    );
  }, [nextLevel]);

  return (
    <div className="flex flex-col items-center bg-white/90 backdrop-blur-md rounded-2xl p-1.5 shadow-sm border border-teal-100">
      <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 mb-0.5">
        TIẾP THEO
      </span>
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-teal-50/60 relative">
        <canvas
          ref={canvasRef}
          width={48}
          height={48}
          className="w-12 h-12"
        />
      </div>
      <span className="text-[9px] font-bold text-slate-600 mt-0.5 max-w-[64px] truncate text-center">
        {config.name}
      </span>
    </div>
  );
};
