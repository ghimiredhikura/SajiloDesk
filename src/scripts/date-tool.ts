import { convertDate, formatDate, iso, todayNepal, type Calendar } from '../lib/dates';
import { lang,t,el,readDate,writeDate,setCalendar,setText,showError,clearError } from './form-utils';
import { copyText } from './shared';
let direction: Calendar = 'BS'; let copy = '';
function invalidate() { copy = ''; el('date-result').hidden = true; el('result-empty').hidden = false; clearError(); }
el('date-form').addEventListener('input', invalidate);
document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(button => button.addEventListener('click', () => {
  direction = button.dataset.direction as Calendar;
  document.querySelectorAll<HTMLButtonElement>('[data-direction]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  setCalendar('date',direction); el<HTMLInputElement>('date-year').value = ''; el<HTMLInputElement>('date-day').value = ''; invalidate();
  setText('date-example',direction === 'BS' ? t('Try an example: 2082-01-01 BS','उदाहरण: २०८२-०१-०१ वि.सं.') : t('Try an example: 2025-04-14 AD','उदाहरण: २०२५-०४-१४ ई.सं.'));
}));
function calculate() {
  invalidate();
  try {
    const input = readDate('date'); const output = convertDate(input,direction); const target = direction === 'BS' ? 'AD' : 'BS';
    setText('result-primary-label', target === 'AD' ? t('Gregorian · AD','अंग्रेजी · ई.सं.') : t('Bikram Sambat · BS','विक्रम संवत् · वि.सं.'));
    setText('result-primary',formatDate(output,target,lang));
    setText('result-secondary-label', direction === 'AD' ? t('Gregorian · AD','अंग्रेजी · ई.सं.') : t('Bikram Sambat · BS','विक्रम संवत् · वि.सं.'));
    setText('result-secondary',formatDate(input,direction,lang));
    const ad = direction === 'AD' ? input : output; const bs = direction === 'BS' ? input : output;
    copy = `BS: ${iso(bs)}\nAD: ${iso(ad)}`; setText('result-iso', `BS ${iso(bs)} = AD ${iso(ad)}`);
    el('date-result').hidden = false; el('result-empty').hidden = true;
  } catch(error) { showError(error); }
}
el('date-form').addEventListener('submit',e => {e.preventDefault();calculate();});
el('use-today').addEventListener('click',() => {try {const now = todayNepal(); writeDate('date',direction === 'AD' ? now : convertDate(now,'AD')); calculate();} catch(error){showError(error);}});
el('date-example').addEventListener('click',() => {writeDate('date',direction === 'BS' ? {year:2082,month:1,day:1} : {year:2025,month:4,day:14});calculate();});
el('copy-date').addEventListener('click',() => { if(copy) copyText(copy); });
