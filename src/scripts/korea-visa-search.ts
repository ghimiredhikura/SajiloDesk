import { normalizeVisaSearch, searchVisaOptions, visaOptions } from '../lib/korea-catalog';
import type { Lang } from '../lib/catalog';

// A native select remains readable and operable without JavaScript. The
// enhanced control is one searchable field, following the ARIA combobox model.
export function enhanceVisaSelect(select:HTMLSelectElement,lang:Lang){
  const box=select.parentElement!.querySelector<HTMLElement>('[data-visa-search]')!;
  const input=box.querySelector<HTMLInputElement>('input')!;
  const list=box.querySelector<HTMLElement>('[role=listbox]')!;
  const empty=box.querySelector<HTMLElement>('[data-search-empty]')!;
  const toggle=box.querySelector<HTMLButtonElement>('button')!;
  const say=(en:string,ne:string)=>lang==='ne'?ne:en;
  let matches=searchVisaOptions(''),active=-1,expanded=false;
  const label=(id:string)=>{const v=visaOptions.find(v=>v.id===id);return v?`${v.id} · ${v.name[lang==='ne'?1:0]}`:'';};
  const close=()=>{expanded=false;list.hidden=true;empty.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');};
  const highlight=(index:number)=>{
    active=index;
    for(const [i,option] of [...list.children].entries())option.classList.toggle('active',i===active);
    if(active>=0){input.setAttribute('aria-activedescendant',`${select.id}-option-${active}`);list.children[active]?.scrollIntoView({block:'nearest'});}
    else input.removeAttribute('aria-activedescendant');
  };
  const choose=(index:number)=>{
    const option=matches[index];if(!option)return;
    select.value=option.id;input.value=label(option.id);close();select.dispatchEvent(new Event('change',{bubbles:true}));input.focus();
  };
  const render=(query:string)=>{
    matches=searchVisaOptions(query).filter(v=>!select.querySelector<HTMLOptionElement>(`option[value="${v.id}"]`)?.disabled);
    list.replaceChildren();active=-1;expanded=true;list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
    for(const [index,option] of matches.entries()){
      const item=document.createElement('div');item.id=`${select.id}-option-${index}`;item.setAttribute('role','option');item.setAttribute('aria-selected',String(select.value===option.id));item.textContent=label(option.id);
      item.addEventListener('pointerdown',event=>event.preventDefault());item.addEventListener('click',()=>choose(index));list.append(item);
    }
    empty.hidden=matches.length>0;empty.textContent=say('No match. Try the parent code, such as D2 or E7.','मिल्ने भिसा भेटिएन। D2 वा E7 जस्तो मूल कोड खोज्नुहोस्।');
  };
  input.addEventListener('focus',()=>{input.select();render('');});
  input.addEventListener('input',()=>{const query=input.value;select.value='';select.dispatchEvent(new Event('change',{bubbles:true}));input.value=query;render(query);});
  input.addEventListener('keydown',event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!expanded)render(input.value===label(select.value)?'':input.value);
      if(matches.length)highlight(event.key==='ArrowDown'?Math.min(active+1,matches.length-1):active<0?matches.length-1:Math.max(active-1,0));
    }else if(event.key==='Enter'&&expanded){event.preventDefault();const exact=matches.findIndex(v=>normalizeVisaSearch(v.id)===normalizeVisaSearch(input.value));if(active>=0)choose(active);else if(exact>=0)choose(exact);else if(matches.length===1)choose(0);}
    else if(event.key==='Escape'){event.preventDefault();close();input.value=label(select.value);}
    else if(event.key==='Tab')close();
  });
  input.addEventListener('blur',()=>{close();input.value=label(select.value);});
  toggle.addEventListener('pointerdown',event=>event.preventDefault());
  toggle.addEventListener('click',()=>{if(expanded)close();else{input.focus();render('');}});
  select.addEventListener('change',()=>{if(select.value)input.value=label(select.value);});
  box.hidden=false;select.hidden=true;select.tabIndex=-1;
  const visibleLabel=select.labels?.[0];
  if(visibleLabel){select.setAttribute('aria-label',visibleLabel.textContent||'Visa');visibleLabel.htmlFor=input.id;}
  const sync=()=>{input.disabled=select.disabled;toggle.disabled=select.disabled;input.value=label(select.value);input.setAttribute('aria-required',String(select.required));if(select.disabled)close();};
  sync();return {sync};
}
