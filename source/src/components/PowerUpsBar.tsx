/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RefreshCw, Sparkles, HelpCircle, Gift } from 'lucide-react';

interface PowerUpsBarProps {
  pickerCount: number;
  disinfectCount: number;
  swapCount: number;
  isPickMode: boolean;
  supplyProgress: number;
  supplyTarget: number;
  onUsePicker: () => void;
  onUseDisinfect: () => void;
  onUseSwap: () => void;
  onOpenGiftBox?: () => void;
}

export const PowerUpsBar: React.FC<PowerUpsBarProps> = ({
  pickerCount,
  disinfectCount,
  swapCount,
  isPickMode,
  supplyProgress,
  supplyTarget,
  onUsePicker,
  onUseDisinfect,
  onUseSwap,
  onOpenGiftBox,
}) => {
  const [showSupplyInfo, setShowSupplyInfo] = useState<boolean>(false);
  const isReadyToOpen = supplyProgress >= supplyTarget;
  const percent = Math.min(100, Math.round((supplyProgress / supplyTarget) * 100));

  return (
    <div
      className="relative w-full px-2 pt-1 sm:px-2.5 sm:pt-2 bg-gradient-to-b from-[#E7B988] via-[#C99156] to-[#A26D3B] border-t-4 border-[#8C5824] shadow-2xl flex flex-col z-20 shrink-0"
      style={{
        paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), var(--sab, 0px), var(--safe-bottom-fallback, 0px)) + 8px)',
        paddingLeft: 'calc(max(env(safe-area-inset-left, 0px), var(--sal, 0px)) + 8px)',
        paddingRight: 'calc(max(env(safe-area-inset-right, 0px), var(--sar, 0px)) + 8px)',
      }}
    >
      {/* 1. THANH TÍCH LŨY THU THẬP CÔNG CỤ HỖ TRỢ (HỘP TIẾP TẾ Y TẾ 100/100) */}
      <div className={`w-full mb-1 sm:mb-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl border flex items-center justify-between shadow-inner transition-all ${
        isReadyToOpen
          ? 'bg-gradient-to-r from-amber-500 to-emerald-600 border-yellow-300 ring-2 ring-yellow-400 animate-pulse'
          : 'bg-[#6B3E13]/70 border-[#FDE68A]/40'
      }`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-xs shadow-sm font-black ${
            isReadyToOpen ? 'bg-white text-emerald-700 animate-bounce' : 'bg-amber-400 text-amber-950 animate-pulse'
          }`}>
            <Gift className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9.5px] sm:text-[11px] font-black text-amber-100 leading-tight flex items-center gap-1">
              TIẾP TẾ:
              <span className="text-amber-300 font-extrabold">{supplyProgress}/{supplyTarget}</span>
            </span>
          </div>
        </div>

        {/* Cột đo tiến trình (Progress Bar) */}
        {!isReadyToOpen ? (
          <div className="flex-1 mx-2 h-1.5 sm:h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-amber-500/30">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${percent}%` }}
            />
          </div>
        ) : (
          /* Khi đạt 100/100: Nút mở hộp quà rực rỡ */
          <button
            onClick={onOpenGiftBox}
            className="flex-1 mx-2 py-0.5 px-2 rounded-lg bg-yellow-300 hover:bg-yellow-200 text-amber-950 font-black text-[9px] sm:text-[10px] uppercase tracking-wide shadow-md transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer animate-bounce"
          >
            <span>🎁 MỞ HỘP QUÀ NGAY!</span>
          </button>
        )}

        {/* Nút xem hướng dẫn thu thập công cụ */}
        <button
          onClick={() => setShowSupplyInfo((prev) => !prev)}
          className="text-amber-200 hover:text-white transition-colors p-0.5"
          title="Cách thu thập thêm công cụ hỗ trợ"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popup hướng dẫn thu thập công cụ khi bấm HelpCircle */}
      {showSupplyInfo && (
        <div className="absolute bottom-full left-3 right-3 mb-2 p-3 bg-slate-900/95 text-white rounded-2xl border border-amber-400 shadow-2xl z-30 text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 font-black text-amber-300">
            <span className="flex items-center gap-1">
              <Gift className="w-4 h-4 text-amber-400" />
              ĐIỀU KIỆN THU THẬP CÔNG CỤ:
            </span>
            <button
              onClick={() => setShowSupplyInfo(false)}
              className="text-slate-400 hover:text-white px-1 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-200 font-medium">
            <li className="flex items-center gap-1.5">
              <span>🎁</span>
              <span><strong>Hộp Tiếp Tế:</strong> Hợp nhất đủ <strong>100/100 lần</strong> để mở Hộp Quà Tiếp Tế nhận công cụ!</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>🔥</span>
              <span><strong>Chuỗi Combo:</strong> Đạt chuỗi <strong>Combo x10 trở lên</strong> để nhận thưởng công cụ!</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>🚑</span>
              <span><strong>Hợp nhất cấp cao:</strong> Ghép được vật phẩm từ <strong>Lv.8 trở lên</strong> (Máy huyết áp, Sốc tim, Giường bệnh, Xe cứu thương).</span>
            </li>
          </ul>
        </div>
      )}

      {/* 2. KHU VỰC 3 NÚT BẤM CÔNG CỤ HỖ TRỢ */}
      <div className="w-full flex items-center justify-around gap-1.5 sm:gap-2">
        {/* 1. GẮP VẬT TƯ (GĂNG TAY Y TẾ XANH) */}
        <button
          onClick={onUsePicker}
          disabled={pickerCount <= 0 && !isPickMode}
          className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer shadow-md ${
            isPickMode
              ? 'bg-[#FEF08A] border-amber-500 ring-4 ring-amber-400 scale-105'
              : pickerCount > 0
              ? 'bg-gradient-to-b from-[#FFFDF5] to-[#FFF3D6] border-[#DECCA6] hover:brightness-105'
              : 'bg-slate-200/80 border-slate-300 opacity-60 cursor-not-allowed'
          }`}
          title="Gắp 1 vật tư bất kỳ ra khỏi thùng"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 flex items-center justify-center text-lg sm:text-xl shadow-inner mb-0.5">
            🧤
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-amber-950 tracking-tight leading-none">
            {isPickMode ? 'Hủy gắp' : 'Gắp vật tư'}
          </span>

          {/* Huy hiệu số lượng */}
          <div className={`absolute -top-1.5 -right-1 min-w-[20px] h-[20px] sm:min-w-[22px] sm:h-[22px] px-1 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
            pickerCount > 0
              ? 'bg-gradient-to-b from-amber-400 to-amber-600'
              : 'bg-slate-400'
          }`}>
            <span className="text-[9.5px] sm:text-[10px] font-black text-white leading-none">
              {pickerCount}
            </span>
          </div>
        </button>

        {/* 2. KHỬ KHUẨN (CHAI XỊT SÁT KHUẨN CÓ SAO SÁNG) */}
        <button
          onClick={onUseDisinfect}
          disabled={disinfectCount <= 0}
          className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer shadow-md ${
            disinfectCount > 0
              ? 'bg-gradient-to-b from-[#FFFDF5] to-[#FFF3D6] border-[#DECCA6] hover:brightness-105'
              : 'bg-slate-200/80 border-slate-300 opacity-60 cursor-not-allowed'
          }`}
          title="Dùng cồn sát khuẩn xóa toàn bộ vật tư cấp thấp nhất"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 flex items-center justify-center text-lg sm:text-xl shadow-inner mb-0.5">
            🧴
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 absolute -top-0.5 -right-0.5 fill-emerald-400 animate-pulse" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-amber-950 tracking-tight leading-none">
            Khử khuẩn
          </span>

          {/* Huy hiệu số lượng */}
          <div className={`absolute -top-1.5 -right-1 min-w-[20px] h-[20px] sm:min-w-[22px] sm:h-[22px] px-1 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
            disinfectCount > 0
              ? 'bg-gradient-to-b from-amber-400 to-amber-600'
              : 'bg-slate-400'
          }`}>
            <span className="text-[9.5px] sm:text-[10px] font-black text-white leading-none">
              {disinfectCount}
            </span>
          </div>
        </button>

        {/* 3. ĐỔI VẬT (MŨI TÊN XOAY TRÒN XANH BIỂN) */}
        <button
          onClick={onUseSwap}
          disabled={swapCount <= 0}
          className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-2xl border-2 transition-all active:scale-95 cursor-pointer shadow-md ${
            swapCount > 0
              ? 'bg-gradient-to-b from-[#FFFDF5] to-[#FFF3D6] border-[#DECCA6] hover:brightness-105'
              : 'bg-slate-200/80 border-slate-300 opacity-60 cursor-not-allowed'
          }`}
          title="Đổi chỗ giữa vật phẩm hiện tại và vật phẩm tiếp theo"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 flex items-center justify-center shadow-inner mb-0.5">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500 stroke-[2.5]" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-black text-amber-950 tracking-tight leading-none">
            Đổi vật
          </span>

          {/* Huy hiệu số lượng */}
          <div className={`absolute -top-1.5 -right-1 min-w-[20px] h-[20px] sm:min-w-[22px] sm:h-[22px] px-1 rounded-full border-2 border-white shadow-md flex items-center justify-center ${
            swapCount > 0
              ? 'bg-gradient-to-b from-amber-400 to-amber-600'
              : 'bg-slate-400'
          }`}>
            <span className="text-[9.5px] sm:text-[10px] font-black text-white leading-none">
              {swapCount}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
