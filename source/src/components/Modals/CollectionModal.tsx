/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { X, Trophy, CheckCircle2 } from 'lucide-react';
import { GAME_CONFIG } from '../../game/config';
import { drawMedicalMascot } from '../../game/renderer';

interface CollectionModalProps {
  unlockedLevels: number[];
  onClose: () => void;
}

const ItemSlotCanvas: React.FC<{ level: number; isUnlocked: boolean }> = ({
  level,
  isUnlocked,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isUnlocked) {
      drawMedicalMascot(
        ctx,
        canvas.width / 2,
        canvas.height / 2,
        level,
        0,
        1.0,
        'happy',
        performance.now(),
        22 // Kích thước vừa vặn cho slot
      );
    }
  }, [level, isUnlocked]);

  return (
    <div className="w-12 h-12 flex items-center justify-center">
      {isUnlocked ? (
        <canvas ref={canvasRef} width={50} height={50} className="w-12 h-12" />
      ) : (
        <span className="text-xl font-black text-slate-300">?</span>
      )}
    </div>
  );
};

export const CollectionModal: React.FC<CollectionModalProps> = ({
  unlockedLevels,
  onClose,
}) => {
  const totalItems = GAME_CONFIG.items.length;
  const unlockedCount = unlockedLevels.length;
  const progressPercent = Math.round((unlockedCount / totalItems) * 100);

  return (
    <div
      className="absolute inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      style={{
        paddingTop: 'calc(max(env(safe-area-inset-top, 0px), var(--sat, 0px), var(--safe-top-fallback, 0px)) + 16px)',
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 16px)',
      }}
    >
      <div className="w-full max-w-md max-h-[92vh] bg-white rounded-3xl p-5 shadow-2xl border border-teal-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Tiêu đề modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                BỘ SƯU TẬP VẬT TƯ
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Khám phá đủ 12 thiết bị & phương tiện y tế tại trạm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 active:scale-95 transition-all"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh tiến trình */}
        <div className="my-3 px-3 py-2 bg-teal-50/70 rounded-2xl border border-teal-100 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-teal-900">
            <span>Tiến độ hoàn thành</span>
            <span>{unlockedCount} / {totalItems} ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-teal-200/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Danh sách 11 cấp vật tư y tế */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
          {GAME_CONFIG.items.map((item) => {
            const isUnlocked = unlockedLevels.includes(item.level);

            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-2xl border transition-all flex items-center gap-3 ${
                  isUnlocked
                    ? 'bg-white border-teal-100 shadow-xs'
                    : 'bg-slate-50 border-slate-200/80 opacity-60'
                }`}
              >
                {/* Khung avatar vật phẩm */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked ? 'bg-teal-50/80 border border-teal-200/50' : 'bg-slate-200/80'
                  }`}
                >
                  <ItemSlotCanvas level={item.level} isUnlocked={isUnlocked} />
                </div>

                {/* Thông tin vật phẩm */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      Cấp {item.level}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 truncate">
                      {isUnlocked ? item.name : 'CHƯA KHÁM PHÁ'}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {isUnlocked ? item.shortDesc : 'Hợp nhất 2 vật phẩm cấp dưới để mở khóa'}
                  </p>

                  <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold text-teal-700">
                    <span>Điểm: +{item.score}</span>
                    <span>·</span>
                    <span>Bán kính: {item.radius}px</span>
                  </div>
                </div>

                {/* Trạng thái đã mở */}
                {isUnlocked && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mr-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="mt-3 w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 active:scale-98 transition-all"
        >
          QUAY LẠI
        </button>
      </div>
    </div>
  );
};
