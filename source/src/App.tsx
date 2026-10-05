/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameView } from './types/game';
import { HomeScreen } from './components/Modals/HomeScreen';
import { GameBoard } from './components/GameBoard';
import { CollectionModal } from './components/Modals/CollectionModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { GameStorage } from './game/storage';
import { GAME_CONFIG } from './game/config';
import { soundManager } from './game/audio';
import { isRoyalTrialEnabled, setRoyalTrialEnabled } from './game/royalSprites';

export default function App() {
  const [royalTrial, setRoyalTrial] = useState(isRoyalTrialEnabled());
  const [currentView, setCurrentView] = useState<GameView>('HOME');
  const [resumeSavedGame, setResumeSavedGame] = useState<boolean>(false);
  const [showHomeCollection, setShowHomeCollection] = useState<boolean>(false);
  const [showHomeSettings, setShowHomeSettings] = useState<boolean>(false);

  // Điểm số & Kỷ lục lưu trữ
  const [bestScore, setBestScore] = useState<number>(() => GameStorage.getBestScore());
  const [bestCombo, setBestCombo] = useState<number>(() => GameStorage.getBestCombo());
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>(() => GameStorage.getUnlockedLevels());

  const [sfxEnabled, setSfxEnabled] = useState<boolean>(soundManager.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(soundManager.musicEnabled);

  const refreshStorageData = () => {
    setBestScore(GameStorage.getBestScore());
    setBestCombo(GameStorage.getBestCombo());
    setUnlockedLevels(GameStorage.getUnlockedLevels());
  };

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center overflow-hidden font-sans sm:p-3 md:p-5">
      {/* Khung game: Trên mobile (iPhone) tràn viền 100% không gian; trên iPad/Tablet căn giữa với tỷ lệ chuẩn cân đối */}
      <main className="relative w-full h-full sm:h-auto sm:max-h-[92dvh] sm:aspect-[9/15] max-w-md sm:max-w-lg md:max-w-[480px] lg:max-w-[500px] bg-white sm:rounded-3xl sm:border-4 sm:border-[#8C5824]/30 shadow-2xl overflow-hidden flex flex-col">
        <button className="shrink-0 z-50 w-full bg-amber-100 text-amber-950 text-[11px] font-bold py-2"
          onClick={() => {
            const next = !royalTrial;
            setRoyalTrialEnabled(next);
            setRoyalTrial(next);
          }}>
          THỬ ẢNH HOÀNG GIA CẤP 1–3: {royalTrial ? 'BẬT' : 'TẮT'} · Chạm để so sánh
        </button>
        <div className="relative flex-1 min-h-0 overflow-hidden">
        {currentView === 'HOME' && (
          <HomeScreen
            bestScore={bestScore}
            bestCombo={bestCombo}
            unlockedCount={unlockedLevels.length}
            totalItems={GAME_CONFIG.items.length}
            onPlay={(resume) => {
              setResumeSavedGame(!!resume);
              setCurrentView('PLAYING');
            }}
            onOpenCollection={() => {
              refreshStorageData();
              setShowHomeCollection(true);
            }}
            onOpenSettings={() => setShowHomeSettings(true)}
          />
        )}

        {currentView === 'PLAYING' && (
          <GameBoard
            onGoHome={() => {
              refreshStorageData();
              setCurrentView('HOME');
            }}
            resumeSavedGame={resumeSavedGame}
          />
        )}

        {/* Modal Bộ Sưu Tập khi mở từ Home */}
        {showHomeCollection && (
          <CollectionModal
            unlockedLevels={unlockedLevels}
            onClose={() => setShowHomeCollection(false)}
          />
        )}

        {/* Modal Cài Đặt khi mở từ Home */}
        {showHomeSettings && (
          <SettingsModal
            sfxEnabled={sfxEnabled}
            musicEnabled={musicEnabled}
            onToggleSfx={() => {
              const next = !sfxEnabled;
              setSfxEnabled(next);
              soundManager.setSfx(next);
            }}
            onToggleMusic={() => {
              const next = !musicEnabled;
              setMusicEnabled(next);
              soundManager.setMusic(next);
            }}
            onResetData={() => {
              GameStorage.resetAllData();
              refreshStorageData();
            }}
            onClose={() => setShowHomeSettings(false)}
          />
        )}
        </div>
      </main>
    </div>
  );
}
