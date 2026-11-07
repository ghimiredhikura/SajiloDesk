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
  let mode:'typing'|'browse'|undefined;
  let press:{id:number;x:number;y:number;moved:boolean;option:HTMLElement|null;type:string}|undefined;
  let activation:typeof press;
  const options=()=>[...select.options].filter(o=>o.value&&!o.disabled&&!o.hidden);
  const label=(id:string)=>id?[...select.options].find(o=>o.value===id)?.label||'':'';
  const close=()=>{expanded=false;mode=undefined;box.removeAttribute('data-input-mode');press=activation=undefined;list.hidden=true;empty.hidden=true;input.setAttribute('aria-expanded','false');toggle.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');list.removeAttribute('aria-activedescendant');};
  const position=()=>{
    const bounds=box.getBoundingClientRect(),viewport=window.visualViewport;
    const top=viewport?.offsetTop??0,bottom=top+(viewport?.height??innerHeight);
    const nav=document.querySelector('.mobile-nav')?.getBoundingClientRect();
    const below=Math.min(bottom,nav?.height?nav.top:bottom)-bounds.bottom-8;
    const above=bounds.top-top-72;
    const up=below<Math.min(264,matches.length*50+12)&&above>below;
    box.dataset.openUp=String(up);
    list.style.maxHeight=`${Math.max(44,Math.min(264,up?above:below))}px`;
  };
  const highlight=(index:number)=>{
    active=index;
    for(const [i,option] of [...list.children].entries())option.classList.toggle('active',i===active);
    if(active>=0){input.setAttribute('aria-activedescendant',`${select.id}-option-${active}`);list.setAttribute('aria-activedescendant',`${select.id}-option-${active}`);list.children[active]?.scrollIntoView({block:'nearest'});}
    else {input.removeAttribute('aria-activedescendant');list.removeAttribute('aria-activedescendant');}
  };
  const choose=(index:number,touch=false)=>{
    const option=matches[index];if(!option||!options().some(o=>o.value===option.value))return;
    const browsing=mode==='browse';
    select.value=option.value;input.value=label(option.value);close();select.dispatchEvent(new Event('change',{bubbles:true}));
    // Do not refocus here: on iOS this can reopen the list/keyboard immediately.
    if(browsing)toggle.focus({preventScroll:true});else if(touch)input.blur();
  };
  const render=(query:string)=>{
    const q=normalizeVisaSearch(query),available=options();
    matches=available.filter(o=>o.value!=='other'&&(!q||normalizeVisaSearch(`${o.value} ${o.label}`).includes(q)));
    const other=available.find(o=>o.value==='other');if(other)matches.push(other);
    list.replaceChildren();active=-1;expanded=true;list.hidden=false;input.setAttribute('aria-expanded','true');toggle.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');list.removeAttribute('aria-activedescendant');
    for(const [index,option] of matches.entries()){
      const item=document.createElement('div');item.id=`${select.id}-option-${index}`;item.setAttribute('role','option');item.setAttribute('aria-selected',String(select.value===option.value));item.textContent=option.label;
      item.dataset.index=String(index);item.dataset.value=option.value;
      item.addEventListener('click',event=>{
        // Keep the row visible until click dispatch. Hiding it on pointerup can
        // send iOS's following compatibility click to a button underneath it.
        event.preventDefault();event.stopPropagation();
        if(expanded&&(event.detail===0||activation?.option===item))choose(index,!!activation&&activation.type!=='mouse');
        activation=undefined;
      });list.append(item);
    }
    empty.hidden=matches.length>0;empty.textContent=box.dataset.searchKind==='task'?say('No matching task. Try another word.','मिल्ने काम भेटिएन। अर्को शब्द खोज्नुहोस्।'):say('No match. Try the parent code, such as D2 or E7.','मिल्ने भिसा भेटिएन। D2 वा E7 जस्तो मूल कोड खोज्नुहोस्।');
    position();
  };
  const typing=()=>{mode='typing';box.dataset.inputMode=mode;input.select();render('');};
  const browse=()=>{input.blur();mode='browse';box.dataset.inputMode=mode;render('');list.focus({preventScroll:true});};
  input.addEventListener('focus',typing);
  input.addEventListener('click',()=>{if(!expanded)typing();});
  input.addEventListener('input',()=>{const query=input.value;select.value='';select.dispatchEvent(new Event('change',{bubbles:true}));input.value=query;render(query);});
  const keydown=(event:KeyboardEvent)=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){
      event.preventDefault();if(!expanded){if(event.currentTarget===toggle)browse();else render(input.value===label(select.value)?'':input.value);}
      if(matches.length)highlight(event.key==='ArrowDown'?Math.min(active+1,matches.length-1):active<0?matches.length-1:Math.max(active-1,0));
    }else if(event.key==='Enter'&&expanded){event.preventDefault();const exact=matches.findIndex(v=>normalizeVisaSearch(v.value)===normalizeVisaSearch(input.value));if(active>=0)choose(active);else if(exact>=0)choose(exact);else if(matches.length===1)choose(0);}
    else if(event.key==='Escape'){event.preventDefault();const browsing=mode==='browse';close();input.value=label(select.value);if(browsing)toggle.focus({preventScroll:true});}
    else if(event.key==='Tab'){if(mode==='browse')toggle.focus({preventScroll:true});close();}
  };
  input.addEventListener('keydown',keydown);list.addEventListener('keydown',keydown);toggle.addEventListener('keydown',keydown);
  // iOS can blur the input despite pointerdown.preventDefault(). Keep the list
  // through that blur and click, after distinguishing a tap from
  // a scroll. Never select on pointerdown: that would break scrolling the list.
  box.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    activation=undefined;
    const target=event.target as Element,option=target.closest<HTMLElement>('[role=option]');
    if((option&&list.contains(option))||toggle.contains(target))press={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false,option,type:event.pointerType};
  },true);
  box.addEventListener('mousedown',event=>{if((event.target as Element).closest('[role=option],button'))event.preventDefault();});
  document.addEventListener('pointermove',event=>{if(press?.id===event.pointerId&&Math.hypot(event.clientX-press.x,event.clientY-press.y)>10)press.moved=true;});
  list.addEventListener('scroll',()=>{if(press)press.moved=true;},{passive:true});
  document.addEventListener('pointercancel',event=>{if(press?.id===event.pointerId)press=activation=undefined;});
  document.addEventListener('pointerup',event=>{
    if(press?.id!==event.pointerId)return;
    const ended=press;press=undefined;
    if(expanded&&!ended.moved&&Math.hypot(event.clientX-ended.x,event.clientY-ended.y)<=10)activation=ended;
  });
  const leave=()=>{close();input.value=label(select.value);};
  input.addEventListener('blur',()=>{if(!press&&!activation)leave();});
  document.addEventListener('pointerdown',event=>{if(!box.contains(event.target as Node))leave();},true);
  document.addEventListener('focusin',event=>{if(expanded&&!press&&!activation&&!box.contains(event.target as Node))leave();});
  toggle.addEventListener('click',()=>{activation=undefined;if(expanded&&mode==='browse')close();else browse();});
  window.visualViewport?.addEventListener('resize',()=>{if(expanded)position();});
  window.visualViewport?.addEventListener('scroll',()=>{if(expanded)position();});
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
