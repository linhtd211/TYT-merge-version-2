import React, {useEffect, useRef} from 'react';
import {drawMedicalMascot} from '../game/renderer';

// Dùng đúng bộ vật phẩm đang chọn, không đưa hình vẽ mẫu vào dữ liệu game.
export function MedicalPreview({level, size=64}: {level: number; size?: number}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const render=() => {
      const c=ref.current;if(!c)return;
      const dpr=Math.min(3, Math.max(2, window.devicePixelRatio || 1));
      c.width=size*dpr;c.height=size*dpr;
      const ctx=c.getContext('2d');if(!ctx)return;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      drawMedicalMascot(ctx,size/2,size/2,level,0,.95,'happy',0,size*.46);
    };
    render();window.addEventListener('skin-change',render);
    return () => window.removeEventListener('skin-change',render);
  },[level,size]);
  return <canvas ref={ref} style={{width:size,height:size}} aria-hidden="true"/>;
}
