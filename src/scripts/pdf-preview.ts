import {renderDocument,pageCanvas} from '../lib/pdf-render';
import {t,number} from './form-utils';

// One PDF worker and a bounded set of visible page canvases, rather than a
// bitmap for every page of a potentially 500-page document.
export function createPdfPreview(root:HTMLElement,counter:HTMLElement,status:HTMLElement){
  let document:Awaited<ReturnType<typeof renderDocument>>|undefined;
  let observer:IntersectionObserver|undefined,version=0,layout=0,zoom=1,running=false;
  let shown:Uint8Array|Blob|undefined,imageUrl='',pageCount=0;
  let figures:HTMLElement[]=[],near=new Set<number>(),wanted=new Set<number>(),ready=new Set<number>();
  const clearCanvas=(index:number)=>{
    const frame=figures[index];if(!frame)return;
    const canvas=frame.querySelector('canvas');if(canvas){canvas.width=canvas.height=0;canvas.remove();}
    frame.dataset.rendered='false';ready.delete(index);
  };
  const pageNumber=()=>{
    const bounds=root.getBoundingClientRect();let best=0,distance=Infinity;
    figures.forEach((figure,index)=>{const box=figure.getBoundingClientRect();const d=Math.abs(box.top-bounds.top);if(box.bottom>bounds.top&&d<distance){distance=d;best=index;}});
    counter.textContent=pageCount?`${t('Page','पाना')} ${number(best+1,0)} / ${number(pageCount,0)}`:'';
    root.dataset.page=String(best+1);
  };
  const drain=async()=>{
    if(running)return;running=true;
    try{
      while(document){
        const mine=version,resize=layout,doc=document;
        const next=[...wanted].find(index=>!ready.has(index));if(next===undefined)break;
        const frame=figures[next];if(!frame)break;ready.add(next);
        try{
          const page=await doc.getPage(next+1),size=page.getViewport({scale:1});
          if(mine!==version||resize!==layout)continue;
          frame.style.aspectRatio=`${size.width} / ${size.height}`;
          const width=Math.max(100,frame.clientWidth),density=Math.min(3,window.devicePixelRatio||1);
          const {canvas}=await pageCanvas(doc,next+1,width*density/size.width*72,3000000);
          if(mine!==version||resize!==layout||!wanted.has(next)){canvas.width=canvas.height=0;continue;}
          canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${t('Page','पाना')} ${number(next+1,0)}`);
          canvas.style.width='100%';canvas.style.height='100%';clearCanvas(next);frame.append(canvas);frame.dataset.rendered='true';ready.add(next);
          status.textContent='';
        }catch(error){
          if(mine===version&&resize===layout){frame.dataset.failed='true';frame.querySelector('span')!.textContent=t('This page could not be previewed. Check the downloaded file.','यो पानाको झलक खोल्न सकिएन। डाउनलोड गरेर जाँच्नुहोस्।');}
        }
        // Release canvases as soon as they leave the nearby-page window.
        for(const index of [...ready])if(!wanted.has(index))clearCanvas(index);
      }
    }finally{running=false;}
  };
  const windowPages=()=>{
    const top=root.getBoundingClientRect().top;
    wanted=new Set([...near].sort((a,b)=>Math.abs(figures[a].getBoundingClientRect().top-top)-Math.abs(figures[b].getBoundingClientRect().top-top)).slice(0,5));
    for(const index of [...ready])if(!wanted.has(index))clearCanvas(index);
    void drain();
  };
  const sizing=()=>{
    const top=root.getBoundingClientRect().top;
    const anchor=figures.filter(figure=>figure.getBoundingClientRect().bottom>top).sort((a,b)=>Math.abs(a.getBoundingClientRect().top-top)-Math.abs(b.getBoundingClientRect().top-top))[0];
    const offset=anchor?anchor.getBoundingClientRect().top-top:0;
    layout++;const width=Math.max(120,root.clientWidth-24)*zoom;
    for(const [index,figure] of figures.entries()){clearCanvas(index);figure.style.width=`${width}px`;}
    const image=root.querySelector<HTMLImageElement>('.pdf-image-output');if(image)image.style.width=`${width}px`;
    if(anchor)root.scrollTop+=anchor.getBoundingClientRect().top-root.getBoundingClientRect().top-offset;
    windowPages();
  };
  const clear=()=>{
    version++;layout++;observer?.disconnect();observer=undefined;
    near.clear();wanted.clear();ready.clear();for(const figure of figures){const canvas=figure.querySelector('canvas');if(canvas)canvas.width=canvas.height=0;}
    figures=[];root.replaceChildren();counter.textContent='';status.textContent='';pageCount=0;shown=undefined;root.removeAttribute('data-page');
    if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl='';
    const old=document;document=undefined;if(old)void old.destroy().catch(()=>{});
  };
  let scrolling=false;
  root.addEventListener('scroll',()=>{if(!scrolling){scrolling=true;requestAnimationFrame(()=>{scrolling=false;pageNumber();windowPages();});}},{passive:true});
  let lastWidth=0;
  new ResizeObserver(()=>{if(root.clientWidth&&root.clientWidth!==lastWidth){lastWidth=root.clientWidth;sizing();}}).observe(root);
  return {
    clear,
    setZoom(value:number){zoom=value;sizing();},
    async pdf(bytes:Uint8Array,count:number){
      if(shown===bytes)return;
      clear();shown=bytes;const mine=version;pageCount=count;
      status.textContent=t('Loading page previews…','पानाका झलक खोलिँदैछन्…');
      try{
        const loaded=await renderDocument(bytes);
        if(mine!==version){await loaded.destroy();return;}document=loaded;
        const first=await loaded.getPage(1),size=first.getViewport({scale:1});if(mine!==version)return;
        figures=Array.from({length:count},(_,index)=>{
          const figure=window.document.createElement('div');figure.className='pdf-sheet';figure.dataset.pdfPage=String(index+1);figure.dataset.rendered='false';figure.style.aspectRatio=`${size.width} / ${size.height}`;
          const placeholder=window.document.createElement('span');placeholder.textContent=`${t('Page','पाना')} ${number(index+1,0)}`;figure.append(placeholder);return figure;
        });
        root.append(...figures);sizing();root.scrollTop=root.scrollLeft=0;pageNumber();
        observer=new IntersectionObserver(entries=>{
          if(mine!==version)return;
          for(const entry of entries){const index=Number((entry.target as HTMLElement).dataset.pdfPage)-1;
            if(entry.isIntersecting)near.add(index);else near.delete(index);
          }
          windowPages();
        },{root,rootMargin:'160px 0px'});
        figures.forEach(figure=>observer!.observe(figure));
      }catch(error){if(mine===version){status.textContent=t('Preview unavailable. You can still process and download the file.','झलक खोल्न सकिएन। फाइल तयार पारेर डाउनलोड गर्न भने मिल्छ।');root.replaceChildren();}}
    },
    image(blob:Blob){
      clear();shown=blob;pageCount=1;imageUrl=URL.createObjectURL(blob);
      const image=window.document.createElement('img');image.src=imageUrl;image.alt=t('Converted page image','फोटो बनाइएको पाना');image.className='pdf-image-output';root.append(image);sizing();root.scrollTop=root.scrollLeft=0;counter.textContent=t('Image result','तयार भएको फोटो');
    },
  };
}
