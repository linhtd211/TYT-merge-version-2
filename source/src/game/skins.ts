/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CosmeticSkin } from '../types/game';

// ========================================================
// HỆ THỐNG TRANG PHỤC GIAO DIỆN (COSMETIC SKINS)
// Trang phục độc quyền thay đổi hiệu ứng, màu sắc và hào quang
// của các vật phẩm y tế trên sân chơi.
// ========================================================

export const COSMETIC_SKINS: CosmeticSkin[] = [
  {
    id: 'classic',
    name: 'Trạm Y Tế Cổ Điển',
    subtitle: 'Chuẩn Bộ Y Tế Pastel',
    desc: 'Thiết kế nguyên bản chuẩn trạm xá với tông màu pastel thân thiện, mắt long lanh anime và má hồng đào.',
    themeColor: '#0D9488',
    badgeBg: 'bg-teal-500',
    priceCoins: 0,
    features: ['Màu sắc pastel chuẩn', 'Mắt anime tròn xoe', 'Nụ cười chibi hiền từ'],
  },
  {
    id: 'sakura',
    name: 'Hoa Anh Đào Sakura',
    subtitle: 'Ngọt Ngào & Tươi Sáng',
    desc: 'Lấy cảm hứng từ mùa hoa anh đào nở rộ. Vật phẩm phủ ánh hồng phấn đào, má hồng hình trái tim và cánh hoa bay.',
    themeColor: '#EC4899',
    badgeBg: 'bg-pink-500',
    priceCoins: 150,
    isExclusive: true,
    unlockCondition: 'Có thể mở khóa bằng 150 Xu hoặc hoàn thành Cột mốc Nhiệm vụ ngày!',
    features: ['Ánh hồng Sakura dịu mát', 'Má hồng trái tim lấp lánh', 'Hạt cánh hoa đào khi hợp nhất'],
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    subtitle: 'Công Nghệ Tương Lai',
    desc: 'Bộ kit y tế viễn tưởng năm 2099 với viền điện quang Cyan Neon, mạch điện tử phát sáng và kính thực tế ảo visor.',
    themeColor: '#06B6D4',
    badgeBg: 'bg-cyan-500',
    priceCoins: 300,
    features: ['Đường viền Neon phát quang', 'Hào quang vi mạch điện tử', 'Tia hạt cyber tốc độ cao'],
  },
  {
    id: 'royal',
    name: 'Hoàng Gia Vàng Kim',
    subtitle: 'Đẳng Cấp Vương Giả',
    desc: 'Bộ trang phục sang trọng dát vàng kim hoàng gia, đính bảo ngọc ruby, hào quang ánh kim chói lọi và vương miện.',
    themeColor: '#F59E0B',
    badgeBg: 'bg-amber-500',
    priceCoins: 500,
    features: ['Viền dát vàng kim lấp lánh', 'Vương miện hoàng gia mini', 'Chùm sao vàng rực rỡ'],
  },
];

export function getSkinConfig(skinId: string): CosmeticSkin {
  return COSMETIC_SKINS.find((s) => s.id === skinId) || COSMETIC_SKINS[0];
}
