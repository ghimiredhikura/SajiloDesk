import { type Calendar, type DateParts, bsMonths, bsMonthsNe, adMonths, adMonthsNe, integer, nepaliDigits } from '../lib/dates';
export const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
export const t = (en: string, ne: string) => lang === 'ne' ? ne : en;
export const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
export const val = (id: string) => el<HTMLInputElement>(id).value;
export function setText(id: string, text: string) { el(id).textContent = text; }
export function readDate(prefix: string): DateParts { return { year:integer(val(`${prefix}-year`)), month:integer(val(`${prefix}-month`)), day:integer(val(`${prefix}-day`)) }; }
export function writeDate(prefix: string, d: DateParts) { for (const key of ['year','month','day'] as const) el<HTMLInputElement>(`${prefix}-${key}`).value = String(d[key]); }
export function setCalendar(prefix: string, calendar: Calendar) {
  const select = el<HTMLSelectElement>(`${prefix}-month`); const current = select.value;
  const months = calendar === 'BS' ? (lang === 'ne' ? bsMonthsNe : bsMonths) : (lang === 'ne' ? adMonthsNe : adMonths);
  select.replaceChildren(...months.map((month,i) => new Option(month, String(i+1))));
  if (current) select.value = current;
  el<HTMLInputElement>(`${prefix}-year`).placeholder = calendar === 'BS' ? '2083' : '2026';
  setText(`${prefix}-range`, calendar === 'BS' ? t('BS 1975–2099 · Nepali or Latin digits','वि.सं. १९७५–२०९९ · नेपाली वा अंग्रेजी अंक') : t('AD 13 Apr 1918–13 Apr 2043 · Nepali or Latin digits','ई.सं. १३ अप्रिल १९१८–१३ अप्रिल २०४३ · नेपाली वा अंग्रेजी अंक'));
}
const messages: Record<string,[string,string]> = {
  'invalid-number':['Enter a valid non-negative number. Nepali and Latin digits are supported.','मान्य धनात्मक संख्या वा शून्य लेख्नुहोस्। नेपाली र अंग्रेजी अंक चल्छन्।'],
  'invalid-date':['That date does not exist in the selected calendar. Check the year, month and day.','छानिएको पात्रोमा यो मिति छैन। वर्ष, महिना र गते जाँच्नुहोस्।'],
  range:['Use BS 1975–2099 or AD 13 April 1918–13 April 2043.','वि.सं. १९७५–२०९९ वा ई.सं. १३ अप्रिल १९१८–१३ अप्रिल २०४३ भित्रको मिति राख्नुहोस्।'],
  'future-birth':['The birth date must be on or before the selected cutoff date.','जन्ममिति अन्तिम मितिभन्दा अघि वा त्यही दिन हुनुपर्छ।'],
  'empty-text':['Paste some Preeti text first, or try the example.','पहिले प्रीति अक्षर पेस्ट गर्नुहोस् वा उदाहरण चलाउनुहोस्।'],
  'text-limit':['Use 50,000 characters or fewer. Split longer documents into smaller sections.','५०,००० सम्म अक्षर राख्नुहोस्। लामो सामग्रीलाई भाग लगाउनुहोस्।'],
  compound:['Use whole numbers for larger units. Aana must be below 16, Paisa and Daam below 4; Kattha and Dhur below 20. Only the smallest unit may contain decimals.','ठूला एकाइमा पूर्ण अंक राख्नुहोस्। आना १६ भन्दा, पैसा र दाम ४ भन्दा, कठ्ठा र धुर २० भन्दा कम हुनुपर्छ। सबैभन्दा सानो एकाइमा मात्र दशमलव राख्न मिल्छ।'],
  'land-range':['Please use an area no larger than 1 trillion square feet.','कृपया १ ट्रिलियन वर्ग फिटभन्दा सानो क्षेत्रफल राख्नुहोस्।'],
};
export function errorMessage(error: unknown) { const key = error instanceof Error ? error.message : ''; const pair = messages[key]; return pair ? t(...pair) : t('Something went wrong. Check your inputs and try again.','समस्या आयो। राखिएको विवरण जाँचेर फेरि चलाउनुहोस्।'); }
export function showError(error: unknown, id = 'form-error') { const node = el(id); node.textContent = errorMessage(error); node.hidden = false; node.focus(); }
export function clearError(id = 'form-error') { el(id).hidden = true; }
export function number(value: number, max = 4) { const s = new Intl.NumberFormat('en-US',{ maximumFractionDigits:max }).format(value); return lang === 'ne' ? nepaliDigits(s) : s; }
