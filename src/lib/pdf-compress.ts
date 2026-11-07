import {PDFDocument,PDFName,PDFNumber,PDFRawStream,PDFArray} from 'pdf-lib';
import type {PdfSource} from './pdf';
import {assertStaticPages} from './pdf';

// Recompress only ordinary JPEG XObjects. Leave masks, unusual colour spaces,
// inverted samples, CCITT/JBIG2 scans and all text/vector operators untouched.
export function jpegCandidate(stream:PDFRawStream){
  const dict=stream.dict,context=dict.context;
  const get=(name:string)=>context.lookup(dict.get(PDFName.of(name)));
  if(get('Subtype')!==PDFName.of('Image'))return;
  let filter=get('Filter');if(filter instanceof PDFArray&&filter.size()===1)filter=context.lookup(filter.get(0));
  if(filter!==PDFName.of('DCTDecode'))return;
  if(![PDFName.of('DeviceRGB'),PDFName.of('DeviceGray')].includes(get('ColorSpace') as PDFName))return;
  if(['Decode','DecodeParms','SMask','Mask','ImageMask','SMaskInData','Alternates'].some(key=>dict.has(PDFName.of(key))))return;
  const width=get('Width'),height=get('Height'),bits=get('BitsPerComponent');
  if(!(width instanceof PDFNumber)||!(height instanceof PDFNumber)||!(bits instanceof PDFNumber)||bits.asNumber()!==8)return;
  const w=width.asNumber(),h=height.asNumber(),bytes=stream.getContents();
  if(w<1||h<1||w*h>12000000||bytes.length<16000||bytes[0]!==255||bytes[1]!==216)return;
  // Keep EXIF-oriented and non-sRGB colour-managed images untouched. The
  // standard sRGB profile emitted by browsers/Skia has an identity conversion
  // to our sRGB canvas and can be handled without a colour-space change.
  for(let offset=2;offset+4<bytes.length;){
    if(bytes[offset]!==255)break;
    const marker=bytes[offset+1];if(marker===218||marker===217)break;
    const length=bytes[offset+2]*256+bytes[offset+3];if(length<2)break;
    if(marker===225)return;
    if(marker===226){
      const app=bytes.subarray(offset+4,offset+2+length),text=new TextDecoder('latin1');
      if(text.decode(app.subarray(0,12))!=='ICC_PROFILE\0'||app[12]!==1||app[13]!==1)return;
      const profile=app.subarray(14);
      if(text.decode(profile.subarray(16,20))!=='RGB '||!text.decode(profile).replaceAll('\0','').toLowerCase().includes('srgb'))return;
    }
    offset+=2+length;
  }
  return {width:w,height:h};
}

export async function optimisePdfImages(source:PdfSource,quality:number,check:()=>void,progress:(done:number,total:number)=>void){
  assertStaticPages([source]);
  const document=await PDFDocument.load(source.bytes,{updateMetadata:false});check();
  const candidates=document.context.enumerateIndirectObjects().filter((entry):entry is [typeof entry[0],PDFRawStream]=>entry[1] instanceof PDFRawStream&&!!jpegCandidate(entry[1]));
  let changed=0;
  for(const [index,[ref,stream]] of candidates.entries()){
    check();progress(index+1,candidates.length);
    const size=jpegCandidate(stream)!;let bitmap:ImageBitmap|undefined;
    const canvas=window.document.createElement('canvas');
    try{
      bitmap=await createImageBitmap(new Blob([Uint8Array.from(stream.getContents()).buffer],{type:'image/jpeg'}),{imageOrientation:'none',colorSpaceConversion:'none'});check();
      if(bitmap.width!==size.width||bitmap.height!==size.height)continue;
      canvas.width=size.width;canvas.height=size.height;
      const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)continue;ctx.drawImage(bitmap,0,0);
      const encoded=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/jpeg',quality));check();
      if(!encoded||encoded.size>=stream.getContentsSize()*.97)continue;
      const dictionary=stream.dict.clone(document.context);
      dictionary.set(PDFName.of('ColorSpace'),PDFName.of('DeviceRGB'));
      dictionary.set(PDFName.of('Length'),PDFNumber.of(encoded.size));
      document.context.assign(ref,PDFRawStream.of(dictionary,new Uint8Array(await encoded.arrayBuffer())));changed++;
    }catch(error){check();/* Unsupported decoder: preserve this image as-is. */}
    finally{bitmap?.close();canvas.width=canvas.height=0;}
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  check();return {bytes:await document.save({useObjectStreams:true}),changed};
}
