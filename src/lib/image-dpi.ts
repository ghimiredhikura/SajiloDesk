// Canvas encoders don't retain the PDF's physical resolution. Add density
// metadata without re-encoding or changing any image samples.
export async function imageDpi(blob:Blob,dpi:number):Promise<Blob>{
 const data=new Uint8Array(await blob.arrayBuffer()),density=Math.max(1,Math.min(65535,Math.round(dpi)));
 if(blob.type==='image/jpeg'){
  if(data[0]!==255||data[1]!==216)return blob;
  for(let offset=2;offset+16<data.length&&data[offset]===255;){
   const marker=data[offset+1];if(marker===218||marker===217)break;
   const size=data[offset+2]*256+data[offset+3];if(size<2||offset+size+2>data.length)break;
   if(marker===224&&String.fromCharCode(...data.subarray(offset+4,offset+9))==='JFIF\0'){
    data[offset+11]=1;data[offset+12]=data[offset+14]=density>>>8;data[offset+13]=data[offset+15]=density&255;
    return new Blob([data.buffer],{type:blob.type});
   }offset+=size+2;
  }
  const jfif=new Uint8Array([255,224,0,16,74,70,73,70,0,1,2,1,density>>>8,density&255,density>>>8,density&255,0,0]);
  return new Blob([data.subarray(0,2),jfif,data.subarray(2)],{type:blob.type});
 }
 if(blob.type==='image/png'){
  const chunk=new Uint8Array(21),view=new DataView(chunk.buffer);view.setUint32(0,9);chunk.set([112,72,89,115],4);
  const ppm=Math.round(dpi/.0254);view.setUint32(8,ppm);view.setUint32(12,ppm);chunk[16]=1;
  let crc=0xffffffff;for(const byte of chunk.subarray(4,17)){crc^=byte;for(let bit=0;bit<8;bit++)crc=crc&1?0xedb88320^(crc>>>1):crc>>>1;}view.setUint32(17,(crc^0xffffffff)>>>0);
  const input=new DataView(data.buffer);let existing=-1,existingSize=0;
  for(let offset=8;offset+12<=data.length;){const size=input.getUint32(offset);if(offset+size+12>data.length)return blob;
   const type=String.fromCharCode(...data.subarray(offset+4,offset+8));if(type==='pHYs'){existing=offset;existingSize=size+12;break;}if(type==='IDAT')break;offset+=size+12;
  }
  if(existing>=0)return new Blob([data.subarray(0,existing),chunk,data.subarray(existing+existingSize)],{type:blob.type});
  // IHDR is always the first chunk (8 signature + 25 IHDR bytes).
  return new Blob([data.subarray(0,33),chunk,data.subarray(33)],{type:blob.type});
 }
 return blob;
}
