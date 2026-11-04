import { convertDate, formatDate, todayNepal } from '../lib/dates';
const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
function render() {
  const target = document.querySelector('#nepal-today'); if (!target) return;
  try {
    const today = todayNepal(); const bs = convertDate(today, 'AD');
    const main = target.querySelector('.today-date'); const sub = target.querySelector('.today-ad');
    if (main) main.textContent = formatDate(bs, 'BS', 'ne');
    if (sub) sub.textContent = new Intl.DateTimeFormat(lang === 'ne' ? 'ne-NP' : 'en-GB', { timeZone:'Asia/Kathmandu', weekday:'long', day:'numeric', month:'long', year:'numeric' }).format(new Date());
    const time = document.querySelector('#nepal-time');
    if (time) time.textContent = `${new Intl.DateTimeFormat(lang === 'ne' ? 'ne-NP' : 'en-GB', { timeZone:'Asia/Kathmandu', hour:'2-digit', minute:'2-digit', hour12:true }).format(new Date())} · ${lang === 'ne' ? 'नेपाल समय' : 'Nepal time'} (UTC +5:45)`;
  } catch { const main = target.querySelector('.today-date'); if (main) main.textContent = lang === 'ne' ? 'मिति उपलब्ध छैन' : 'Date unavailable'; }
}
render(); setInterval(render,60000);
