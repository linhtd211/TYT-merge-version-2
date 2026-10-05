// Ảnh thân không có mặt; mắt/miệng được Canvas vẽ riêng theo vật lý từng frame.
import classicUrl from '../../public/art/classic.webp?url';
import sakuraUrl from '../../public/art/sakura.webp?url';
import royalUrl from '../../public/art/royal.webp?url';
import spaceUrl from '../../public/art/cyber.webp?url';
import nurseUrl from '../../public/art/nurse.webp?url';
import manifest from '../../public/art/frames.json';

type Frame = {x: number; y: number; width: number; height: number; face: {x:number;y:number;size:number;dark?:boolean}; body: {x:number;y:number;width:number;height:number}};
type Sprite = {chain: HTMLCanvasElement[]; frame: Frame};
const sprites: Record<string, Sprite[]> = {};
let nurse: HTMLImageElement | null = null;
function makeChain(img: HTMLImageElement, frame: Frame) {
  let canvas = document.createElement('canvas');
  canvas.width = frame.width; canvas.height = frame.height;
  canvas.getContext('2d')!.drawImage(img, frame.x, frame.y, frame.width, frame.height, 0, 0, frame.width, frame.height);
  const chain = [canvas];
  while (Math.max(canvas.width, canvas.height) > 32) {
    const next = document.createElement('canvas');
    next.width = Math.max(1, Math.round(canvas.width / 2));
    next.height = Math.max(1, Math.round(canvas.height / 2));
    const ctx = next.getContext('2d')!;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, next.width, next.height);
    chain.push(next); canvas = next;
  }
  return chain;
}
const urls: Record<string,string> = {classic:classicUrl,sakura:sakuraUrl,royal:royalUrl,cyber:spaceUrl};
// Lỗi ảnh không giữ màn hình khởi động mãi; bộ vẽ Canvas vẫn có thể chạy.
function loadImage(url: string, apply: (img: HTMLImageElement) => void): Promise<void> {
  return new Promise(resolve => {
    const img = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      img.onload = null; img.onerror = null; resolve();
    };
    const timer = setTimeout(finish, 12000);
    img.onload = () => {
      try { apply(img); }
      catch (error) { console.warn('Không chuẩn bị được ảnh; dùng bộ vẽ dự phòng.', error); }
      finally { finish(); }
    };
    img.onerror = finish;
    img.src = url;
  });
}
export const spritesReady = Promise.all([
  ...Object.entries(urls).map(([skin,url]) => loadImage(url, img => {
    const prepared = (manifest[skin as keyof typeof manifest] as Frame[]).map(frame => ({frame,chain:makeChain(img,frame)}));
    sprites[skin] = prepared;
  })),
  loadImage(nurseUrl, img => { nurse = img; })
]);
export function getSprite(skin: string, level: number, pixels: number) {
  const sprite = sprites[skin]?.[level-1];
  if (!sprite) return null;
  let source = sprite.chain[0];
  for (const canvas of sprite.chain) { if (Math.max(canvas.width,canvas.height)<pixels) break; source=canvas; }
  return {source, frame:sprite.frame};
}
export function getNurseSprite() { return nurse; }
