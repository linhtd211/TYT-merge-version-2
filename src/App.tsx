/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameView } from './types/game';
import { HomeScreen } from './components/Modals/HomeScreen';
import { GameBoard } from './components/GameBoard';
import { CollectionModal } from './components/Modals/CollectionModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { GameStorage } from './game/storage';
import { GAME_CONFIG } from './game/config';
import { soundManager } from './game/audio';

export default function App() {
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

  useEffect(() => {
    soundManager.setBGMScene(currentView === 'HOME' ? 'home' : 'game');
    // Cài đặt trong màn chơi cũng cập nhật trạng thái hiển thị khi trở về trang chủ.
    setSfxEnabled(soundManager.sfxEnabled);
    setMusicEnabled(soundManager.musicEnabled);
  }, [currentView]);

  useEffect(() => {
    const unlock = () => soundManager.initContext();
    const visible = () => soundManager.setBGMVisible(!document.hidden);
    const hide = () => soundManager.setBGMVisible(false);
    document.addEventListener('pointerdown', unlock, {passive:true});
    document.addEventListener('keydown', unlock);
    document.addEventListener('visibilitychange', visible);
    window.addEventListener('pagehide', hide);
    window.addEventListener('pageshow', visible);
    visible();
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', visible);
      window.removeEventListener('pagehide', hide);
      window.removeEventListener('pageshow', visible);
      soundManager.stopBGM();
    };
  }, []);

  const refreshStorageData = () => {
    setBestScore(GameStorage.getBestScore());
    setBestCombo(GameStorage.getBestCombo());
    setUnlockedLevels(GameStorage.getUnlockedLevels());
  };

  return (
    <div className="relative w-full h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center overflow-hidden font-sans sm:p-3 md:p-5">
      {/* Khung game: Trên mobile (iPhone) tràn viền 100% không gian; trên iPad/Tablet căn giữa với tỷ lệ chuẩn cân đối */}
      <main style={currentView === 'HOME' ? {aspectRatio: '2 / 3'} : undefined} className="relative w-full h-full sm:h-auto sm:max-h-[92dvh] sm:aspect-[9/15] max-w-md sm:max-w-lg md:max-w-[480px] lg:max-w-[500px] bg-white sm:rounded-3xl sm:border-4 sm:border-[#8C5824]/30 shadow-2xl overflow-hidden flex flex-col">
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
      </main>
    </div>
  );
}
