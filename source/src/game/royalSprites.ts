// Bản thử: chỉ đổi mỹ thuật cấp 1–3, không mua skin hoặc sửa dữ liệu của người chơi.
import pillUrl from '../../public/royal-pill.png?url';
import bandageUrl from '../../public/royal-bandage.png?url';
import tapeUrl from '../../public/royal-tape.png?url';

let trialEnabled = true;
export const setRoyalTrialEnabled = (enabled: boolean) => { trialEnabled = enabled; };
export const isRoyalTrialEnabled = () => trialEnabled;

// Tải đúng một lần; vòng vẽ chỉ dùng lại ảnh đã giải mã, không tải ở mỗi frame.
const urls = [pillUrl, bandageUrl, tapeUrl];
const images: HTMLImageElement[] = [];
export const royalSpritesReady = Promise.all(urls.map((url, index) => new Promise<void>((resolve) => {
  const img = new Image();
  images[index] = img;
  img.onload = () => resolve();
  img.onerror = () => resolve(); // Nếu ảnh lỗi, renderer quay về hình gốc.
  img.src = url;
})));

export function getRoyalSprite(level: number): HTMLImageElement | null {
  const img = images[level - 1];
  return img?.complete && img.naturalWidth > 0 ? img : null;
}

// Tọa độ được căn theo vùng mặt trống của từng ảnh; sprite không có mắt/miệng sẵn.
export const royalFaceAnchors = [
  { x: 0.50, y: 0.40, size: 0.42 },
  { x: 0.50, y: 0.54, size: 0.25 },
  { x: 0.70, y: 0.53, size: 0.30 },
];

// Cắt bằng source rectangle lúc vẽ, không giải mã/cắt ảnh lại ở mỗi frame.
export const royalSourceFrames = [
  { x: 46, y: 28, width: 845, height: 1605 },
  { x: 73, y: 87, width: 1628, height: 670 },
  { x: 44, y: 48, width: 1185, height: 1142 },
];
