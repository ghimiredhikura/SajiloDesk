import { koreaJourney, koreaVisas, koreaTasks, usesD2Checklist } from '../lib/korea-catalog';
import { route, type Lang } from '../lib/catalog';
import { enhanceVisaSelect } from './korea-visa-search';
const picker=document.querySelector<HTMLElement>('[data-journey]');
if(picker){
  const visa=picker.querySelector<HTMLSelectElement>('#journey-visa')!;
  const task=picker.querySelector<HTMLSelectElement>('#journey-task')!;
  const target=picker.querySelector<HTMLSelectElement>('#journey-target')!;
  const field=picker.querySelector<HTMLElement>('#journey-target-field')!;
  const button=picker.querySelector<HTMLButtonElement>('#journey-open')!;
  const query=new URL(location.href).searchParams;
  const queryVisa=query.get('visa')||'';
  let currentSearch:ReturnType<typeof enhanceVisaSelect>|undefined;
  let targetSearch:ReturnType<typeof enhanceVisaSelect>|undefined;
  const guideRoot=document.querySelector<HTMLElement>('[data-korea-guide]');
  const fixed=guideRoot?.dataset.task!=='change' && guideRoot?.dataset.guideVisa!=='ALL' ? guideRoot?.dataset.guideVisa : '';
  if(koreaVisas.includes(queryVisa)&&(!fixed||(guideRoot?.dataset.koreaGuide==='d2-extension'&&usesD2Checklist(queryVisa))))visa.value=queryVisa;
  if(koreaTasks.some(t=>t.id===query.get('task')))task.value=query.get('task')!;
  const update=()=>{
    task.disabled=!visa.value;
    const changing=task.value==='change'; field.hidden=!changing; target.disabled=!changing; target.required=changing;
    picker.dataset.changing=String(changing);
    for(const option of target.options)option.disabled=!!option.value&&option.value===visa.value;
    if(target.value===visa.value)target.value='';
    button.disabled=!koreaJourney(visa.value,task.value,target.value);
    currentSearch?.sync();targetSearch?.sync();
  };
  visa.addEventListener('change',update);task.addEventListener('change',update);target.addEventListener('change',update);
  picker.querySelector('form')!.addEventListener('submit',event=>{
    event.preventDefault();const slug=koreaJourney(visa.value,task.value,target.value);if(!slug)return;
    const url=new URL(route(picker.dataset.lang as Lang,`life-abroad/korea/${slug}`),location.origin);
    const legacyVisa=({'d2-extension':'D-2','d4-extension':'D-4-1','e9-extension':'E-9'} as Record<string,string>)[slug];
    if(legacyVisa!==visa.value)url.searchParams.set('visa',visa.value);
    if(task.value==='permanent'||(task.value==='extension'&&visa.value==='F-5'))url.searchParams.set('task',task.value);
    location.assign(url.href);
  });
  for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-language]')){
    const url=new URL(link.href);
    if(koreaVisas.includes(queryVisa))url.searchParams.set('visa',queryVisa);
    if(['permanent','extension'].includes(query.get('task')||''))url.searchParams.set('task',query.get('task')!);
    link.href=url.href;
  }
  update();
  currentSearch=enhanceVisaSelect(visa,picker.dataset.lang as Lang);
  targetSearch=enhanceVisaSelect(target,picker.dataset.lang as Lang);
}
