// Giữ hệ tọa độ cũ, tăng bộ đệm theo kích thước thật trên màn hình.
export function prepareCanvas(canvas: HTMLCanvasElement, logicalWidth: number, logicalHeight: number) {
  const ratio = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
  const width = canvas.clientWidth || logicalWidth;
  const height = canvas.clientHeight || logicalHeight;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(canvas.width / logicalWidth, 0, 0, canvas.height / logicalHeight, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0,0,logicalWidth,logicalHeight);
  }
  return ctx;
}
