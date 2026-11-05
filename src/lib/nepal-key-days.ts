import { type DateParts } from './dates';

export type NepalKeyDay = {
  calendar: 'BS' | 'AD'; month: number; day: number;
  name: readonly [en:string, ne:string]; source: string; year?: number;
};
const gazette='https://moha.gov.np/page/government-and-public-holidays-in-2083';
const forests='https://www.dofsc.gov.np/gallery-list/';
const bs=(month:number,day:number,en:string,ne:string,source=gazette):NepalKeyDay=>({calendar:'BS',month,day,name:[en,ne],source});

// Curated and source-checked 5 November 2026. These are observances, not a holiday list.
// Fixed BS/AD dates repeat in their own calendar; lunar dates require an explicit year.
export const nepalKeyDays: readonly NepalKeyDay[] = [
  bs(1,1,'Nepali New Year','नेपाली नयाँ वर्ष'),
  bs(1,11,'Loktantra Day','लोकतन्त्र दिवस','https://raptimunchitwan.gov.np/sites/raptimunchitwan.gov.np/files/documents/निति तथा कार्यक्रम २०७६.pdf'),
  {calendar:'AD',month:5,day:2,name:['National ICT Day','राष्ट्रिय सूचना तथा सञ्चार प्रविधि दिवस'],source:'https://giwmscdnone.gov.np/media/app/public/323/posts/1714025835_17.pdf'},
  bs(2,15,'Republic Day','गणतन्त्र दिवस'),
  bs(2,21,'Caste Discrimination and Untouchability Elimination Day','जातीय भेदभाव तथा छुवाछूत उन्मूलन राष्ट्रिय दिवस'),
  bs(3,15,'National Paddy Day','राष्ट्रिय धान दिवस','https://vpn.gov.np/content/68/dhaan-diwas/'),
  bs(3,29,'Bhanu Bhakta Acharya Jayanti','भानुभक्त आचार्य जयन्ती','https://president.gov.np/सम्माननीय-राष्ट्रपति-श्-455/'),
  bs(4,24,'Soil Conservation Day','भू-संरक्षण दिवस',forests),
  bs(4,25,'Community Forest Day','सामुदायिक वन दिवस',forests),
  bs(5,15,'Library Day','पुस्तकालय दिवस','https://bhaktapurmun.gov.np/sites/bhaktapurmun.gov.np/files/documents/BKT-301.pdf'),
  bs(5,22,'Civil Service Day','निजामती सेवा दिवस'),
  bs(5,29,"National Children’s Day",'राष्ट्रिय बाल दिवस','https://ncrc.gov.np/content/77/regarding-the-celebration-of-national-children-s-day/'),
  bs(6,1,'National Science Day','राष्ट्रिय विज्ञान दिवस','https://moest.gov.np/content/13314/the-motto-of-the-twelfth-national-science/'),
  bs(6,2,'National Education Day','राष्ट्रिय शिक्षा दिवस','https://old.cehrd.gov.np/file_data/mediacenter_files/media_file-11-1106586325.pdf'),
  bs(6,3,'Constitution Day','संविधान दिवस'),
  bs(7,25,'Falgunanda Jayanti','फाल्गुनन्द जयन्ती'),
  bs(8,1,'National Tax Day','राष्ट्रिय कर दिवस','https://ird.gov.np/public/pdf/1098727300.pdf'),
  bs(9,27,'Prithvi Jayanti / National Unity Day','पृथ्वी जयन्ती / राष्ट्रिय एकता दिवस'),
  bs(10,2,'Earthquake Safety Day','भूकम्प सुरक्षा दिवस','https://ndrrma.gov.np/en/news/210'),
  bs(10,16,'Martyrs’ Day','सहिद दिवस'),
  bs(10,24,'Balkrishna Sama Jayanti','बालकृष्ण सम जयन्ती','https://metronews.kathmandu.gov.np/news/detail/0702609283'),
  bs(11,7,'Democracy Day','प्रजातन्त्र दिवस'),
  bs(12,20,'National Cooperative Day','राष्ट्रिय सहकारी दिवस','https://cro.lumbini.gov.np/en/albums'),
  {...bs(1,18,'Buddha Jayanti','बुद्ध जयन्ती'),year:2083},
];

export function nepalDaysOn(ad:DateParts,bsDate:DateParts,lang:'en'|'ne') {
  // This reviewed edition covers current/future observances, not historical applicability.
  if(bsDate.year<2083)return [];
  return nepalKeyDays.filter(entry=>{
    const date=entry.calendar==='BS'?bsDate:ad;
    return date.month===entry.month && date.day===entry.day && (entry.year===undefined || date.year===entry.year);
  }).map(entry=>({name:entry.name[lang==='ne'?1:0],source:entry.source}));
}
