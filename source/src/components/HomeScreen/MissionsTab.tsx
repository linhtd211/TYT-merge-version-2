/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, Sparkles, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GameStorage } from '../../game/storage';
import { DailyMission, DailyMissionState, DailyCheckInState } from '../../types/game';
import { DAILY_CHECKIN_REWARDS, DAILY_MILESTONE_REWARD } from '../../game/missions';
import { soundManager } from '../../game/audio';

interface MissionsTabProps {
  coins: number;
  onCoinsChange: (newCoins: number) => void;
  onSkinUnlocked?: (skinId: string) => void;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  coins,
  onCoinsChange,
  onSkinUnlocked,
}) => {
  const [missionState, setMissionState] = useState<DailyMissionState>(() =>
    GameStorage.getDailyMissions()
  );
  const [checkInState, setCheckInState] = useState<DailyCheckInState>(() =>
    GameStorage.getDailyCheckIn()
  );
  const [claimRewardToast, setClaimRewardToast] = useState<{
    text: string;
    coins: number;
    skin?: string;
  } | null>(null);

  const completedCount = missionState.missions.filter((m) => m.current >= m.target).length;
  const isMilestoneReady =
    completedCount >= DAILY_MILESTONE_REWARD.requiredCompleted && !missionState.milestoneClaimed;

  // Kiểm tra xem hôm nay đã điểm danh chưa
  const today = new Date().toISOString().slice(0, 10);
  const isCheckedInToday = checkInState.lastCheckInDate === today;

  // Tính thời gian còn lại đến 00:00 ngày mai
  const [timeLeft, setTimeLeft] = useState<string>('');
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#38BDF8', '#EC4899'],
      });
    } catch {
      //
    }
  };

  /**
   * Nhận thưởng nhiệm vụ đơn lẻ
   */
  const handleClaimMission = (mission: DailyMission) => {
    const result = GameStorage.claimMission(mission.id);
    if (result.success) {
      soundManager.playCoin();
      triggerCelebration();
      const updatedCoins = GameStorage.getCoins();
      onCoinsChange(updatedCoins);
      setMissionState(GameStorage.getDailyMissions());

      if (result.skinId && onSkinUnlocked) {
        onSkinUnlocked(result.skinId);
      }

      setClaimRewardToast({
        text: `Nhận thành công nhiệm vụ "${mission.title}"!`,
        coins: result.coins,
        skin: result.skinId,
      });
      setTimeout(() => setClaimRewardToast(null), 2500);
    }
  };

  /**
   * Nhận thưởng cột mốc 3 nhiệm vụ ngày
   */
  const handleClaimMilestone = () => {
    const result = GameStorage.claimMilestone();
    if (result.success) {
      soundManager.playGiftBox();
      triggerCelebration();
      const updatedCoins = GameStorage.getCoins();
      onCoinsChange(updatedCoins);
      setMissionState(GameStorage.getDailyMissions());

      if (result.skinId && onSkinUnlocked) {
        onSkinUnlocked(result.skinId);
      }

      setClaimRewardToast({
        text: 'Hoàn thành Cột mốc ngày! Mở khóa Trang phục Sakura!',
        coins: result.coins,
        skin: result.skinId,
      });
      setTimeout(() => setClaimRewardToast(null), 3000);
    }
  };

  /**
   * Điểm danh nhận quà ngày
   */
  const handleCheckIn = () => {
    if (isCheckedInToday) return;
    const result = GameStorage.claimDailyCheckIn();
    if (result.success) {
      soundManager.playCoin();
      triggerCelebration();
      const updatedCoins = GameStorage.getCoins();
      onCoinsChange(updatedCoins);
      setCheckInState(GameStorage.getDailyCheckIn());

      if (result.reward?.skinId && onSkinUnlocked) {
        onSkinUnlocked(result.reward.skinId);
      }

      setClaimRewardToast({
        text: `Điểm danh ngày ${result.nextDay} thành công!`,
        coins: result.reward.coins,
        skin: result.reward.skinId,
      });
      setTimeout(() => setClaimRewardToast(null), 2500);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 py-1 text-slate-800 animate-in fade-in duration-200">
      {/* Thông báo nổi khi nhận thưởng */}
      {claimRewardToast && (
        <div className="p-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg flex items-center justify-between animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <span className="text-base">🎉</span>
            <span>{claimRewardToast.text}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-yellow-200 font-extrabold text-[11px]">
            +{claimRewardToast.coins} 🪙
          </span>
        </div>
      )}

      {/* 1. KHỐI ĐIỂM DANH 7 NGÀY (DAILY CHECK-IN) */}
      <div className="p-3 rounded-2xl bg-white/90 backdrop-blur-md border-2 border-teal-200 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">
              Điểm danh nhận quà 7 ngày
            </span>
          </div>
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
            Chuỗi: {checkInState.consecutiveDays}/7 ngày
          </span>
        </div>

        {/* 7 ô điểm danh */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {DAILY_CHECKIN_REWARDS.map((item) => {
            const isCompleted = item.day < checkInState.consecutiveDays || (item.day === checkInState.consecutiveDays && isCheckedInToday);
            const isTodayTarget = !isCheckedInToday && item.day === ((checkInState.consecutiveDays % 7) + 1);

            return (
              <div
                key={item.day}
                className={`relative flex flex-col items-center justify-between p-1 rounded-xl text-center border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : isTodayTarget
                    ? 'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-400/50 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span className="text-[8.5px] font-bold">{item.label}</span>
                <span className="text-sm my-0.5">{item.icon}</span>
                <span className="text-[8px] font-black">{item.bonusDesc}</span>
                {isCompleted && (
                  <div className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[0.5px] rounded-xl flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nút điểm danh */}
        <button
          onClick={handleCheckIn}
          disabled={isCheckedInToday}
          className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all cursor-pointer ${
            isCheckedInToday
              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 hover:brightness-105'
          }`}
        >
          {isCheckedInToday ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              <span>HÔM NAY ĐÃ ĐIỂM DANH</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>ĐIỂM DANH NHẬN XU NGAY!</span>
            </>
          )}
        </button>
      </div>

      {/* 2. CỘT MỐC HOÀN THÀNH 3 NHIỆM VỤ NGÀY */}
      <div className={`p-3 rounded-2xl border-2 flex items-center justify-between shadow-sm transition-all ${
        missionState.milestoneClaimed
          ? 'bg-emerald-50/80 border-emerald-300'
          : isMilestoneReady
          ? 'bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border-pink-300 ring-2 ring-pink-400/40 animate-pulse'
          : 'bg-white/80 border-teal-100'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white flex items-center justify-center text-lg shadow-sm">
            🌸
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-slate-800">
              Cột mốc ngày: 3/3 Nhiệm vụ
            </span>
            <span className="text-[10px] text-pink-700 font-bold">
              Thưởng: +150 Xu 🪙 & Trang phục Sakura
            </span>
          </div>
        </div>

        {missionState.milestoneClaimed ? (
          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[11px] border border-emerald-200">
            ✓ ĐÃ NHẬN
          </span>
        ) : (
          <button
            onClick={handleClaimMilestone}
            disabled={!isMilestoneReady}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer ${
              isMilestoneReady
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/25 animate-bounce'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{isMilestoneReady ? 'MỞ QUÀ' : `${completedCount}/3`}</span>
          </button>
        )}
      </div>

      {/* 3. DANH SÁCH 4 NHIỆM VỤ NGÀY */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black text-slate-700 uppercase tracking-tight flex items-center gap-1">
            <span>Nhiệm vụ hôm nay</span>
            <span className="text-teal-700">({completedCount}/4)</span>
          </span>
          <span className="text-[10.5px] font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Làm mới sau: {timeLeft}</span>
          </span>
        </div>

        {missionState.missions.map((mission) => {
          const isComplete = mission.current >= mission.target;
          const percent = Math.min(100, Math.round((mission.current / mission.target) * 100));

          return (
            <div
              key={mission.id}
              className={`p-2.5 sm:p-3 rounded-2xl bg-white border-2 flex flex-col gap-2 shadow-xs transition-all ${
                mission.isClaimed
                  ? 'border-slate-200 bg-slate-50/60 opacity-80'
                  : isComplete
                  ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-emerald-50/30'
                  : 'border-teal-100 hover:border-teal-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl shrink-0 p-1.5 rounded-xl bg-teal-50 border border-teal-100">
                    {mission.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 leading-tight">
                      {mission.title}
                    </span>
                    <span className="text-[10.5px] text-slate-500 font-medium leading-tight mt-0.5">
                      {mission.desc}
                    </span>
                  </div>
                </div>

                {/* Phần thưởng & nút nhận */}
                <div className="flex flex-col items-end shrink-0 gap-1">
                  <div className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <span>+{mission.rewardCoins}</span>
                    <span>🪙</span>
                    {mission.rewardSkinId && <span title="Kèm Skin">🌸</span>}
                  </div>

                  {mission.isClaimed ? (
                    <span className="text-[10px] font-bold text-slate-400">
                      ✓ Đã nhận
                    </span>
                  ) : isComplete ? (
                    <button
                      onClick={() => handleClaimMission(mission)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[11px] shadow-sm shadow-emerald-500/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1 animate-pulse"
                    >
                      <Gift className="w-3 h-3" />
                      <span>NHẬN</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-extrabold text-teal-700">
                      {mission.current}/{mission.target}
                    </span>
                  )}
                </div>
              </div>

              {/* Thanh tiến trình con */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    mission.isClaimed
                      ? 'bg-slate-400'
                      : isComplete
                      ? 'bg-emerald-500'
                      : 'bg-teal-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
