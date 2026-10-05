// Ảnh thân không có mặt; mắt/miệng được Canvas vẽ riêng theo vật lý từng frame.
import classicUrl from '../../public/art/classic.webp?url';
import sakuraUrl from '../../public/art/sakura.webp?url';
import royalUrl from '../../public/art/royal.webp?url';
import spaceUrl from '../../public/art/cyber.webp?url';
import nurseUrl from '../../public/art/nurse.webp?url';
import manifest from '../../public/art/frames.json';

type Frame = {x: number; y: number; width: number; height: number; face: {x:number;y:number;size:number}};
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
export const spritesReady = Promise.all([
  ...Object.entries(urls).map(([skin,url]) => new Promise<void>(resolve => {
    const img = new Image();
    img.onload = () => {
      sprites[skin] = (manifest[skin as keyof typeof manifest] as Frame[]).map(frame => ({frame,chain:makeChain(img,frame)}));
      resolve();
    };
    img.onerror = () => resolve(); // Giữ bộ vẽ Canvas dự phòng nếu ảnh tải lỗi.
    img.src = url;
  })),
  new Promise<void>(resolve => {const img=new Image();img.onload=()=>{nurse=img;resolve();};img.onerror=()=>resolve();img.src=nurseUrl;})
]);
export function getSprite(skin: string, level: number, pixels: number) {
  const sprite = sprites[skin]?.[level-1];
  if (!sprite) return null;
  let source = sprite.chain[0];
  for (const canvas of sprite.chain) { if (Math.max(canvas.width,canvas.height)<pixels) break; source=canvas; }
  return {source, frame:sprite.frame};
}
export function getNurseSprite() { return nurse; }
