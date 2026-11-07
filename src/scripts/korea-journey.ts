import { koreaJourney, koreaVisas, koreaTasks, usesD2Checklist, getTaskChoices, getChangeTargets, otherChangeName } from '../lib/korea-catalog';
import { route, type Lang } from '../lib/catalog';
import { enhanceVisaSelect } from './korea-visa-search';
const picker=document.querySelector<HTMLElement>('[data-journey]');
if(picker){
  const lang=picker.dataset.lang as Lang;
  const say=(en:string,ne:string)=>lang==='ne'?ne:en;
  const visa=picker.querySelector<HTMLSelectElement>('#journey-visa')!;
  const task=picker.querySelector<HTMLSelectElement>('#journey-task')!;
  const target=picker.querySelector<HTMLSelectElement>('#journey-target')!;
  const field=picker.querySelector<HTMLElement>('#journey-target-field')!;
  const button=picker.querySelector<HTMLButtonElement>('#journey-open')!;
  const help=picker.querySelector<HTMLElement>('#journey-help')!;
  const note=picker.querySelector<HTMLElement>('#journey-selection-note')!;
  const defaultHelp=help.textContent;
  const query=new URL(location.href).searchParams;
  const queryVisa=query.get('visa')||'';
  let currentSearch:ReturnType<typeof enhanceVisaSelect>|undefined;
  let taskSearch:ReturnType<typeof enhanceVisaSelect>|undefined;
  let targetSearch:ReturnType<typeof enhanceVisaSelect>|undefined;
  const guideRoot=document.querySelector<HTMLElement>('[data-korea-guide]');
  const fixed=guideRoot?.dataset.task!=='change' && guideRoot?.dataset.guideVisa!=='ALL' ? guideRoot?.dataset.guideVisa : '';
  if(koreaVisas.includes(queryVisa)&&(!fixed||(guideRoot?.dataset.koreaGuide==='d2-extension'&&usesD2Checklist(queryVisa))))visa.value=queryVisa;
  const initialTask=koreaTasks.some(t=>t.id===query.get('task'))?query.get('task')!:picker.dataset.initialTask||task.value;
  const initialTarget=picker.dataset.initialTarget||target.value;
  let first=true;
  function replaceOptions(select:HTMLSelectElement,placeholder:string,choices:{id:string;name:readonly[string,string]}[],previous:string){
    select.replaceChildren(new Option(placeholder,''),...choices.map(choice=>new Option(choice.name[lang==='ne'?1:0],choice.id)));
    select.value=choices.some(choice=>choice.id===previous)?previous:'';
  }
  const update=()=>{
    const previousTask=first?initialTask:task.value;
    const previousTarget=first?initialTarget:target.value;
    first=false;
    const selected=!!visa.value;
    task.disabled=!selected;
    // Typing temporarily clears the visa value. Keep the previous task until
    // a real replacement status is chosen, then discard incompatible choices.
    if(selected){
      replaceOptions(task,say('Choose a task','गर्नुपर्ने काम छान्नुहोस्'),getTaskChoices(visa.value),previousTask);
      replaceOptions(target,say('Choose the target status','चाहिएको भिसा छान्नुहोस्'),[...getChangeTargets(visa.value),{id:'other',name:otherChangeName}],previousTarget);
      const reset=!!previousTask&&!task.value||task.value==='change'&&!!previousTarget&&!target.value;
      note.hidden=!reset;
      note.textContent=reset?say('The earlier choice does not match this shortlist. Choose again, or use the special-case route.','पहिलेको छनोट यो सूचीसँग मिलेन। फेरि छान्नुहोस् वा विशेष अवस्थाको प्रक्रिया हेर्नुहोस्।'):'';
    }
    const changing=selected&&task.value==='change';
    field.hidden=!changing;target.disabled=!changing;target.required=changing;
    picker.dataset.changing=String(changing);
    help.textContent=changing?say('Possible routes; eligibility depends on your case. Other covers special situations.','सम्भावित प्रक्रिया हुन्; योग्यता अवस्थाअनुसार फरक पर्छ। विशेष अवस्थामा अन्य छान्नुहोस्।'):defaultHelp;
    button.disabled=!koreaJourney(visa.value,task.value,target.value);
    for(const [id,slug] of [['journey-entry-link','entry-visa'],['journey-other-link','application-help']]){
      const link=picker.querySelector<HTMLAnchorElement>(`#${id}`)!;
      const url=new URL(route(lang,`life-abroad/korea/${slug}`),location.origin);
      if(selected)url.searchParams.set('visa',visa.value);link.href=url.href;
    }
    const eligibilityLink=picker.querySelector<HTMLElement>('#journey-eligibility-link');
    const eligibilityVisa=task.value==='permanent'?'F-5':changing&&target.value&&target.value!=='other'?target.value:visa.value;
    if(eligibilityLink){
      eligibilityLink.hidden=!eligibilityVisa;
      const link=eligibilityLink.querySelector('a')!;
      link.href=route(lang,'life-abroad')+'#eligibility-'+eligibilityVisa.toLowerCase();
      link.textContent=say(`Check ${eligibilityVisa} eligibility & criteria →`,`${eligibilityVisa} को योग्यता र सर्त हेर्नुहोस् →`);
    }
    currentSearch?.sync();taskSearch?.sync();targetSearch?.sync();
  };
  visa.addEventListener('change',update);task.addEventListener('change',update);target.addEventListener('change',update);
  picker.querySelector('form')!.addEventListener('submit',event=>{
    event.preventDefault();const slug=koreaJourney(visa.value,task.value,target.value);if(!slug)return;
    const url=new URL(route(lang,`life-abroad/korea/${slug}`),location.origin);
    const legacyVisa=({'d2-extension':'D-2','d4-extension':'D-4-1','e9-extension':'E-9'} as Record<string,string>)[slug];
    if(legacyVisa!==visa.value)url.searchParams.set('visa',visa.value);
    if(task.value==='permanent')url.searchParams.set('task',task.value);
    location.assign(url.href);
  });
  for(const link of document.querySelectorAll<HTMLAnchorElement>('[data-language]')){
    const url=new URL(link.href);
    if(koreaVisas.includes(queryVisa))url.searchParams.set('visa',queryVisa);
    if(['permanent','extension'].includes(query.get('task')||''))url.searchParams.set('task',query.get('task')!);
    link.href=url.href;
  }
  update();
  currentSearch=enhanceVisaSelect(visa,lang);
  taskSearch=enhanceVisaSelect(task,lang);
  targetSearch=enhanceVisaSelect(target,lang);
}
