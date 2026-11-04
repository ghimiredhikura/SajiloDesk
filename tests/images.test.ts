import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {sniffDimensions,validateDimensions,resizePlan,encodeToTarget,processImage,type ImageFormat} from '../src/lib/images';
test('fit preserves aspect ratio without upscaling; center crop uses exact dimensions',()=>{
  assert.deepEqual(resizePlan({width:1200,height:800},{width:600,height:600},'fit'),{sx:0,sy:0,sw:1200,sh:800,width:600,height:400});
  assert.deepEqual(resizePlan({width:1200,height:800},{width:600,height:600},'crop'),{sx:200,sy:0,sw:800,sh:800,width:600,height:600});
  assert.equal(resizePlan({width:100,height:50},{width:500,height:500},'fit').width,100);
});
test('file header checks read real PNG, JPEG and WebP dimensions',()=>{
  const canvas=createCanvas(640,480);canvas.getContext('2d').fillRect(0,0,640,480);
  for(const mime of ['image/png','image/jpeg','image/webp'] as const){const bytes=mime==='image/png'?canvas.toBuffer('image/png'):canvas.toBuffer(mime);assert.deepEqual(sniffDimensions(bytes),{width:640,height:480});}
  assert.throws(()=>sniffDimensions(new Uint8Array(30)));assert.throws(()=>sniffDimensions(new Uint8Array(4)));
});
test('dimension and memory guards reject invalid and extreme image requests',()=>{
  for(const dimensions of [{width:0,height:100},{width:NaN,height:1},{width:10.5,height:10},{width:100000,height:100000},{width:12001,height:1}])assert.throws(()=>validateDimensions(dimensions));
  assert.throws(()=>resizePlan({width:6000,height:4000},{width:6000,height:4000},'crop'),/pixel-limit/);
});
test('quality search reports true sizes, preserves the highest feasible quality and reports impossible targets',async()=>{
  const encode=async(q:number)=>new Blob([new Uint8Array(Math.ceil(1000+q*10000))],{type:'image/jpeg'});
  const result=await encodeToTarget(encode,.9,5000,false);assert.ok(result.blob.size<=5000);assert.ok(result.quality>.39);assert.equal(result.metTarget,true);
  const impossible=await encodeToTarget(encode,.9,1000,false);assert.equal(impossible.metTarget,false);assert.equal(impossible.blob.size,2000);
  const lossless=await encodeToTarget(encode,.9,5000,true);assert.equal(lossless.blob.size,10000);assert.equal(lossless.metTarget,false);
  await assert.rejects(()=>encodeToTarget(encode,.8,5000,false,()=>true),/cancelled/);
  await assert.rejects(()=>encodeToTarget(encode,.8,0,false),/target-range/);
});
test('real raster output matches displayed dimensions, MIME and byte count in the shared processing pipeline',async()=>{
  const source=createCanvas(640,480),ctx=source.getContext('2d');
  ctx.fillStyle='#f6d3b6';ctx.fillRect(0,0,640,480);ctx.fillStyle='#302a4d';ctx.fillRect(160,80,320,320);ctx.fillStyle='#ffffff';ctx.font='28px sans-serif';ctx.fillText('SYNTHETIC TEST',180,240);
  const factory=()=>createCanvas(1,1) as unknown as HTMLCanvasElement;
  await mkdir('tmp/test-images',{recursive:true});await writeFile('tmp/test-images/synthetic-source.png',source.toBuffer('image/png'));
  for(const format of ['image/jpeg','image/png','image/webp'] as ImageFormat[]){
    const result=await processImage(source as unknown as ImageBitmap,{width:240,height:240,mode:'crop',format,quality:.85,targetBytes:100000},()=>false,factory);
    assert.equal(result.width,240);assert.equal(result.height,240);assert.equal(result.blob.type,format);
    const bytes=Buffer.from(await result.blob.arrayBuffer());assert.equal(bytes.length,result.blob.size);assert.deepEqual(sniffDimensions(bytes),{width:240,height:240});
    const decoded=await loadImage(bytes);assert.equal(decoded.width,240);assert.equal(decoded.height,240);
    await writeFile(`tmp/test-images/output.${format.split('/')[1]}`,bytes);
  }
});
