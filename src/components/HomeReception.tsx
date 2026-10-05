import React from 'react';
import templateUrl from '../../public/art/home-template.webp?url';

interface HomeReceptionProps {
  bestScore: number; coins: number; bestCombo: number;
  unlockedCount: number; totalItems: number; unclaimedCount: number;
  hasSavedGame: boolean; savedSummary: string;
  onPlay: () => void; onNewGame: () => void; onSettings: () => void;
  onMissions: () => void; onSkins: () => void; onCollection: () => void;
  canInstall: boolean; onInstall: () => void;
}

// Tranh mẫu giữ nguyên tỷ lệ. Chỉ chữ, số liệu và vùng thao tác là lớp React.
// Những vật tư trên quầy là minh họa trang trí của trang chủ; vật trong game vẫn theo bộ đã chọn.
export function HomeReception(p: HomeReceptionProps) {
  return <section className="faithful-home" style={{backgroundImage:`url(${templateUrl})`}} aria-label="Trang chủ Trạm Y Tế Merge">
    <div className="home-ambience" aria-hidden="true">
      <span className="home-sign-glint" />
      <i className="home-spark home-spark-one">✦</i><i className="home-spark home-spark-two">✧</i>
      <i className="home-spark home-spark-three">✦</i><i className="home-heart">♡</i>
      <span className="home-play-halo" />
    </div>
    <h1 className="sr-only">TRẠM Y TẾ MERGE</h1>
    <div className="faithful-record"><small>Kỷ lục</small><strong style={{fontSize:`${Math.min(3.5,18/p.bestScore.toLocaleString('vi-VN').length)}cqw`}}>{p.bestScore.toLocaleString('vi-VN')}</strong></div>
    <div className="faithful-coins" aria-label={`Xu Y Tế: ${p.coins}`}><strong style={{fontSize:`${Math.min(3.5,32/p.coins.toLocaleString('vi-VN').length)}cqw`}}>{p.coins.toLocaleString('vi-VN')}</strong></div>
    <button className="faithful-settings" onClick={p.onSettings} aria-label="Cài đặt" title="Cài đặt"/>
    <div className="faithful-combo">Combo cao nhất: <strong>x{p.bestCombo}</strong></div>
    <div className="faithful-collection-count">Bộ sưu tập: <strong>{p.unlockedCount}/{p.totalItems}</strong></div>
    <button className="faithful-play" onClick={p.onPlay}><span>{p.hasSavedGame ? 'TIẾP TỤC VÁN CHƠI' : 'BẮT ĐẦU CA TRỰC'}</span></button>
    <nav className="faithful-menu" aria-label="Menu chính">
      <button onClick={p.onMissions}><span>Nhiệm vụ</span>{p.unclaimedCount>0 && <b className="faithful-badge">{p.unclaimedCount}</b>}</button>
      <button onClick={p.onSkins}><span>Trang phục</span></button>
      <button onClick={p.onCollection}><span>Bộ sưu tập</span></button>
    </nav>
    {p.hasSavedGame && <div className="faithful-saved"><span>{p.savedSummary}</span><button onClick={p.onNewGame}>Chơi ván mới</button></div>}
    {p.canInstall && <button className="faithful-install" onClick={p.onInstall}>Cài ứng dụng</button>}
  </section>;
}
