/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CosmeticSkin } from '../types/game';

// ========================================================
// HỆ THỐNG TRANG PHỤC GIAO DIỆN (COSMETIC SKINS)
// Trang phục độc quyền thay đổi ảnh thân, phụ kiện và hiệu ứng
// của các vật phẩm y tế trên sân chơi.
// ========================================================

export const COSMETIC_SKINS: CosmeticSkin[] = [
  {
    id: 'classic',
    name: 'Trạm Y Tế Cổ Điển',
    subtitle: 'Chuẩn Bộ Y Tế Pastel',
    desc: 'Bộ vật phẩm y tế vẽ lại đồng bộ với nét mềm, màu sáng và biểu cảm động.',
    themeColor: '#0D9488',
    badgeBg: 'bg-teal-500',
    priceCoins: 0,
    features: ['Màu sắc pastel chuẩn', 'Mắt anime tròn xoe', 'Nụ cười chibi hiền từ'],
  },
  {
    id: 'sakura',
    name: 'Hoa Anh Đào Sakura',
    subtitle: 'Ngọt Ngào & Tươi Sáng',
    desc: 'Lấy cảm hứng từ mùa hoa anh đào nở rộ. Vật phẩm mặc trang phục hồng kem với nơ và hoa anh đào.',
    themeColor: '#EC4899',
    badgeBg: 'bg-pink-500',
    priceCoins: 3500,
    isExclusive: true,
    unlockCondition: 'Có thể mở khóa bằng 3.500 Xu hoặc hoàn thành Cột mốc Nhiệm vụ ngày!',
    features: ['Trang phục hồng kem', 'Hoa anh đào và nơ', 'Cánh hoa khi hợp nhất'],
  },
  {
    id: 'cyber',
    name: 'Phi Hành Gia',
    subtitle: 'Khám Phá Vũ Trụ',
    desc: 'Bộ đồ phi hành gia trắng xanh, huy hiệu ngôi sao và phụ kiện khám phá vũ trụ.',
    themeColor: '#06B6D4',
    badgeBg: 'bg-cyan-500',
    priceCoins: 6000,
    features: ['Áo giáp trắng xanh', 'Huy hiệu ngôi sao', 'Phụ kiện phi hành gia'],
  },
  {
    id: 'royal',
    name: 'Hoàng Gia Vàng Kim',
    subtitle: 'Đẳng Cấp Vương Giả',
    desc: 'Áo choàng đỏ nhung, cổ áo kem, viền vàng, bảo ngọc ruby và vương miện.',
    themeColor: '#F59E0B',
    badgeBg: 'bg-amber-500',
    priceCoins: 9000,
    features: ['Áo choàng đỏ nhung', 'Vương miện vàng', 'Khuy ruby và cổ áo kem'],
  },
];

export function getSkinConfig(skinId: string): CosmeticSkin {
  return COSMETIC_SKINS.find((s) => s.id === skinId) || COSMETIC_SKINS[0];
}
