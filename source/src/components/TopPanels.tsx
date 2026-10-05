/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
      0.78,
      'happy',
      performance.now()
    );
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    window.addEventListener('royal-visual-change', render);
    return () => {
      observer.disconnect();
      window.removeEventListener('royal-visual-change', render);
    };
  }, [nextLevel]);

  return (
    <div className="w-full px-2 sm:px-3 pt-0.5 pb-0.5 sm:pt-1 sm:pb-1 flex items-center justify-between z-15 pointer-events-auto shrink-0 select-none">
      {/* 1. BẢNG KẸP HỒ SƠ Y TẾ 3D (CLIPBOARD) BÊN TRÁI GIỐNG ẢNH MẪU 100% */}
      <div className="relative w-36 sm:w-44 p-1.5 sm:p-2 pt-2.5 rounded-2xl bg-gradient-to-b from-[#E7B988] via-[#D89F62] to-[#B97738] border-[2.5px] border-[#8C5824] shadow-[0_4px_0_#6B3E13,0_6px_8px_rgba(0,0,0,0.25)] flex items-start gap-1 sm:gap-1.5 shrink-0">
        {/* Kẹp sắt màu xanh kim loại 3D phía trên có vệt bóng sáng */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3.5 bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0369A1] rounded-md border-2 border-white shadow-[0_1.5px_2px_rgba(0,0,0,0.3)] flex items-center justify-center">
          <div className="w-4 h-1 bg-white/70 rounded-full" />
        </div>

        {/* Tờ giấy kẹp hồ sơ viền bo 3D */}
        <div className="w-full bg-[#FFFDF5] rounded-xl p-1.5 border border-[#DECCA6] shadow-inner flex items-start gap-1.5">
          {/* Avatar y tá chibi dễ thương theo hình mẫu mascot y tế (thay thế emoji mặc định) */}
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-teal-50 via-sky-100 to-amber-100 border-2 border-white shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              {/* Hai tai tròn */}
              <circle cx="10" cy="11" r="5.2" fill="#F7BD89" stroke="#C87A4A" strokeWidth="1.2" />
              <circle cx="10.5" cy="11.5" r="2.8" fill="#FFF1E5" />
              <circle cx="30" cy="11" r="5.2" fill="#F7BD89" stroke="#C87A4A" strokeWidth="1.2" />
              <circle cx="29.5" cy="11.5" r="2.8" fill="#FFF1E5" />

              {/* Mũ y tá trắng chữ thập xanh ngọc (Teal Cyan) */}
              <rect x="14" y="2" width="12" height="8" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.9" />
              <rect x="18.8" y="3.5" width="2.4" height="5" rx="0.5" fill="#06B6D4" />
              <rect x="17.5" y="4.8" width="5" height="2.4" rx="0.5" fill="#06B6D4" />

              {/* Đầu tròn má phúng phính */}
              <path
                d="M 11 12 C 15 9, 25 9, 29 12 C 34 14, 36 19, 36 24 C 36 28, 33 33, 26 35 C 22 36, 18 36, 14 35 C 7 33, 4 28, 4 24 C 4 19, 6 14, 11 12 Z"
                fill="#F7BD89"
                stroke="#C87A4A"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Vùng mõm kem sáng */}
              <ellipse cx="20" cy="24.5" rx="7.5" ry="5.2" fill="#FFF6EC" />

              {/* Mũi trái tim hồng */}
              <path d="M 20 21.5 C 19 20.3, 17.8 21.6, 20 23 C 22.2 21.6, 21 20.3, 20 21.5 Z" fill="#F43F5E" />
              <line x1="20" y1="23" x2="20" y2="24.2" stroke="#946648" strokeWidth="0.8" />

              {/* Miệng cười hở răng vui vẻ */}
              <path d="M 16.8 24.2 Q 20 29 23.2 24.2 Z" fill="#F43F5E" stroke="#334155" strokeWidth="0.9" />
              <path d="M 17.5 24.4 Q 20 26.2 22.5 24.4 L 22.5 24.2 L 17.5 24.2 Z" fill="#FFFFFF" />

              {/* Đôi mắt cong vòm vui tươi ^ ^ */}
              <path d="M 14 20 Q 16.5 16.8 18.5 20" fill="none" stroke="#334155" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M 21.5 20 Q 23.5 16.8 26 20" fill="none" stroke="#334155" strokeWidth="1.3" strokeLinecap="round" />

              {/* Má hồng tròn xinh */}
              <circle cx="10.5" cy="24" r="3.5" fill="#FB7185" opacity="0.85" />
              <circle cx="29.5" cy="24" r="3.5" fill="#FB7185" opacity="0.85" />

              {/* Hai bàn tay tròn nhỏ ôm dưới cằm */}
              <circle cx="14" cy="35" r="3.2" fill="#F7BD89" stroke="#C87A4A" strokeWidth="1" />
              <circle cx="26" cy="35" r="3.2" fill="#F7BD89" stroke="#C87A4A" strokeWidth="1" />
            </svg>
          </div>

          {/* Lời dặn dò của bác sĩ */}
          <div className="flex-1 leading-tight overflow-hidden">
            <p className="text-[9px] sm:text-[10px] font-black text-slate-800 leading-tight">
              Một ca trực thật bận rộn
            </p>
            <p className="text-[8px] sm:text-[8.5px] font-semibold text-slate-600 leading-tight mt-0.5">
              Cố gắng ghép được nhiều vật tư nhé! <span className="text-red-500">❤️</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. KHU VỰC BÊN PHẢI: Ô NEXT 3D & NÚT BỘ SƯU TẬP 3D */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Ô NEXT 3D NỔI BẬT CÓ CHỮ "NEXT" 3D NẰM PHÍA TRÊN */}
        <div className="relative flex flex-col items-center">
          {/* Chữ 3D "NEXT" nổi phía trên */}
          <span
            className="text-[11px] sm:text-[12px] font-black text-[#0284C7] tracking-wider leading-none mb-0.5"
            style={{
              textShadow:
                '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF, 0 1.5px 0 #075985, 0 2px 2px rgba(0,0,0,0.3)',
            }}
          >
            NEXT
          </span>

          {/* Khung ô NEXT bo tròn 3D có viền cyan nổi */}
          <div className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#FFFDF5] to-[#FEF3C7] border-[3px] border-[#38BDF8] shadow-[0_4px_0_#0284C7,0_6px_8px_rgba(0,0,0,0.2)] p-1">
            <div className="w-12 h-11 sm:w-13 sm:h-12 flex items-center justify-center relative">
              <canvas ref={canvasRef} width={60} height={50} className="w-12 h-11 sm:w-13 sm:h-12" />
            </div>
          </div>
        </div>

        {/* NÚT BỘ SƯU TẬP 3D MÀU XANH BIỂN CHUẨN VIỀN TRẮNG DÀY */}
        <button
          onClick={onOpenCollection}
          className="relative flex flex-col items-center justify-center w-16 h-17 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-b from-[#38BDF8] via-[#0EA5E9] to-[#0284C7] border-[3px] border-white shadow-[0_4px_0_#075985,0_6px_8px_rgba(0,0,0,0.25)] text-white p-1 active:translate-y-[2px] active:shadow-[0_2px_0_#075985] transition-all cursor-pointer overflow-hidden group shrink-0"
          title="Mở Bộ sưu tập"
        >
          {/* Vệt bóng kính cong specular trên đỉnh */}
          <div className="absolute top-0.5 left-1.5 right-1.5 h-2 bg-white/40 rounded-full blur-[0.5px] pointer-events-none" />

          <BookOpen className="w-5 h-5 text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.4)] mb-0.5 group-hover:scale-105 transition-transform" />
          <span
            className="text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-tight leading-none text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
          >
            BỘ SƯU TẬP
          </span>
          <span className="text-[12px] sm:text-[13px] font-black tracking-wide text-white drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.5)] mt-0.5">
            {unlockedCount} / {totalItems}
          </span>
        </button>
      </div>
    </div>
  );
};
