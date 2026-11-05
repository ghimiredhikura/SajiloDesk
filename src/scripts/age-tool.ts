import { ageOnDate, convertDate, iso, todayNepal, validateDate, type Calendar } from '../lib/dates';
import { lang,t,el,val,readDate,writeDate,setCalendar,setText,showError,clearError,number } from './form-utils';
import { copyText } from './shared';
let copy = '';
const calendar = (prefix: string) => val(`${prefix}-calendar`) as Calendar;
function invalidate(){copy='';el('age-result').hidden=true;el('result-empty').hidden=false;clearError();}
el('age-form').addEventListener('input',invalidate);
for (const prefix of ['birth','cutoff']) el(`${prefix}-calendar`).addEventListener('change',() => {setCalendar(prefix,calendar(prefix));el<HTMLInputElement>(`${prefix}-year`).value='';el<HTMLInputElement>(`${prefix}-day`).value='';invalidate();});
function useToday(){try {const now=todayNepal();writeDate('cutoff',calendar('cutoff')==='AD'?now:convertDate(now,'AD'));invalidate();}catch(error){showError(error);}}
useToday();el('cutoff-today').addEventListener('click',useToday);
function calculate(){
  invalidate();
  try {
    const birth=readDate('birth');const cutoff=readDate('cutoff');
    const birthAd=calendar('birth')==='AD'?validateDate(birth,'AD'):convertDate(birth,'BS');
    const cutoffAd=calendar('cutoff')==='AD'?validateDate(cutoff,'AD'):convertDate(cutoff,'BS');
    const age=ageOnDate(birthAd,cutoffAd);
    for(const field of ['years','months','days'] as const)setText(`age-${field}`,number(age[field],0));
    setText('age-total',`${number(age.totalDays,0)} ${t('days in total','दिन जम्मा')}`);
    const dates=`${t('Birth','जन्म')}: ${iso(birth)} ${calendar('birth')}\n${t('Cutoff','अन्तिम मिति')}: ${iso(cutoff)} ${calendar('cutoff')}\nAD: ${iso(birthAd)} → ${iso(cutoffAd)}`;
    setText('age-dates',dates);
    copy=lang==='ne'?`उमेर: ${number(age.years)} वर्ष, ${number(age.months)} महिना, ${number(age.days)} दिन\n${dates}\nअंग्रेजी पात्रो; छोटो महिनामा अन्तिम दिनको नियम।`:`Age: ${age.years} years, ${age.months} months, ${age.days} days\n${dates}\nGregorian calendar; shorter-month anniversary convention.`;
    el('age-result').hidden=false;el('result-empty').hidden=true;
  }catch(error){showError(error);}
}
el('age-form').addEventListener('submit',e=>{e.preventDefault();calculate();});
el('age-example').addEventListener('click',()=>{el<HTMLSelectElement>('birth-calendar').value='AD';el<HTMLSelectElement>('cutoff-calendar').value='AD';setCalendar('birth','AD');setCalendar('cutoff','AD');writeDate('birth',{year:2000,month:2,day:29});writeDate('cutoff',{year:2025,month:2,day:28});calculate();});
el('copy-age').addEventListener('click',()=>{if(copy)copyText(copy);});
// A clearly labelled sample birth date, with today's Nepal date as the cutoff.
try { writeDate('birth',convertDate({year:2000,month:1,day:1},'AD')); calculate(); } catch(error) { showError(error); }
