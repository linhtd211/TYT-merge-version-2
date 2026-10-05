/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import footerArt from '../../public/art/play-footer.webp?url';
import React, { useState } from 'react';
import { RefreshCw, Sparkles, HelpCircle, Gift, Hand } from 'lucide-react';

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
    <div className="play-footer-safe">
      <div className="play-footer clinic-powerups" style={{backgroundImage:`url(${footerArt})`}}>
        <span className="play-supply-value" style={{fontSize:`${Math.min(2.9,14/`${supplyProgress}/${supplyTarget}`.length)}cqw`}}>{supplyProgress}/{supplyTarget}</span>
        {isReadyToOpen ? <button className="play-gift-ready" onClick={onOpenGiftBox}>MỞ HỘP QUÀ NGAY!</button> : <div className="play-progress" role="progressbar" aria-label="Tiến độ tiếp tế" aria-valuemin={0} aria-valuemax={supplyTarget} aria-valuenow={supplyProgress}><div style={{width:`${percent}%`}}/></div>}
        <button className="play-help" onClick={() => setShowSupplyInfo(p => !p)} title="Cách thu thập thêm công cụ hỗ trợ" aria-label="Hướng dẫn tiếp tế"/>
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


        <div className="play-tools">
          <button className={isPickMode ? 'play-picker-active' : ''} onClick={onUsePicker} disabled={pickerCount<=0 && !isPickMode} aria-label={isPickMode ? 'Hủy gắp' : 'Gắp vật tư'} title="Gắp 1 vật tư bất kỳ ra khỏi thùng"><span className="play-tool-count">{pickerCount}</span>{isPickMode && <span className="play-tool-cancel">Hủy gắp</span>}</button>
          <button onClick={onUseDisinfect} disabled={disinfectCount<=0} aria-label="Khử khuẩn" title="Xóa toàn bộ vật tư cấp thấp nhất"><span className="play-tool-count">{disinfectCount}</span></button>
          <button onClick={onUseSwap} disabled={swapCount<=0} aria-label="Đổi vật" title="Đổi vật hiện tại và vật tiếp theo"><span className="play-tool-count">{swapCount}</span></button>
        </div>
      </div>
    </div>
  );
};
