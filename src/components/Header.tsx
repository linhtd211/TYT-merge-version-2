/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import headerArt from '../../public/art/play-header.webp?url';
import React from 'react';
import { Settings, Volume2, VolumeX, Crown, Home, WifiOff, Save, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../game/audio';

interface HeaderProps {
  score: number;
  bestScore: number;
  combo: number;
  onOpenSettings: () => void;
  sfxEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
  isOnline?: boolean;
  onSaveNow?: () => void;
  isSavedRecently?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  bestScore,
  combo,
  onOpenSettings,
  sfxEnabled,
  onToggleSound,
  onGoHome,
  isOnline = true,
  onSaveNow,
  isSavedRecently = false,
}) => {
  return (
    <div className="play-header-safe">
      <header className="play-header" style={{backgroundImage:`url(${headerArt})`}}>
        {onGoHome && <button className="play-home" onClick={onGoHome} aria-label="Về trang chủ" title="Về trang chủ và tự động lưu"/>}
        {onSaveNow && <button className="play-save" onClick={onSaveNow} aria-label="Lưu ván chơi" title="Lưu ván chơi">{isSavedRecently && <CheckCircle2 className="play-saved-icon"/>}</button>}
        <button className="play-settings" onClick={onOpenSettings} aria-label="Cài đặt"/>
        <strong className="play-score-value" style={{fontSize:`${Math.min(4.2,18/score.toLocaleString('vi-VN').length)}cqw`}}>{score.toLocaleString('vi-VN')}</strong>
        <strong className="play-best-value" style={{fontSize:`${Math.min(4.2,18/bestScore.toLocaleString('vi-VN').length)}cqw`}}>{bestScore.toLocaleString('vi-VN')}</strong>
        <button className="play-sound" onClick={() => {soundManager.initContext();onToggleSound();}} aria-label="Bật tắt âm thanh" title={sfxEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}>{!sfxEnabled && <VolumeX className="play-muted-icon"/>}</button>
        {!isOnline && <span className="play-offline">Ngoại tuyến</span>}
      </header>
    </div>
  );
};
