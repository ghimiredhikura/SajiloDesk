import { PDFDocument,PDFSignature,StandardFonts,rgb } from 'pdf-lib';

export const pdfLimits={fileBytes:20*1024*1024,totalBytes:50*1024*1024,files:10,pages:500,compressPages:50};
export type PdfSource={name:string;bytes:Uint8Array;document:PDFDocument;pages:number};
export function pageSelection(value:string,count:number):number[]{
  const text=value.replace(/[०-९]/g,c=>String(c.charCodeAt(0)-0x0966)).replace(/[–—]/g,'-').trim();
  if(!text||text.length>2000)throw new Error('pages');
  const pages=new Set<number>();
  for(const part of text.split(',')){
    const match=/^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(part);
    if(!match)throw new Error('pages');
    const first=Number(match[1]),last=Number(match[2]||match[1]);
    if(!Number.isSafeInteger(first)||first<1||last<first||last>count)throw new Error('pages');
    for(let page=first;page<=last;page++)pages.add(page-1);
  }
  return [...pages];
}
export async function openPdf(file:File):Promise<PdfSource>{
  if(file.size>pdfLimits.fileBytes)throw new Error('file-limit');
  const bytes=new Uint8Array(await file.arrayBuffer());
  // File extensions and browser MIME types alone do not establish a PDF.
  if(!new TextDecoder().decode(bytes.subarray(0,1024)).includes('%PDF-'))throw new Error('invalid-pdf');
  let document:PDFDocument;
  try{document=await PDFDocument.load(bytes,{updateMetadata:false,throwOnInvalidObject:true});}
  catch(error){if(String(error).toLowerCase().includes('encrypt'))throw new Error('encrypted');throw new Error('invalid-pdf');}
  const pages=document.getPageCount();
  if(pages<1||pages>pdfLimits.pages)throw new Error('page-limit');
  if(document.getForm().getFields().some(field=>field instanceof PDFSignature))throw new Error('signed');
  return {name:file.name,bytes,document,pages};
}
export function assertStaticPages(sources:PdfSource[]){
  // copyPages does not reconstruct the document-wide interactive form tree.
  if(sources.some(source=>source.document.getForm().getFields().length))throw new Error('form-pdf');
}
export async function copyPdfPages(sources:{source:PdfSource;indices:number[]}[],check:()=>void=()=>{}){
  assertStaticPages(sources.map(s=>s.source));
  const output=await PDFDocument.create();
  for(const {source,indices} of sources){
    check();const pages=await output.copyPages(source.document,indices);
    pages.forEach(page=>output.addPage(page));
    await new Promise(resolve=>setTimeout(resolve,0));check();
  }
  return output.save({useObjectStreams:true});
}
export async function examplePdfs():Promise<File[]>{
  const files:File[]=[];
  for(const [name,count] of [['sajilo-example.pdf',3],['sajilo-extra.pdf',2]] as const){
    const document=await PDFDocument.create(),font=await document.embedFont(StandardFonts.Helvetica);
    for(let index=0;index<count;index++){
      const page=document.addPage([420,594]);
      page.drawRectangle({x:0,y:0,width:420,height:594,color:rgb(.98,.97,.94)});
      page.drawRectangle({x:28,y:484,width:364,height:82,color:rgb(.96,.32,.19)});
      page.drawText('SajiloDesk',{x:44,y:524,size:26,font,color:rgb(1,1,1)});
      page.drawText(name.includes('extra')?'An extra example':'Your everyday PDF',{x:44,y:500,size:13,font,color:rgb(1,1,1)});
      page.drawText(`Page ${index+1}`,{x:36,y:423,size:34,font,color:rgb(.12,.16,.24)});
      page.drawText('Try extracting, merging or saving this page.',{x:36,y:382,size:13,font});
      page.drawText('Example only. No personal documents.',{x:36,y:354,size:13,font});
      for(let row=0;row<5;row++)page.drawRectangle({x:36,y:275-row*29,width:row%2?268:340,height:10,color:rgb(.84,.86,.86)});
      page.drawText(`${index+1} / ${count}`,{x:350,y:28,size:11,font});
    }
    files.push(new File([Uint8Array.from(await document.save()).buffer],name,{type:'application/pdf'}));
  }
  return files;
}
