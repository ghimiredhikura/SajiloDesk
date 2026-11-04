import DateConverter from '@remotemerge/nepali-date-converter';
export type Calendar = 'BS' | 'AD';
export type DateParts = { year: number; month: number; day: number };
export const DATE_VERSION = '@remotemerge/nepali-date-converter 1.2.7';
export const BS_RANGE = '1975-01-01 – 2099-12-30';
export const AD_RANGE = '1918-04-13 – 2043-04-13';
export const bsMonths = ['Baishakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
export const bsMonthsNe = ['वैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुस','माघ','फागुन','चैत'];
export const adMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const adMonthsNe = ['जनवरी','फेब्रुअरी','मार्च','अप्रिल','मे','जुन','जुलाई','अगस्ट','सेप्टेम्बर','अक्टोबर','नोभेम्बर','डिसेम्बर'];
export function latinDigits(value: string) { return value.replace(/[०-९]/g, c => String(c.charCodeAt(0) - 0x966)); }
export function nepaliDigits(value: string | number) { return String(value).replace(/[0-9]/g, c => String.fromCharCode(0x966 + Number(c))); }
export function integer(value: string): number {
  const normalized = latinDigits(value.trim());
  if (!/^\d+$/.test(normalized) || !Number.isSafeInteger(Number(normalized))) throw new Error('invalid-number');
  return Number(normalized);
}
export function iso(d: DateParts) { return `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`; }
export function validateDate(d: DateParts, calendar: Calendar): DateParts {
  if (![d.year,d.month,d.day].every(Number.isInteger)) throw new Error('invalid-date');
  if (d.month < 1 || d.month > 12 || d.day < 1 || d.day > 32) throw new Error('invalid-date');
  if (calendar === 'BS' && (d.year < 1975 || d.year > 2099)) throw new Error('range');
  if (calendar === 'AD' && (iso(d) < '1918-04-13' || iso(d) > '2043-04-13')) throw new Error('range');
  try { const c = new DateConverter(iso(d)); if (calendar === 'BS') c.toAd(); else c.toBs(); } catch { throw new Error('invalid-date'); }
  return d;
}
export function convertDate(d: DateParts, from: Calendar): DateParts {
  validateDate(d, from); const c = new DateConverter(iso(d)); const result = from === 'BS' ? c.toAd() : c.toBs();
  return { year: result.year, month: result.month, day: result.date };
}
export function epochDay(d: DateParts) { return Date.UTC(d.year, d.month - 1, d.day) / 86400000; }
export function fromEpochDay(day: number): DateParts { const date = new Date(day * 86400000); return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() }; }
export function todayNepal(now = new Date()): DateParts {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone:'Asia/Kathmandu', year:'numeric', month:'numeric', day:'numeric' }).formatToParts(now).map(p => [p.type,p.value]));
  return { year:Number(parts.year), month:Number(parts.month), day:Number(parts.day) };
}
export function formatDate(d: DateParts, calendar: Calendar, lang: 'en' | 'ne' = 'en') {
  const months = calendar === 'BS' ? (lang === 'ne' ? bsMonthsNe : bsMonths) : (lang === 'ne' ? adMonthsNe : adMonths);
  const text = `${d.day} ${months[d.month - 1]} ${d.year}`;
  return lang === 'ne' ? nepaliDigits(text) : text;
}
export function addMonthsClamped(d: DateParts, months: number): DateParts {
  const zeroMonth = d.month - 1 + months;
  const year = d.year + Math.floor(zeroMonth / 12); const month = ((zeroMonth % 12) + 12) % 12 + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { year, month, day: Math.min(d.day,lastDay) };
}
export function ageOnDate(birth: DateParts, cutoff: DateParts) {
  validateDate(birth, 'AD'); validateDate(cutoff, 'AD');
  if (epochDay(birth) > epochDay(cutoff)) throw new Error('future-birth');
  let totalMonths = (cutoff.year - birth.year) * 12 + cutoff.month - birth.month;
  if (epochDay(addMonthsClamped(birth, totalMonths)) > epochDay(cutoff)) totalMonths--;
  const anchor = addMonthsClamped(birth, totalMonths);
  return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days: epochDay(cutoff) - epochDay(anchor), totalDays: epochDay(cutoff) - epochDay(birth) };
}
