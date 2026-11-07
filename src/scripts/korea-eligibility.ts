import { normalizeVisaSearch } from '../lib/korea-catalog';
for(const root of document.querySelectorAll<HTMLElement>('[data-eligibility]')){
  const input=root.querySelector<HTMLInputElement>('#eligibility-search');
  const records=[...root.querySelectorAll<HTMLDetailsElement>('[data-eligibility-code]')];
  const empty=root.querySelector<HTMLElement>('.eligibility-empty');
  function filter(value:string){
    const query=normalizeVisaSearch(value);
    // A code query matches codes, so F5 does not also return other visas whose
    // explanatory text happens to mention an F-5 route.
    const code=/^[a-z]\d/.test(query);
    for(const record of records)record.hidden=!normalizeVisaSearch(code?record.dataset.eligibilityCode!:record.dataset.eligibilitySearch!).includes(query);
    if(empty)empty.hidden=records.some(record=>!record.hidden);
  }
  input?.addEventListener('input',()=>filter(input.value));
  for(const button of root.querySelectorAll<HTMLButtonElement>('[data-eligibility-filter]'))button.addEventListener('click',()=>{
    if(input){input.value=button.dataset.eligibilityFilter!;filter(input.value);}
  });
  function revealHash(){
    if(!input)return;
    const id=decodeURIComponent(location.hash.slice(1));
    const record=records.find(r=>r.id===id);
    if(!record)return;
    input.value=record.dataset.eligibilityCode!;filter(input.value);
    root.querySelector<HTMLDetailsElement>('.eligibility-directory')!.open=true;
    record.open=true;
    requestAnimationFrame(()=>record.scrollIntoView({block:'nearest'}));
  }
  addEventListener('hashchange',revealHash);revealHash();
}
