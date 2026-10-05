/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyMission, DailyMissionState, MissionType } from '../types/game';

// ========================================================
// HỆ THỐNG NHIỆM VỤ HÀNG NGÀY (DAILY MISSIONS)
// Cập nhật mỗi ngày vào lúc 00:00, lưu trữ cục bộ hoàn toàn Offline
// Thưởng Xu Y Tế và Trang phục độc quyền cho vật tư y tế.
// ========================================================

export const MISSION_TEMPLATES: Array<{
  idPrefix: string;
  type: MissionType;
  title: string;
  desc: string;
  target: number;
  rewardCoins: number;
  icon: string;
}> = [
  {
    idPrefix: 'm_merge_15',
    type: 'merge_count',
    title: 'Phân loại thuốc tích cực',
    desc: 'Hợp nhất 15 lần vật phẩm y tế bất kỳ.',
    target: 15,
    rewardCoins: 50,
    icon: '💊',
  },
  {
    idPrefix: 'm_merge_30',
    type: 'merge_count',
    title: 'Bác sĩ chăm chỉ',
    desc: 'Hợp nhất 30 lần vật phẩm y tế trong ca trực.',
    target: 30,
    rewardCoins: 80,
    icon: '🩺',
  },
  {
    idPrefix: 'm_combo_3',
    type: 'combo_reach',
    title: 'Thao tác liên hoàn',
    desc: 'Đạt chuỗi Combo từ x3 trở lên.',
    target: 3,
    rewardCoins: 60,
    icon: '⚡',
  },
  {
    idPrefix: 'm_combo_5',
    type: 'combo_reach',
    title: 'Siêu tốc độ cấp cứu',
    desc: 'Đạt chuỗi Combo từ x5 trở lên.',
    target: 5,
    rewardCoins: 90,
    icon: '🔥',
  },
  {
    idPrefix: 'm_level_5',
    type: 'reach_level',
    title: 'Chuẩn bị nhiệt kế',
    desc: 'Ghép thành công Nhiệt kế (Lv.5) hoặc cao hơn.',
    target: 5,
    rewardCoins: 70,
    icon: '🌡️',
  },
  {
    idPrefix: 'm_level_8',
    type: 'reach_level',
    title: 'Thiết bị chuyên sâu',
    desc: 'Ghép thành công Máy đo huyết áp (Lv.8) hoặc cao hơn.',
    target: 8,
    rewardCoins: 110,
    icon: '📟',
  },
  {
    idPrefix: 'm_powerup_1',
    type: 'use_powerup',
    title: 'Trợ giúp đắc lực',
    desc: 'Sử dụng 1 công cụ hỗ trợ (Gắp, Khử khuẩn, Đổi vật).',
    target: 1,
    rewardCoins: 50,
    icon: '🧤',
  },
  {
    idPrefix: 'm_powerup_2',
    type: 'use_powerup',
    title: 'Bảo hộ toàn diện',
    desc: 'Sử dụng 2 công cụ hỗ trợ bất kỳ.',
    target: 2,
    rewardCoins: 80,
    icon: '🧴',
  },
  {
    idPrefix: 'm_score_1000',
    type: 'score_accumulate',
    title: 'Thành tích ca trực',
    desc: 'Ghi tổng cộng 1,000 điểm trong ngày.',
    target: 1000,
    rewardCoins: 60,
    icon: '⭐',
  },
  {
    idPrefix: 'm_score_3000',
    type: 'score_accumulate',
    title: 'Chuyên gia trạm xá',
    desc: 'Ghi tổng cộng 3,000 điểm trong ngày.',
    target: 3000,
    rewardCoins: 100,
    icon: '🏆',
  },
  {
    idPrefix: 'm_supply_20',
    type: 'supply_progress',
    title: 'Tiếp tế khẩn cấp',
    desc: 'Tích lũy 20 điểm tiến trình Hộp tiếp tế.',
    target: 20,
    rewardCoins: 75,
    icon: '📦',
  },
];

/**
 * Lấy khóa ngày hiện tại định dạng YYYY-MM-DD
 */
export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Sinh ngẫu nhiên 4 nhiệm vụ ngày dựa trên khóa ngày (đảm bảo không trùng và đồng nhất trong ngày)
 */
export function generateDailyMissions(dateKey: string): DailyMission[] {
  // Băm dateKey thành số nguyên làm seed
  let seed = 0;
  for (let i = 0; i < dateKey.length; i++) {
    seed = (seed << 5) - seed + dateKey.charCodeAt(i);
    seed |= 0;
  }
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const pool = [...MISSION_TEMPLATES];
  // Xáo trộn mảng dựa trên seed ngày
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoRandom() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Chọn 4 nhiệm vụ với các loại khác nhau
  const selected: typeof MISSION_TEMPLATES = [];
  const usedTypes = new Set<MissionType>();

  for (const item of pool) {
    if (!usedTypes.has(item.type)) {
      selected.push(item);
      usedTypes.add(item.type);
    }
    if (selected.length === 4) break;
  }

  // Nếu chưa đủ 4, thêm các nhiệm vụ còn lại
  if (selected.length < 4) {
    for (const item of pool) {
      if (!selected.includes(item)) {
        selected.push(item);
      }
      if (selected.length === 4) break;
    }
  }

  return selected.map((tpl, idx) => ({
    id: `${tpl.idPrefix}_${dateKey}_${idx}`,
    type: tpl.type,
    title: tpl.title,
    desc: tpl.desc,
    target: tpl.target,
    current: 0,
    rewardCoins: tpl.rewardCoins,
    rewardSkinId: idx === 3 ? 'sakura' : undefined, // Nhiệm vụ thứ 4 tặng thêm cơ hội mở khóa skin Sakura
    isClaimed: false,
    icon: tpl.icon,
  }));
}

/**
 * Cột mốc hoàn thành toàn bộ nhiệm vụ ngày
 */
export const DAILY_MILESTONE_REWARD = {
  requiredCompleted: 3,
  coins: 150,
  unlockSkinId: 'sakura',
};

/**
 * Bảng phần thưởng điểm danh hàng ngày 7 ngày
 */
export const DAILY_CHECKIN_REWARDS = [
  { day: 1, label: 'Ngày 1', coins: 50, icon: '🪙', bonusDesc: '+50 Xu' },
  { day: 2, label: 'Ngày 2', coins: 70, icon: '🪙', bonusDesc: '+70 Xu' },
  { day: 3, label: 'Ngày 3', coins: 100, tool: 'picker', icon: '🧤', bonusDesc: '+100 Xu & 1 Gắp' },
  { day: 4, label: 'Ngày 4', coins: 120, icon: '🪙', bonusDesc: '+120 Xu' },
  { day: 5, label: 'Ngày 5', coins: 150, icon: '🪙', bonusDesc: '+150 Xu' },
  { day: 6, label: 'Ngày 6', coins: 180, tool: 'disinfect', icon: '🧴', bonusDesc: '+180 Xu & 1 Khử khuẩn' },
  { day: 7, label: 'Ngày 7', coins: 250, skinId: 'sakura', icon: '🌸', bonusDesc: '+250 Xu & Skin Sakura' },
];
