/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import panelsArt from '../../public/art/play-panels.webp?url';
import React, { useEffect, useRef } from 'react';
import { BookOpen } from 'lucide-react';
import { drawMedicalMascot } from '../game/renderer';

interface TopPanelsProps {
  nextLevel: number;
  unlockedCount: number;
  totalItems: number;
  onOpenCollection: () => void;
}

export const TopPanels: React.FC<TopPanelsProps> = ({
  nextLevel,
  unlockedCount,
  totalItems,
  onOpenCollection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const render = () => {
    const width = canvas.clientWidth || 52;
    const height = canvas.clientHeight || 48;
    const ratio = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);

    // Vẽ bóng đổ mềm mại dưới chân vật phẩm trong ô NEXT
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.beginPath();
    ctx.ellipse(width / 2, height / 2 + 18, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Vẽ vật phẩm tiếp theo với tỷ lệ vừa vặn và bóng bẩy
    drawMedicalMascot(
      ctx,
      width / 2,
      height / 2,
      nextLevel,
      0,
      0.95,
      'happy',
      performance.now(),
      Math.min(width, height) * 0.46
    );
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    window.addEventListener('skin-change', render);
    return () => {
      observer.disconnect();
      window.removeEventListener('skin-change', render);
    };
  }, [nextLevel]);
  return (
    <div className="play-panels" style={{backgroundImage:`url(${panelsArt})`}}>
      <span className="sr-only">Một ca trực thật bận rộn! Cố gắng ghép được nhiều vật tư nhé!</span>
      <canvas ref={canvasRef} className="play-next-canvas" aria-label="Vật tư tiếp theo"/>
      <button onClick={onOpenCollection} className="play-collection" title="Mở Bộ sưu tập" aria-label="BỘ SƯU TẬP"><strong>{unlockedCount} / {totalItems}</strong></button>
    </div>
  );
};
