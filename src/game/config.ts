/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameConfig, MedicalItemConfig } from '../types/game';

// ========================================================
// CẤU HÌNH TRUNG TÂM GAME: TRẠM Y TẾ MERGE
// Người không chuyên có thể dễ dàng điều chỉnh các thông số
// độ khó, điểm số, kích thước và tốc độ rơi tại đây.
// ========================================================

export const GAME_CONFIG: GameConfig = {
  // 1. THÔNG SỐ VẬT LÝ MATTER.JS
  // Trọng lực: giá trị 1.15 giúp vật rơi êm ái, đầm tay, không bị rơi quá đột ngột
  gravity: 1.15,

  // 2. VẠCH CẢNH BÁO QUÁ TẢI (DANGER LINE)
  // Khoảng cách từ đỉnh trên cùng của thùng chơi xuống vạch cảnh báo (pixel)
  dangerLineY: 78,

  // 3. THỜI GIAN CHỜ TRƯỚC KHI GAME OVER (MILLISECONDS)
  // Khi có vật phẩm vượt qua vạch cảnh báo quá tải và duy trì ổn định trong 4.5 giây (4500ms)
  // để người chơi có đủ thời gian hợp nhất tiếp hoặc dùng power-up cứu nguy
  gameOverDelayMs: 4500,

  // 4. THỜI GIAN DUY TRÌ CHUỖI COMBO (MILLISECONDS)
  // Nếu lần hợp nhất tiếp theo xảy ra trong vòng 2 giây (2000ms), combo sẽ tăng lên
  comboTimeoutMs: 2000,

  // 5. TỶ LỆ SINH VẬT MỚI (CHỈ SINH LEVEL 1, 2, 3)
  // Tỷ lệ xuất hiện: Level 1 (55%), Level 2 (32%), Level 3 (13%)
  // Không bao giờ sinh trực tiếp các vật phẩm cấp cao
  spawnDistribution: [
    { level: 1, weight: 55 },
    { level: 2, weight: 32 },
    { level: 3, weight: 13 },
  ],

  // 6. SỐ LƯỢNG POWER-UP KHI BẮT ĐẦU MỖI LƯỢT CHƠI
  powerupInitialCounts: {
    picker: 1,      // Gắp vật tư: Chọn 1 vật bất kỳ và lấy ra khỏi thùng
    disinfect: 1,   // Khử khuẩn: Xóa sạch toàn bộ vật phẩm có cấp thấp nhất hiện có
    swap: 2,        // Đổi vật: Hoán đổi vật phẩm Hiện Tại (Current) và vật Tiếp Theo (Next)
  },

  // 7. DANH SÁCH 11 CẤP BẬC VẬT TƯ Y TẾ (HÌNH DÁNG ĐẶC TRƯNG CHUẨN THIẾT KẾ)
  // Mỗi vật phẩm có hình dáng riêng biệt (Capsule, Băng cá nhân, Chai xịt, Nhiệt kế, Túi cấp cứu, v.v.)
  items: [
    {
      level: 1,
      id: 'vien_thuoc',
      name: 'Viên Thuốc',
      shortDesc: 'Viên con nhộng 2 màu nhỏ nhắn, giảm đau hạ sốt tức thì.',
      radius: 24,
      width: 28,
      height: 50,
      chamferRadius: 14,
      shapeType: 'capsule',
      score: 2,
      color: '#38BDF8',        // Xanh dương tươi sáng
      secondaryColor: '#FFFFFF',
      accentColor: '#0284C7',
    },
    {
      level: 2,
      id: 'bang_ca_nhan',
      name: 'Băng Cá Nhân',
      shortDesc: 'Bảo vệ các vết trầy xước nhỏ với mặt cười vui vẻ.',
      radius: 28,
      width: 64,
      height: 32,
      chamferRadius: 15,
      shapeType: 'bandage',
      score: 5,
      color: '#FDBA74',        // Màu da be cam đào ấm
      secondaryColor: '#FFEDD5',
      accentColor: '#EA580C',
    },
    {
      level: 3,
      id: 'bang_gac_cuon',
      name: 'Băng Cuộn Kinesiology',
      shortDesc: 'Cuộn băng dán cơ Kinesiology màu hồng dễ thương, bảo vệ cơ và hỗ trợ phục hồi.',
      radius: 32,
      width: 54,
      height: 54,
      chamferRadius: 18,
      shapeType: 'gauze',
      score: 10,
      color: '#FF7597',        // Hồng pastel Kinesiology
      secondaryColor: '#FFA6BF',
      accentColor: '#F0507B',
    },
    {
      level: 4,
      id: 'chai_sat_khuan',
      name: 'Chai Sát Khuẩn',
      shortDesc: 'Dung dịch cồn rửa tay sạch khuẩn 99.9%, vòi xịt tiện lợi.',
      radius: 36,
      width: 50,
      height: 66,
      chamferRadius: 18,
      shapeType: 'bottle',
      score: 20,
      color: '#38BDF8',        // Xanh ngọc lam trong suốt
      secondaryColor: '#E0F2FE',
      accentColor: '#0284C7',
    },
    {
      level: 5,
      id: 'nhiet_ke_dien_tu',
      name: 'Nhiệt Kế Điện Tử',
      shortDesc: 'Súng nhiệt kế hồng ngoại trán màn hình LCD 36.5°C.',
      radius: 40,
      width: 66,
      height: 68,
      chamferRadius: 20,
      shapeType: 'thermometer',
      score: 35,
      color: '#FFFFFF',        // Trắng phối xanh pastel
      secondaryColor: '#7DD3FC',
      accentColor: '#38BDF8',
    },
    {
      level: 6,
      id: 'ong_nghe',
      name: 'Ống Nghe Y Tế',
      shortDesc: 'Ống nghe bác sĩ teal nhỏ gọn, gọng bạc và chuông nghe 2 mặt.',
      radius: 46,
      width: 70,
      height: 70,
      chamferRadius: 28,
      shapeType: 'stethoscope',
      score: 55,
      color: '#14B8A6',        // Xanh teal mát mắt
      secondaryColor: '#0D9488',
      accentColor: '#FB7185',
    },
    {
      level: 7,
      id: 'may_spo2',
      name: 'Máy Kẹp SpO2',
      shortDesc: 'Máy kẹp ngón tay đo oxy máu màn hình OLED hiển thị tim đỏ 98%.',
      radius: 51,
      width: 56,
      height: 74,
      chamferRadius: 20,
      shapeType: 'spo2',
      score: 80,
      color: '#0284C7',        // Xanh cyan tươi
      secondaryColor: '#0B2545',
      accentColor: '#EF4444',
    },
    {
      level: 8,
      id: 'may_do_huyet_ap',
      name: 'Máy Đo Huyết Áp',
      shortDesc: 'Máy đo điện tử để bàn hiện số 120/80 kèm vòng bít quấn bắp tay.',
      radius: 56,
      width: 82,
      height: 76,
      chamferRadius: 22,
      shapeType: 'bp_monitor',
      score: 120,
      color: '#F8FAFC',        // Thân máy trắng ngà y tế
      secondaryColor: '#334155', // Cuff xanh đen xám
      accentColor: '#0284C7',  // Màn hình & nút START
    },
    {
      level: 9,
      id: 'tui_cap_cuu',
      name: 'Túi Cấp Cứu',
      shortDesc: 'Túi cứu thương chữ thập đỏ chứa đầy đủ dụng cụ khẩn cấp.',
      radius: 63,
      width: 92,
      height: 78,
      chamferRadius: 24,
      shapeType: 'firstaid',
      score: 200,
      color: '#EF4444',        // Đỏ cờ cứu thương tươi
      secondaryColor: '#FEF2F2',
      accentColor: '#B91C1C',
    },
    {
      level: 10,
      id: 'may_soc_tim',
      name: 'Máy Sốc Tim',
      shortDesc: 'Máy sốc tim điện tử với hai tay cầm điện cực và màn hình cảm xúc.',
      radius: 68,
      width: 86,
      height: 86,
      chamferRadius: 24,
      shapeType: 'defibrillator',
      score: 350,
      color: '#F8FAFC',        // Trắng ngọc y tế
      secondaryColor: '#93C5FD', // Màn hình xanh dương
      accentColor: '#FACC15',  // Tia sét vàng
    },
    {
      level: 11,
      id: 'giuong_benh_vien',
      name: 'Giường Bệnh Viện',
      shortDesc: 'Giường bệnh nhân hồi sức cấp cứu với cột truyền dịch và monitor nhịp tim.',
      radius: 76,
      width: 98,
      height: 88,
      chamferRadius: 24,
      shapeType: 'hospital_bed',
      score: 600,
      color: '#60A5FA',        // Nệm xanh y tế
      secondaryColor: '#FDE68A', // Khung giường vàng ấm
      accentColor: '#EF4444',  // Túi truyền dịch & tim
    },
    {
      level: 12,
      id: 'xe_cuu_thuong',
      name: 'Xe Cứu Thương',
      shortDesc: 'Xe cứu thương kawaii tối thượng với đôi mắt lấp lánh và còi đèn cấp cứu!',
      radius: 86,
      width: 96,
      height: 104,
      chamferRadius: 28,
      shapeType: 'ambulance',
      score: 1000,
      color: '#FFFFFF',        // Thân xe trắng muốt
      secondaryColor: '#BAE6FD', // Ca-lăng & kính xe xanh nhạt
      accentColor: '#FB7185',  // Còi đèn & má hồng
    },
  ],
};

/**
 * Lấy cấu hình của một vật phẩm theo cấp bậc (1-12)
 */
export function getItemConfigByLevel(level: number): MedicalItemConfig {
  const found = GAME_CONFIG.items.find((item) => item.level === level);
  return found || GAME_CONFIG.items[0];
}

/**
 * Hàm random chọn cấp độ tiếp theo dựa trên bảng tỷ lệ (spawnDistribution)
 */
export function getRandomSpawnLevel(): number {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const entry of GAME_CONFIG.spawnDistribution) {
    cumulative += entry.weight;
    if (rand <= cumulative) {
      return entry.level;
    }
  }
  return 1;
}
