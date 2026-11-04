export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_INPUT_PIXELS = 24_000_000;
export const MAX_OUTPUT_PIXELS = 16_000_000;
export type Dimensions = { width: number; height: number };
export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';
export function sniffDimensions(bytes: Uint8Array): Dimensions {
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const ascii = (i:number,n:number) => String.fromCharCode(...bytes.subarray(i,i+n));
  if(bytes.length<24)throw new Error('invalid-image');
  if(bytes[0]===137 && ascii(1,3)==='PNG' && ascii(12,4)==='IHDR')return{width:view.getUint32(16),height:view.getUint32(20)};
  if(bytes[0]===255 && bytes[1]===216){
    let p=2;
    while(p+4<=bytes.length){
      if(bytes[p]!==255)throw new Error('invalid-image');
      while(bytes[p]===255)p++;
      const marker=bytes[p++];
      if(marker===0xd9 || marker===0xda)break;
      if(marker===0x01 || (marker>=0xd0 && marker<=0xd7))continue;
      if(p+2>bytes.length)break;
      const length=view.getUint16(p);
      if(length<2 || p+length>bytes.length)throw new Error('invalid-image');
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
        if(length<8)throw new Error('invalid-image');
        return{width:view.getUint16(p+5),height:view.getUint16(p+3)};
      }
      p+=length;
    }
  }
  if(ascii(0,4)==='RIFF' && ascii(8,4)==='WEBP'){
    const type=ascii(12,4);
    if(type==='VP8X' && bytes.length>=30){if(bytes[20]&2)throw new Error('animated-image');return{width:1+bytes[24]+(bytes[25]<<8)+(bytes[26]<<16),height:1+bytes[27]+(bytes[28]<<8)+(bytes[29]<<16)};}
    if(type==='VP8 ' && bytes.length>=30 && bytes[23]===0x9d && bytes[24]===0x01 && bytes[25]===0x2a)return{width:view.getUint16(26,true)&0x3fff,height:view.getUint16(28,true)&0x3fff};
    if(type==='VP8L' && bytes.length>=25 && bytes[20]===0x2f)return{width:1+bytes[21]+((bytes[22]&0x3f)<<8),height:1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10)};
  }
  throw new Error('invalid-image');
}
export function validateDimensions(d:Dimensions,maxPixels=MAX_INPUT_PIXELS){
  if(!Number.isInteger(d.width)||!Number.isInteger(d.height)||d.width<1||d.height<1)throw new Error('invalid-dimensions');
  if(d.width*d.height>maxPixels||d.width>12000||d.height>12000)throw new Error('pixel-limit');
}
export function resizePlan(source:Dimensions,target:Dimensions,mode:'fit'|'crop'){
  validateDimensions(source);validateDimensions(target,MAX_OUTPUT_PIXELS);
  if(mode==='fit'){
    const scale=Math.min(target.width/source.width,target.height/source.height,1);
    return{sx:0,sy:0,sw:source.width,sh:source.height,width:Math.max(1,Math.round(source.width*scale)),height:Math.max(1,Math.round(source.height*scale))};
  }
  const ratio=target.width/target.height;
  let sw=source.width,sh=source.height;
  if(source.width/source.height>ratio)sw=source.height*ratio;else sh=source.width/ratio;
  return{sx:(source.width-sw)/2,sy:(source.height-sh)/2,sw,sh,width:target.width,height:target.height};
}
export type EncodedResult = { blob:Blob; quality:number; metTarget:boolean };
export async function encodeToTarget(encode:(quality:number)=>Promise<Blob>,quality:number,targetBytes:number|undefined,lossless:boolean,cancelled:()=>boolean=()=>false):Promise<EncodedResult>{
  if(!Number.isFinite(quality)||quality<0.1||quality>1)throw new Error('quality-range');
  if(targetBytes!==undefined && (!Number.isFinite(targetBytes)||targetBytes<1000||targetBytes>20_000_000))throw new Error('target-range');
  const run=async(q:number)=>{if(cancelled())throw new Error('cancelled');const blob=await encode(q);if(cancelled())throw new Error('cancelled');return blob;};
  const initial=await run(quality);
  if(!targetBytes || initial.size<=targetBytes)return{blob:initial,quality,metTarget:true};
  if(lossless)return{blob:initial,quality,metTarget:false};
  let low=.1,high=quality,best=await run(low),bestQuality=low;
  if(best.size>targetBytes)return{blob:best,quality:low,metTarget:false};
  for(let i=0;i<8;i++){
    const mid=(low+high)/2;const blob=await run(mid);
    if(blob.size<=targetBytes){low=mid;if(mid>bestQuality){best=blob;bestQuality=mid;}}else high=mid;
  }
  return{blob:best,quality:bestQuality,metTarget:best.size<=targetBytes};
}
export async function readImage(file:File):Promise<ImageBitmap>{
  if(file.size>MAX_FILE_BYTES)throw new Error('file-limit');
  if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('file-type');
  const bytes=new Uint8Array(await file.arrayBuffer());
  const dimensions=sniffDimensions(bytes);validateDimensions(dimensions);
  let bitmap:ImageBitmap;
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('decode-failed');}
  try{validateDimensions(bitmap);}catch(e){bitmap.close();throw e;}
  return bitmap;
}
export async function processImage(bitmap:ImageBitmap,options:{width:number;height:number;mode:'fit'|'crop';format:ImageFormat;quality:number;targetBytes?:number},cancelled:()=>boolean,canvasFactory:()=>HTMLCanvasElement=()=>document.createElement('canvas')){
  const plan=resizePlan(bitmap,options,options.mode);
  const canvas=canvasFactory();canvas.width=plan.width;canvas.height=plan.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('canvas-failed');
  try{
    if(options.format==='image/jpeg'){ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);}
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    ctx.drawImage(bitmap,plan.sx,plan.sy,plan.sw,plan.sh,0,0,plan.width,plan.height);
    const encode=(quality:number)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>{if(!blob)reject(new Error('encode-failed'));else if(blob.type!==options.format)reject(new Error('format-unavailable'));else resolve(blob);},options.format,quality));
    const result=await encodeToTarget(encode,options.quality,options.targetBytes,options.format==='image/png',cancelled);
    return{...result,width:plan.width,height:plan.height};
  }finally{canvas.width=1;canvas.height=1;}
}
