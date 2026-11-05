import { convertDate, epochDay, formatDate, nepaliDigits, todayNepal } from '../lib/dates';
import { dailyObservances, worldSource } from '../lib/observances';
const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
function render() {
  const target = document.querySelector('#nepal-today'); if (!target) return;
  try {
    const today = todayNepal(); const bs = convertDate(today, 'AD');
    const main = target.querySelector('.today-date'); const sub = target.querySelector('.today-ad');
    if (main) main.textContent = formatDate(bs, 'BS', 'ne');
    if (sub) {
      const weekdays = ['आइतबार','सोमबार','मंगलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'];
      sub.textContent = lang === 'ne'
        ? `${weekdays[new Date(epochDay(today)*86400000).getUTCDay()]}, ${formatDate(today,'AD','ne')}`
        : new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kathmandu', weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());
    }
    const time = document.querySelector('#nepal-time');
    if (time) {
      const clock = lang === 'ne'
        ? nepaliDigits(new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kathmandu', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).format(new Date()))
        : new Intl.DateTimeFormat('en-GB', { timeZone:'Asia/Kathmandu', hour:'2-digit', minute:'2-digit', hour12:true }).format(new Date());
      time.textContent = `${clock} · ${lang === 'ne' ? 'नेपाल समय' : 'Nepal time'} (UTC +5:45)`;
    }
    const events = dailyObservances(today,lang);
    const holiday = document.querySelector<HTMLAnchorElement>('#today-holiday');
    if(holiday) { holiday.textContent = events.holidayStatus === 'none' ? '' : events.holidayText; holiday.href = events.source; }
    const holidayLine = document.querySelector<HTMLElement>('.today-holiday-line');
    if(holidayLine) { holidayLine.dataset.status = events.holidayStatus; holidayLine.hidden = events.holidayStatus === 'none'; }
    const holidayDetails = document.querySelector('#today-holiday-details');
    if(holidayDetails) { holidayDetails.textContent = events.holidayStatus === 'none' ? '' : events.nepal; (holidayDetails as HTMLElement).hidden = events.holidayStatus === 'none'; }
    const keyDay = document.querySelector<HTMLElement>('#today-key-day');
    if(keyDay) keyDay.hidden = !events.world;
    const nepalDay = document.querySelector<HTMLElement>('#today-nepal-key-day');
    if(nepalDay) nepalDay.hidden = !events.nepalDays.length;
    const nepalName = document.querySelector<HTMLAnchorElement>('#today-nepal-day');
    if(nepalName) { nepalName.textContent = events.nepalDays.map(day=>day.name).join(' · '); nepalName.href = events.nepalDays[0]?.source || ''; }
    const nepalSources = document.querySelector<HTMLElement>('#today-nepal-day-sources');
    if(nepalSources) {
      nepalSources.hidden = !events.nepalDays.length;
      nepalSources.replaceChildren(...events.nepalDays.map(day=>{
        const item=document.createElement('li'),link=document.createElement('a');
        link.textContent=day.name;link.href=day.source;link.target='_blank';link.rel='noopener noreferrer';item.append(link);return item;
      }));
    }
    const highlights = document.querySelector<HTMLElement>('.today-highlights');
    if(highlights) highlights.hidden = !events.world && !events.nepalDays.length && events.holidayStatus === 'none';
    const world = document.querySelector<HTMLAnchorElement>('#today-world');
    if(world) { world.textContent = events.world || ''; world.href = worldSource; }
  } catch { const main = target.querySelector('.today-date'); if (main) main.textContent = lang === 'ne' ? 'मिति उपलब्ध छैन' : 'Date unavailable'; }
}
render(); setInterval(render,60000);
