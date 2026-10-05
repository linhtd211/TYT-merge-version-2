import {build} from 'esbuild';
import {createCanvas,Image} from '@napi-rs/canvas';
import fs from 'node:fs';import path from 'node:path';
class BrowserImage extends Image{get naturalWidth(){return this.width;}get naturalHeight(){return this.height;}get complete(){return this.width>0;}}
globalThis.Image=BrowserImage;globalThis.document={createElement:()=>createCanvas(1,1)};globalThis.localStorage={getItem:()=>null};
await build({stdin:{contents:"export * from './src/game/renderer';export * from './src/game/sprites';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile:'../qa-full-renderer.mjs',plugins:[{name:'sprite',setup(b){b.onResolve({filter:/\.webp\?url$/},args=>({path:path.resolve(args.resolveDir,args.path.replace('?url',''))}));}}],loader:{'.webp':'dataurl'}});
const {drawMedicalMascot,drawDoctorDropper,spritesReady,getSprite}=await import('../qa-full-renderer.mjs');await spritesReady;
const skins=['classic','sakura','royal','cyber'];const states=['happy','falling','squished','merge_excited'];
const canvas=createCanvas(1440,880),ctx=canvas.getContext('2d');ctx.fillStyle='#fff9ed';ctx.fillRect(0,0,1440,880);
for(let row=0;row<4;row++){
 ctx.fillStyle='#573718';ctx.font='bold 20px sans-serif';ctx.fillText(skins[row],15,row*220+24);
 for(let level=1;level<=12;level++){
  if(!getSprite(skins[row],level,100))throw Error('Missing '+skins[row]+' '+level);
  const x=(level-.5)*120,y=row*220+95;
  drawMedicalMascot(ctx,x,y,level,0,1,'happy',1000,undefined,skins[row]);
  drawMedicalMascot(ctx,x,y+77,level,0,1,'happy',1000,17,skins[row]);
  ctx.fillStyle='#573718';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(String(level),x,row*220+210);
  const variants=states.map(state=>{const c=createCanvas(150,150);drawMedicalMascot(c.getContext('2d'),75,75,level,.15,1,state,1000,undefined,skins[row]);return c.toBuffer('image/png').toString('base64');});
  if(new Set(variants).size!==4)throw Error('Expression frozen '+skins[row]+' '+level);
 }
}
fs.writeFileSync('../qa-all-items.png',canvas.toBuffer('image/png'));
const n=createCanvas(720,200),nc=n.getContext('2d');nc.fillStyle='#fff9ed';nc.fillRect(0,0,720,200);
for(let i=0;i<4;i++){nc.save();nc.translate(i*180+90,100);nc.scale(2,2);drawDoctorDropper(nc,0,0,1,i===1,1000,1200,1,i===2,i===3?4:1);nc.restore();}
fs.writeFileSync('../qa-nurse.png',n.toBuffer('image/png'));
console.log('48 sprites loaded; all 192 expression renders verified.');
