/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Check, ArrowRight } from 'lucide-react';
import { soundManager } from '../../game/audio';

export interface GiftRewardItem {
  type: 'picker' | 'disinfect' | 'swap';
  name: string;
  icon: string;
  count: number;
  desc: string;
  color: string;
  bgGradient: string;
}

interface GiftBoxModalProps {
  reason: string;
  title?: string;
  rewards: GiftRewardItem[];
  onClaim: () => void;
}

export const GiftBoxModal: React.FC<GiftBoxModalProps> = ({
  reason,
  title = 'HỘP QUÀ TIẾP TẾ Y TẾ',
  rewards,
  onClaim,
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [showRays, setShowRays] = useState<boolean>(true);

  // Mở hộp quà khi người chơi chạm vào
  const handleOpenBox = () => {
    if (isOpened) return;
    setIsOpened(true);
    soundManager.playGiftBox();
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 16px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 16px)',
      }}
    >
      <div className="relative w-full max-w-sm bg-gradient-to-b from-white via-[#FFFDF8] to-[#FFF6E5] rounded-3xl p-6 shadow-2xl border-2 border-amber-300 flex flex-col items-center text-center overflow-hidden">
        {/* Vầng hào quang ánh sáng xoay tròn phía sau */}
        <div className="absolute -top-12 -bottom-12 -left-12 -right-12 pointer-events-none opacity-40 overflow-hidden flex items-center justify-center">
          <div className="w-[450px] h-[450px] bg-gradient-to-tr from-amber-300/30 via-yellow-200/50 to-transparent rounded-full blur-2xl animate-spin-slow" />
        </div>

        {/* 1. Tiêu đề và Lý do nhận quà */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black tracking-wide shadow-md flex items-center gap-1.5 mb-2">
            <Gift className="w-3.5 h-3.5 animate-bounce" />
            {title}
          </div>

          <p className="text-xs font-extrabold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-200 shadow-xs mb-3">
            {reason}
          </p>
        </div>

        {/* 2. KHU VỰC HIỆU ỨNG HỘP QUÀ */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center my-3 min-h-[170px]">
          {!isOpened ? (
            /* TRẠNG THÁI CHƯA MỞ: Hộp quà đang nhảy nhót mời gọi */
            <div
              onClick={handleOpenBox}
              className="group cursor-pointer flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {/* Hộp quà 3D rực rỡ với ruy băng đỏ */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* Vầng sáng phía sau */}
                <div className="absolute inset-0 rounded-full bg-amber-400/40 blur-xl animate-pulse" />

                {/* Hộp quà lớn lắc lư */}
                <div className="relative text-7xl filter drop-shadow-xl animate-bounce">
                  🎁
                </div>

                {/* Các ngôi sao lấp lánh xung quanh */}
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-ping" />
                <Sparkles className="w-4 h-4 text-yellow-300 absolute -bottom-1 -left-1 animate-pulse" />
              </div>

              {/* Dòng chữ hướng dẫn chạm để mở */}
              <div className="mt-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-md border border-white animate-pulse">
                ✨ CHẠM VÀO ĐỂ MỞ QUÀ! ✨
              </div>
            </div>
          ) : (
            /* TRẠNG THÁI ĐÃ MỞ: Nắp hộp bung ra, quà xuất hiện với hào quang */
            <div className="w-full flex flex-col items-center animate-in zoom-in-75 duration-300">
              {/* Hiệu ứng tia sáng bùng nổ */}
              <div className="relative mb-3 flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full bg-amber-300/60 blur-lg animate-pulse" />
                <div className="text-4xl animate-bounce">
                  🎉
                </div>
              </div>

              {/* Danh sách các công cụ được nhận */}
              <div className="w-full flex flex-col gap-2.5 my-1">
                {rewards.map((reward, index) => (
                  <div
                    key={index}
                    className={`relative w-full p-3 rounded-2xl border-2 flex items-center justify-between shadow-md ${reward.bgGradient}`}
                    style={{ borderColor: reward.color }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/90 shadow-inner flex items-center justify-center text-3xl">
                        {reward.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 tracking-tight">
                          {reward.name}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {reward.desc}
                        </span>
                      </div>
                    </div>

                    {/* Số lượng nhận được */}
                    <div
                      className="px-2.5 py-1 rounded-xl text-white font-black text-xs shadow-sm flex items-center gap-0.5"
                      style={{ backgroundColor: reward.color }}
                    >
                      +{reward.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. NÚT HÀNH ĐỘNG */}
        <div className="relative z-10 w-full mt-2">
          {!isOpened ? (
            <button
              onClick={handleOpenBox}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/30 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-200"
            >
              <Gift className="w-4 h-4" />
              MỞ HỘP QUÀ TIẾP TẾ
            </button>
          ) : (
            <button
              onClick={onClaim}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm tracking-wide shadow-lg shadow-teal-500/30 hover:from-teal-600 hover:to-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-teal-300"
            >
              <Check className="w-4 h-4" />
              NHẬN THƯỞNG VÀ TIẾP TỤC
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
