import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';
import { royalSpritesReady } from './game/royalSprites';

// Phát hiện khi chạy dạng ứng dụng thêm vào màn hình chính trên iOS (Standalone PWA)
if (typeof window !== 'undefined') {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && isStandalone) {
    document.documentElement.classList.add('is-standalone-ios');
  }
}

// Tự động đăng ký Service Worker để ứng dụng và trò chơi hoạt động 100% Offline
if (window.location.protocol !== 'file:' && document.documentElement.dataset.offlineTest !== 'true') registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Có phiên bản mới của Trạm Y Tế Merge');
  },
  onOfflineReady() {
    console.log('Trò chơi đã sẵn sàng chơi Ngoại tuyến (Offline)!');
  },
});

royalSpritesReady.then(() => createRoot(document.getElementById('root')!).render(<App />));
