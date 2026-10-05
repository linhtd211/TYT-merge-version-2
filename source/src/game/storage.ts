/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ========================================================
// QUẢN LÝ LƯU TRỮ LOCALSTORAGE
// Lưu trữ kỷ lục điểm, combo cao nhất, các vật phẩm
// đã mở khóa trong Bộ sưu tập và VÁN CHƠI DỞ DANG (Offline Save).
// ========================================================

import { DailyMission, DailyMissionState, DailyCheckInState, MissionType } from '../types/game';
import { generateDailyMissions, getTodayDateKey, DAILY_CHECKIN_REWARDS, DAILY_MILESTONE_REWARD } from './missions';

export interface SavedItemData {
  normX: number; // Tọa độ X tương đối (0.0 -> 1.0)
  normY: number; // Tọa độ Y tương đối (0.0 -> 1.0)
  angle: number; // Góc nghiêng radian
  level: number; // Cấp bậc vật tư (1 -> 12)
}

export interface SavedGameState {
  score: number;
  combo: number;
  highestLevel: number;
  currentLevel: number;
  nextLevel: number;
  supplyProgress: number;
  powerups: {
    picker: number;
    disinfect: number;
    swap: number;
  };
  items: SavedItemData[];
  savedAt: number;
}

const STORAGE_KEYS = {
  BEST_SCORE: 'tram_yte_best_score',
  BEST_COMBO: 'tram_yte_best_combo',
  HIGHEST_LEVEL: 'tram_yte_highest_level',
  UNLOCKED_LEVELS: 'tram_yte_unlocked_levels',
  SAVED_GAME: 'tram_yte_saved_game',
  COINS: 'tram_yte_coins',
  DAILY_MISSIONS: 'tram_yte_daily_missions',
  UNLOCKED_SKINS: 'tram_yte_unlocked_skins',
  ACTIVE_SKIN: 'tram_yte_active_skin',
  DAILY_CHECKIN: 'tram_yte_daily_checkin',
};

export const GameStorage = {
  getBestScore(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },

  saveBestScore(score: number): boolean {
    const current = this.getBestScore();
    if (score > current) {
      try {
        localStorage.setItem(STORAGE_KEYS.BEST_SCORE, score.toString());
        return true; // Phá kỷ lục mới
      } catch {
        //
      }
    }
    return false;
  },

  getBestCombo(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.BEST_COMBO);
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  },

  saveBestCombo(combo: number) {
    const current = this.getBestCombo();
    if (combo > current) {
      try {
        localStorage.setItem(STORAGE_KEYS.BEST_COMBO, combo.toString());
      } catch {
        //
      }
    }
  },

  getHighestLevel(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.HIGHEST_LEVEL);
      return val ? parseInt(val, 10) : 1;
    } catch {
      return 1;
    }
  },

  saveHighestLevel(level: number) {
    const current = this.getHighestLevel();
    if (level > current) {
      try {
        localStorage.setItem(STORAGE_KEYS.HIGHEST_LEVEL, level.toString());
      } catch {
        //
      }
    }
  },

  getUnlockedLevels(): number[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LEVELS);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      //
    }
    // Mặc định luôn mở khóa ít nhất Cấp 1
    return [1];
  },

  /**
   * Mở khóa một cấp độ mới. Trả về true nếu đây là lần đầu tiên mở khóa cấp này.
   */
  unlockLevel(level: number): boolean {
    const unlocked = this.getUnlockedLevels();
    if (!unlocked.includes(level)) {
      unlocked.push(level);
      unlocked.sort((a, b) => a - b);
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify(unlocked));
        this.saveHighestLevel(level);
        return true; // Lần đầu tiên khám phá
      } catch {
        //
      }
    }
    return false;
  },

  /**
   * Đặt lại toàn bộ dữ liệu game về ban đầu (trong Cài đặt)
   */
  resetAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.BEST_SCORE);
      localStorage.removeItem(STORAGE_KEYS.BEST_COMBO);
      localStorage.removeItem(STORAGE_KEYS.HIGHEST_LEVEL);
      localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
      localStorage.removeItem(STORAGE_KEYS.COINS);
      localStorage.removeItem(STORAGE_KEYS.DAILY_MISSIONS);
      localStorage.removeItem(STORAGE_KEYS.UNLOCKED_SKINS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SKIN);
      localStorage.removeItem(STORAGE_KEYS.DAILY_CHECKIN);
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_LEVELS, JSON.stringify([1]));
      localStorage.setItem(STORAGE_KEYS.COINS, '50');
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(['classic']));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SKIN, 'classic');
    } catch {
      //
    }
  },

  // ==========================================
  // QUẢN LÝ TIỀN TỆ (XU Y TẾ 🪙)
  // ==========================================
  getCoins(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.COINS);
      return val ? parseInt(val, 10) : 50; // Tặng ngay 50 xu chào mừng người chơi mới
    } catch {
      return 50;
    }
  },

  addCoins(amount: number): number {
    const current = this.getCoins();
    const updated = Math.max(0, current + amount);
    try {
      localStorage.setItem(STORAGE_KEYS.COINS, updated.toString());
    } catch {
      //
    }
    return updated;
  },

  spendCoins(amount: number): boolean {
    const current = this.getCoins();
    if (current < amount) return false;
    this.addCoins(-amount);
    return true;
  },

  // ==========================================
  // QUẢN LÝ TRANG PHỤC GIAO DIỆN (SKINS)
  // ==========================================
  getUnlockedSkins(): string[] {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      //
    }
    return ['classic'];
  },

  unlockSkin(skinId: string): boolean {
    const unlocked = this.getUnlockedSkins();
    if (!unlocked.includes(skinId)) {
      unlocked.push(skinId);
      try {
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(unlocked));
        return true;
      } catch {
        //
      }
    }
    return false;
  },

  getActiveSkin(): string {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_SKIN);
      return val || 'classic';
    } catch {
      return 'classic';
    }
  },

  setActiveSkin(skinId: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SKIN, skinId);
    } catch {
      //
    }
  },

  // ==========================================
  // QUẢN LÝ NHIỆM VỤ HÀNG NGÀY (DAILY MISSIONS)
  // ==========================================
  getDailyMissions(): DailyMissionState {
    const today = getTodayDateKey();
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DAILY_MISSIONS);
      if (val) {
        const parsed: DailyMissionState = JSON.parse(val);
        if (parsed && parsed.dateKey === today && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
          return parsed;
        }
      }
    } catch {
      //
    }

    // Nếu sang ngày mới hoặc chưa có, tự động tạo bộ nhiệm vụ ngày mới
    const newMissions = generateDailyMissions(today);
    const newState: DailyMissionState = {
      dateKey: today,
      missions: newMissions,
      milestoneClaimed: false,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(newState));
    } catch {
      //
    }
    return newState;
  },

  saveDailyMissions(state: DailyMissionState) {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_MISSIONS, JSON.stringify(state));
    } catch {
      //
    }
  },

  /**
   * Cập nhật tiến độ nhiệm vụ ngày
   */
  updateMissionProgress(
    type: MissionType,
    amount: number,
    isAbsolute: boolean = false
  ): { completedAny: boolean; completedMissions: DailyMission[] } {
    const state = this.getDailyMissions();
    let completedAny = false;
    const completedMissions: DailyMission[] = [];

    state.missions.forEach((mission) => {
      if (mission.type === type && !mission.isClaimed) {
        const oldVal = mission.current;
        const nextVal = isAbsolute ? Math.max(mission.current, amount) : mission.current + amount;
        mission.current = Math.min(mission.target, nextVal);

        if (oldVal < mission.target && mission.current >= mission.target) {
          completedAny = true;
          completedMissions.push(mission);
        }
      }
    });

    this.saveDailyMissions(state);
    return { completedAny, completedMissions };
  },

  /**
   * Nhận thưởng một nhiệm vụ ngày đã hoàn thành
   */
  claimMission(missionId: string): { success: boolean; coins: number; skinId?: string } {
    const state = this.getDailyMissions();
    const mission = state.missions.find((m) => m.id === missionId);

    if (mission && mission.current >= mission.target && !mission.isClaimed) {
      mission.isClaimed = true;
      this.addCoins(mission.rewardCoins);

      if (mission.rewardSkinId) {
        this.unlockSkin(mission.rewardSkinId);
      }

      this.saveDailyMissions(state);
      return {
        success: true,
        coins: mission.rewardCoins,
        skinId: mission.rewardSkinId,
      };
    }

    return { success: false, coins: 0 };
  },

  /**
   * Nhận phần thưởng cột mốc hoàn thành nhiệm vụ ngày
   */
  claimMilestone(): { success: boolean; coins: number; skinId?: string } {
    const state = this.getDailyMissions();
    const completedCount = state.missions.filter((m) => m.current >= m.target).length;

    if (completedCount >= DAILY_MILESTONE_REWARD.requiredCompleted && !state.milestoneClaimed) {
      state.milestoneClaimed = true;
      this.addCoins(DAILY_MILESTONE_REWARD.coins);
      this.unlockSkin(DAILY_MILESTONE_REWARD.unlockSkinId);
      this.saveDailyMissions(state);
      return {
        success: true,
        coins: DAILY_MILESTONE_REWARD.coins,
        skinId: DAILY_MILESTONE_REWARD.unlockSkinId,
      };
    }

    return { success: false, coins: 0 };
  },

  // ==========================================
  // ĐIỂM DANH HÀNG NGÀY (DAILY CHECK-IN)
  // ==========================================
  getDailyCheckIn(): DailyCheckInState {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.DAILY_CHECKIN);
      if (val) {
        return JSON.parse(val);
      }
    } catch {
      //
    }
    return { lastCheckInDate: '', consecutiveDays: 0 };
  },

  claimDailyCheckIn(): { success: boolean; reward: any; nextDay: number } {
    const today = getTodayDateKey();
    const current = this.getDailyCheckIn();

    if (current.lastCheckInDate === today) {
      return { success: false, reward: null, nextDay: current.consecutiveDays };
    }

    // Kiểm tra xem có liên tục không (ngày hôm qua hay bị đứt quãng)
    let nextDays = 1;
    if (current.lastCheckInDate) {
      const last = new Date(current.lastCheckInDate).getTime();
      const now = new Date(today).getTime();
      const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        nextDays = (current.consecutiveDays % 7) + 1;
      } else {
        nextDays = 1;
      }
    }

    const reward = DAILY_CHECKIN_REWARDS[nextDays - 1];
    this.addCoins(reward.coins);
    if (reward.skinId) {
      this.unlockSkin(reward.skinId);
    }

    const updatedState: DailyCheckInState = {
      lastCheckInDate: today,
      consecutiveDays: nextDays,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_CHECKIN, JSON.stringify(updatedState));
    } catch {
      //
    }

    return { success: true, reward, nextDay: nextDays };
  },

  /**
   * Lấy ván chơi dở dang đã lưu (nếu có)
   */
  getSavedGame(): SavedGameState | null {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.SAVED_GAME);
      if (val) {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed.score === 'number' && Array.isArray(parsed.items)) {
          return parsed as SavedGameState;
        }
      }
    } catch {
      //
    }
    return null;
  },

  /**
   * Lưu ván chơi đang dở dang (Chế độ chơi Offline & Tự động lưu)
   */
  saveGame(state: SavedGameState): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_GAME, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Xóa ván chơi đã lưu khi game over hoặc khi người chơi bắt đầu ván mới
   */
  clearSavedGame() {
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_GAME);
    } catch {
      //
    }
  },

  /**
   * Kiểm tra có ván chơi dở dang nào đang chờ tiếp tục không
   */
  hasSavedGame(): boolean {
    const saved = this.getSavedGame();
    return saved !== null && saved.items.length > 0;
  },

  /**
   * Định dạng thời gian đã lưu sang tiếng Việt thân thiện
   */
  formatSavedTime(timestamp: number): string {
    if (!timestamp) return 'Gần đây';
    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);

    if (diffSec < 45) return 'Vừa mới lưu';
    if (diffSec < 3600) {
      const minutes = Math.max(1, Math.floor(diffSec / 60));
      return `${minutes} phút trước`;
    }
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return `${hours} giờ trước`;
    }
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} ngày ${day}/${month}`;
  },
};
