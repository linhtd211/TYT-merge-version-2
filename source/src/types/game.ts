/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ========================================================
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU CỦA TRẠM Y TẾ MERGE
// ========================================================

/**
 * Thông tin chi tiết của từng cấp bậc vật phẩm y tế
 */
export interface MedicalItemConfig {
  level: number;            // Cấp bậc (1 đến 12)
  id: string;               // Mã định danh
  name: string;             // Tên tiếng Việt (Viên thuốc, Băng cá nhân,...)
  shortDesc: string;        // Mô tả công dụng y tế vui vẻ
  radius: number;           // Bán kính tham chiếu (pixels)
  width: number;            // Chiều rộng hình thể thực tế (pixels)
  height: number;           // Chiều cao hình thể thực tế (pixels)
  chamferRadius: number;    // Bo tròn góc cho collider Matter.js
  shapeType:
    | 'capsule'
    | 'bandage'
    | 'gauze'
    | 'bottle'
    | 'thermometer'
    | 'stethoscope'
    | 'spo2'
    | 'bp_monitor'
    | 'firstaid'
    | 'defibrillator'
    | 'hospital_bed'
    | 'ambulance';
  score: number;            // Điểm thưởng khi hợp nhất thành vật này
  color: string;            // Màu chủ đạo
  secondaryColor: string;   // Màu phụ
  accentColor: string;      // Màu điểm nhấn
}

/**
 * Cấu hình tổng thể của game
 */
export interface GameConfig {
  gravity: number;          // Trọng lực vật lý Matter.js
  dangerLineY: number;      // Tọa độ Y của vạch cảnh báo quá tải (tính từ đỉnh thùng)
  gameOverDelayMs: number;  // Thời gian (ms) vật nằm trên vạch trước khi Game Over (3000ms = 3s)
  comboTimeoutMs: number;   // Khoảng thời gian (ms) giữa các lần merge để tính chuỗi combo (2000ms = 2s)
  spawnDistribution: {      // Tỷ lệ xuất hiện của các cấp khi tạo vật mới (chỉ cấp 1, 2, 3)
    level: number;
    weight: number;
  }[];
  powerupInitialCounts: {   // Số lượng power-up khi bắt đầu mỗi ván
    picker: number;         // Gắp vật tư
    disinfect: number;      // Khử khuẩn
    swap: number;           // Đổi vật
  };
  items: MedicalItemConfig[];
}

/**
 * Trạng thái hiện tại của game
 */
export type GameView = 'HOME' | 'PLAYING' | 'COLLECTION' | 'SETTINGS';

/**
 * Biểu cảm khuôn mặt của vật phẩm y tế chibi
 */
export type MascotExpression = 'happy' | 'idle' | 'falling' | 'squished' | 'merge_excited';

/**
 * Hiệu ứng hạt (Particle) trên Canvas
 */
export interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  rotation?: number;
  rotationSpeed?: number;
  shape?: 'circle' | 'sparkle' | 'heart' | 'cross' | 'bubble' | 'ring';
  maxRadius?: number;       // Dùng cho vòng sóng mở rộng (ring)
  swaySpeed?: number;       // Dao động ngang mềm mại
  swayOffset?: number;
}

/**
 * Chữ nổi thông báo (Điểm cộng, Combo)
 */
export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  scale?: number;
}

/**
 * Loại nhiệm vụ hàng ngày
 */
export type MissionType =
  | 'merge_count'       // Hợp nhất N lần
  | 'combo_reach'       // Đạt chuỗi combo xN
  | 'reach_level'       // Ghép được vật phẩm từ Lv.N trở lên
  | 'use_powerup'       // Sử dụng N công cụ hỗ trợ
  | 'score_accumulate'  // Đạt tổng N điểm
  | 'supply_progress';  // Tích lũy N điểm hộp tiếp tế

/**
 * Cấu trúc một nhiệm vụ hàng ngày
 */
export interface DailyMission {
  id: string;
  type: MissionType;
  title: string;
  desc: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardSkinId?: string;
  isClaimed: boolean;
  icon: string;
}

/**
 * Trạng thái bộ nhiệm vụ ngày
 */
export interface DailyMissionState {
  dateKey: string;      // YYYY-MM-DD
  missions: DailyMission[];
  milestoneClaimed: boolean;
}

/**
 * Điểm danh hàng ngày nhận quà
 */
export interface DailyCheckInState {
  lastCheckInDate: string; // YYYY-MM-DD
  consecutiveDays: number; // 1 -> 7
}

/**
 * Trang phục giao diện độc quyền cho vật tư y tế
 */
export interface CosmeticSkin {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  themeColor: string;
  badgeBg: string;
  priceCoins: number;
  isExclusive?: boolean;
  unlockCondition?: string;
  features: string[];
}

/**
 * Tab trên màn hình chính
 */
export type HomeTab = 'PLAY' | 'MISSIONS' | 'SKINS';

