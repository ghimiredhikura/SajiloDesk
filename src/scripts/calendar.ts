import { calendarMonth,monthBounds,type CalendarDay } from '../lib/calendar';
import { convertDate,formatDate,integer,iso,todayNepal,bsMonths,bsMonthsNe,adMonths,adMonthsNe,type Calendar,type DateParts } from '../lib/dates';
import { dailyObservances,worldSource } from '../lib/observances';
import { lang,t,el,number } from './form-utils';
import { copyText } from './shared';

function initCalendar(){
  let system:Calendar='BS';
  let selectedAd=todayNepal(),selectedBs=convertDate(selectedAd,'AD');
  let view={year:selectedBs.year,month:selectedBs.month};
  const grid=el('calendar-grid'),monthSelect=el<HTMLSelectElement>('calendar-month'),yearInput=el<HTMLInputElement>('calendar-year');
  const showError=()=>{el('calendar-error').textContent=t('Choose a supported year and month. See the date range below.','समर्थित वर्ष र महिना छान्नुहोस्। तलको मितिको सीमा हेर्नुहोस्।');el('calendar-error').hidden=false;};
  const dateLabel=(ad:DateParts,bs:DateParts)=>`${formatDate(bs,'BS',lang)} BS / ${formatDate(ad,'AD',lang)} AD`;

  function syncMonthNames(){
    const months=system==='BS'?(lang==='ne'?bsMonthsNe:bsMonths):(lang==='ne'?adMonthsNe:adMonths);
    monthSelect.replaceChildren(...months.map((month,i)=>new Option(month,String(i+1))));
    el('calendar-range').textContent=system==='BS'?t('BS 1975–2099 · smaller numbers are AD dates','वि.सं. १९७५–२०९९ · साना अंक ई.सं. का मिति हुन्')
      :t('AD 13 Apr 1918–13 Apr 2043 · smaller numbers are BS dates','ई.सं. १३ अप्रिल १९१८–१३ अप्रिल २०४३ · साना अंक वि.सं. का मिति हुन्');
  }
  function renderSelection(){
    const events=dailyObservances(selectedAd,lang);
    el('calendar-selected-bs').textContent=`${formatDate(selectedBs,'BS',lang)} ${t('BS','वि.सं.')}`;
    el('calendar-selected-ad').textContent=`${formatDate(selectedAd,'AD',lang)} ${t('AD','ई.सं.')}`;
    el('calendar-nepal-day').hidden=!events.nepalDays.length;
    el('calendar-nepal-name').textContent=events.nepalDays.map(day=>day.name).join(' · ');
    el('calendar-world-day').hidden=!events.world;el('calendar-world-name').textContent=events.world||'';
    el('calendar-holiday').hidden=events.holidayStatus==='none';
    el('calendar-holiday').textContent=events.holidayStatus==='none'?'':events.holidayText;
    el('calendar-plain-day').hidden=!!events.world||!!events.nepalDays.length||events.holidayStatus!=='none';
    const sources=events.nepalDays.map(day=>({name:day.name,href:day.source}));
    if(events.world)sources.push({name:events.world,href:worldSource});
    if(events.holidayStatus!=='none')sources.push({name:t('Nepal holiday calendar','नेपालको बिदा पात्रो'),href:events.source});
    const seen=new Set<string>();
    el('calendar-source-links').replaceChildren(...sources.filter(source=>!seen.has(source.href)&&!!seen.add(source.href)).map(source=>{
      const item=document.createElement('li'),link=document.createElement('a');link.textContent=source.name;link.href=source.href;link.target='_blank';link.rel='noopener noreferrer';item.append(link);return item;
    }));
    grid.querySelectorAll<HTMLButtonElement>('[data-ad]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ad===iso(selectedAd))));
  }
  function selectDay(day:CalendarDay){
    if(!day.ad||!day.bs)return;
    selectedAd=day.ad;selectedBs=day.bs;renderSelection();
  }
  function renderMonth(){
    const model=calendarMonth(view.year,view.month,system),today=iso(todayNepal());
    monthSelect.value=String(view.month);yearInput.value=String(view.year);el('calendar-error').hidden=true;
    el<HTMLButtonElement>('calendar-previous').disabled=!model.hasPrevious;
    el<HTMLButtonElement>('calendar-next').disabled=!model.hasNext;
    const available=model.days.filter(day=>day.available),first=available[0],last=available[available.length-1];
    const secondary:Calendar=system==='BS'?'AD':'BS';
    el('calendar-caption').textContent=`${secondary}: ${formatDate((system==='BS'?first.ad:first.bs)!,secondary,lang)} – ${formatDate((system==='BS'?last.ad:last.bs)!,secondary,lang)}`;
    const selected=system==='BS'?selectedBs:selectedAd;
    if(selected.year!==view.year||selected.month!==view.month){selectedAd=first.ad!;selectedBs=first.bs!;}
    grid.replaceChildren(...model.cells.map(day=>{
      if(!day){const blank=document.createElement('span');blank.setAttribute('aria-hidden','true');return blank;}
      const button=document.createElement('button');button.type='button';button.className='calendar-day';button.dataset.day=String(day.day);
      const primary=document.createElement('strong');primary.textContent=number(day.day,0);button.append(primary);
      if(!day.available||!day.ad||!day.bs){button.disabled=true;button.setAttribute('aria-label',t(`Day ${day.day}: outside supported range`,`दिन ${day.day}: समर्थित सीमाबाहिर`));return button;}
      const events=dailyObservances(day.ad,lang),secondaryDay=document.createElement('small');
      secondaryDay.textContent=number((system==='BS'?day.ad:day.bs).day,0);button.append(secondaryDay);
      const dots=document.createElement('span');dots.className='calendar-dots';dots.setAttribute('aria-hidden','true');
      if(events.nepalDays.length){const dot=document.createElement('i');dot.className='nepal-dot';dots.append(dot);}
      if(events.world){const dot=document.createElement('i');dot.className='world-dot';dots.append(dot);}
      button.append(dots);button.classList.toggle('weekend',day.weekday===0||day.weekday===6);
      const isHoliday=['nationwide','scoped','weekly'].includes(events.holidayStatus);
      button.classList.toggle('holiday',isHoliday);button.dataset.holidayStatus=events.holidayStatus;
      button.classList.toggle('is-today',iso(day.ad)===today);if(iso(day.ad)===today)button.setAttribute('aria-current','date');
      button.dataset.ad=iso(day.ad);
      const labels=[dateLabel(day.ad,day.bs),...events.nepalDays.map(entry=>entry.name),events.world];
      if(events.holidayStatus!=='none'&&events.holidayStatus!=='unavailable')labels.push(events.holidayText);
      button.setAttribute('aria-label',labels.filter(Boolean).join('; '));button.title=labels.filter(Boolean).join(' · ');
      button.addEventListener('click',()=>selectDay(day));return button;
    }));
    renderSelection();
  }
  function applyControls(){
    try{
      const year=integer(yearInput.value);let month=Number(monthSelect.value);const bounds=monthBounds[system];
      if(year<bounds.min.year||year>bounds.max.year)throw new Error('range');
      if(year===bounds.min.year)month=Math.max(month,bounds.min.month);
      if(year===bounds.max.year)month=Math.min(month,bounds.max.month);
      view={year,month};renderMonth();
    }catch{showError();}
  }
  el('calendar-controls').addEventListener('submit',event=>{event.preventDefault();applyControls();});
  monthSelect.addEventListener('change',applyControls);yearInput.addEventListener('change',applyControls);
  for(const direction of ['previous','next'] as const)el(`calendar-${direction}`).addEventListener('click',()=>{
    const model=calendarMonth(view.year,view.month,system);
    if(direction==='previous'?!model.hasPrevious:!model.hasNext)return;
    view=model[direction];renderMonth();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-calendar]').forEach(button=>button.addEventListener('click',()=>{
    system=button.dataset.calendar as Calendar;
    document.querySelectorAll('[data-calendar]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    const selected=system==='BS'?selectedBs:selectedAd;view={year:selected.year,month:selected.month};syncMonthNames();renderMonth();
  }));
  el('calendar-today').addEventListener('click',()=>{selectedAd=todayNepal();selectedBs=convertDate(selectedAd,'AD');const date=system==='BS'?selectedBs:selectedAd;view={year:date.year,month:date.month};renderMonth();});
  el('calendar-copy').addEventListener('click',()=>{void copyText(`BS: ${iso(selectedBs)}\nAD: ${iso(selectedAd)}`);});
  syncMonthNames();renderMonth();
}
try{initCalendar();}catch{el('calendar-error').textContent=t('The calendar is unavailable for this date.','यो मितिका लागि पात्रो उपलब्ध छैन।');el('calendar-error').hidden=false;}
