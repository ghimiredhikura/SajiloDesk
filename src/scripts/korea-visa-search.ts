import { normalizeVisaSearch } from '../lib/korea-catalog';
import type { Lang } from '../lib/catalog';

// Read the actual select's permitted choices. A global visa search here would
// accidentally expose targets removed by the current-status relevance rules.
export function enhanceVisaSelect(select:HTMLSelectElement,lang:Lang){
  const box=select.parentElement!.querySelector<HTMLElement>('[data-visa-search]')!;
  const input=box.querySelector<HTMLInputElement>('input')!;
  const list=box.querySelector<HTMLElement>('[role=listbox]')!;
  const empty=box.querySelector<HTMLElement>('[data-search-empty]')!;
  const toggle=box.querySelector<HTMLButtonElement>('button')!;
  const say=(en:string,ne:string)=>lang==='ne'?ne:en;
  let matches:HTMLOptionElement[]=[],active=-1,expanded=false,lastChoices='';
  const options=()=>[...select.options].filter(o=>o.value&&!o.disabled&&!o.hidden);
  const label=(id:string)=>id?[...select.options].find(o=>o.value===id)?.label||'':'';
  const close=()=>{expanded=false;list.hidden=true;empty.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  const position=()=>{
    const bounds=box.getBoundingClientRect(),viewport=window.visualViewport;
    const top=viewport?.offsetTop??0,bottom=top+(viewport?.height??innerHeight);
    const nav=document.querySelector('.mobile-nav')?.getBoundingClientRect();
    const below=Math.min(bottom,nav?.height?nav.top:bottom)-bounds.bottom-8;
    const above=bounds.top-top-72;
    box.dataset.openUp=String(below<Math.min(264,matches.length*50+12)&&above>below);
  };
  const highlight=(index:number)=>{
    active=index;
    for(const [i,option] of [...list.children].entries())option.classList.toggle('active',i===active);
    if(active>=0){input.setAttribute('aria-activedescendant',`${select.id}-option-${active}`);list.children[active]?.scrollIntoView({block:'nearest'});}
    else input.removeAttribute('aria-activedescendant');
  };
  const choose=(index:number)=>{
    const option=matches[index];if(!option||!options().some(o=>o.value===option.value))return;
    select.value=option.value;input.value=label(option.value);close();select.dispatchEvent(new Event('change',{bubbles:true}));input.focus();
  };
  const render=(query:string)=>{
    const q=normalizeVisaSearch(query),available=options();
    matches=available.filter(o=>o.value!=='other'&&(!q||normalizeVisaSearch(`${o.value} ${o.label}`).includes(q)));
    const other=available.find(o=>o.value==='other');if(other)matches.push(other);
    list.replaceChildren();active=-1;expanded=true;list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
    for(const [index,option] of matches.entries()){
      const item=document.createElement('div');item.id=`${select.id}-option-${index}`;item.setAttribute('role','option');item.setAttribute('aria-selected',String(select.value===option.value));item.textContent=option.label;
      item.addEventListener('pointerdown',event=>event.preventDefault());item.addEventListener('click',()=>choose(index));list.append(item);
    }
    empty.hidden=matches.length>0;empty.textContent=say('No match. Try the parent code, such as D2 or E7.','मिल्ने भिसा भेटिएन। D2 वा E7 जस्तो मूल कोड खोज्नुहोस्।');
    position();
  };
  input.addEventListener('focus',()=>{input.select();render('');});
  input.addEventListener('input',()=>{const query=input.value;select.value='';select.dispatchEvent(new Event('change',{bubbles:true}));input.value=query;render(query);});
  input.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!expanded)render(input.value===label(select.value)?'':input.value);
      if(matches.length)highlight(event.key==='ArrowDown'?Math.min(active+1,matches.length-1):active<0?matches.length-1:Math.max(active-1,0));
    }else if(event.key==='Enter'&&expanded){event.preventDefault();const exact=matches.findIndex(v=>normalizeVisaSearch(v.value)===normalizeVisaSearch(input.value));if(active>=0)choose(active);else if(exact>=0)choose(exact);else if(matches.length===1)choose(0);}
    else if(event.key==='Escape'){event.preventDefault();close();input.value=label(select.value);}
    else if(event.key==='Tab')close();
  });
  input.addEventListener('blur',()=>{close();input.value=label(select.value);});
  toggle.addEventListener('pointerdown',event=>event.preventDefault());
  toggle.addEventListener('click',()=>{if(expanded)close();else{input.focus();render('');}});
  window.visualViewport?.addEventListener('resize',()=>{if(expanded)position();});
  window.addEventListener('resize',()=>{if(expanded)position();});
  select.addEventListener('change',()=>{if(select.value)input.value=label(select.value);});
  box.hidden=false;select.hidden=true;select.tabIndex=-1;
  const visibleLabel=select.labels?.[0];
  if(visibleLabel){select.setAttribute('aria-label',visibleLabel.textContent||'Visa');visibleLabel.htmlFor=input.id;}
  const sync=()=>{
    const fingerprint=options().map(o=>`${o.value}:${o.label}`).join('|');
    if(fingerprint!==lastChoices){close();list.replaceChildren();matches=[];lastChoices=fingerprint;}
    input.disabled=select.disabled;toggle.disabled=select.disabled;input.value=label(select.value);input.setAttribute('aria-required',String(select.required));if(select.disabled)close();
  };
  sync();return {sync};
}
