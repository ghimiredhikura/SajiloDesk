import { convertDate, epochDay, iso, type DateParts } from './dates';
import { nepalDaysOn } from './nepal-key-days';

export const holidaySource = 'https://moha.gov.np/page/government-and-public-holidays-in-2083';
export const weekendSource = 'https://daorasuwa.moha.gov.np/post/sa-lka-sa-ra-vajana-ka-b-tha-2';
export const worldSource = 'https://www.un.org/en/observances/list-days-weeks';
export const calendarReviewed = '2026-11-05';
export const holidayYear = 2083;
type Label = readonly [en: string, ne: string];
type Holiday = { month: number; day: number; name: Label; scope?: Label; source?: string };
const holiday = (month: number, day: number, en: string, ne: string, scope?: Label): Holiday => ({month, day, name: [en, ne], scope});

// Transcribed from the 2083 Gazette, pages 2–6. Lunar dates are year-specific.
export const holidays: Holiday[] = [
  holiday(1,1,'Nepali New Year','नेपाली नयाँ वर्ष'),
  holiday(1,18,'Buddha Jayanti / Ubhauli','बुद्ध जयन्ती / उभौली'),
  holiday(1,18,"Workers’ Day",'श्रमिक दिवस'),
  {...holiday(2,14,'Bakra Eid','बकर इद'), source:'https://president.gov.np/सम्माननीय-राष्ट्रपति-श्-447/'},
  holiday(2,15,'Republic Day','गणतन्त्र दिवस'),
  {...holiday(5,23,'Gen Z Martyrs’ Day','जेनजी सहिद दिवस'), source:'https://dop.gov.np/category/530/'},
  holiday(5,12,'Raksha Bandhan / Janai Purnima','रक्षाबन्धन / जनै पूर्णिमा'),
  holiday(5,19,'Krishna Janmashtami','श्रीकृष्ण जन्माष्टमी'),
  holiday(5,13,'Gai Jatra','गाईजात्रा',['Newar community / Kathmandu Valley','नेवार समुदाय / काठमाडौं उपत्यका']),
  holiday(5,19,'Gaura Parva','गौरा पर्व',['observing communities','सम्बन्धित समुदाय']),
  holiday(5,29,'Teej','तीज',['women employees','महिला कर्मचारी']),
  holiday(6,3,'Constitution Day','संविधान दिवस'),
  holiday(6,9,'Indra Jatra','इन्द्रजात्रा',['Kathmandu Valley','काठमाडौं उपत्यका']),
  holiday(6,18,'Jitiya','जितिया',['observing women employees','पर्व मनाउने महिला कर्मचारी']),
  holiday(6,25,'Ghatasthapana','घटस्थापना'),
  holiday(6,31,'Dashain holiday','दशैं बिदा'),
  ...Array.from({length:6},(_,i)=>holiday(7,i+1,'Dashain holiday','दशैं बिदा')),
  ...Array.from({length:5},(_,i)=>holiday(7,i+22,'Tihar holiday','तिहार बिदा')),
  holiday(7,25,'Falgunanda Jayanti','फाल्गुनन्द जयन्ती',['Kirat followers','किरात धर्मावलम्बी']),
  holiday(7,29,'Chhath','छठ'),
  holiday(8,17,'Disability Day','अपाङ्गता दिवस',['employees with disabilities','अपाङ्गता भएका कर्मचारी']),
  holiday(9,9,'Udhauli / Yomari Punhi / Jyapu Day','उधौली / योमरी पुन्हि / ज्यापु दिवस'),
  holiday(9,10,'Christmas','क्रिसमस'),
  holiday(9,15,'Tamu Lhosar','तमु ल्होसार'),
  holiday(9,15,'Dura Hyeul Nakuma','दुरा ह्युल नाकुमा',['Dura community','दुरा समुदाय']),
  holiday(9,27,'Prithvi Jayanti / National Unity Day','पृथ्वी जयन्ती / राष्ट्रिय एकता दिवस'),
  holiday(10,1,'Maghe Sankranti / Maghi','माघे सङ्क्रान्ति / माघी'),
  holiday(10,16,'Martyrs’ Day','सहिद दिवस'),
  holiday(10,24,'Sonam Lhosar','सोनाम ल्होसार'),
  holiday(10,28,'Basanta Panchami','वसन्त पञ्चमी',['educational institutions','शिक्षण संस्था']),
  holiday(11,7,'Democracy Day','प्रजातन्त्र दिवस'),
  holiday(11,22,'Maha Shivaratri','महाशिवरात्रि'),
  holiday(11,24,"International Women’s Day",'अन्तर्राष्ट्रिय महिला दिवस'),
  holiday(11,25,'Gyalpo Lhosar','ग्याल्पो ल्होसार'),
  holiday(12,7,'Holi','फागु पूर्णिमा',['hill and mountain districts','हिमाली तथा पहाडी जिल्ला']),
  holiday(12,8,'Holi','फागु पूर्णिमा',['Terai districts','तराईका जिल्ला']),
  holiday(12,23,'Ghode Jatra','घोडेजात्रा',['Kathmandu Valley','काठमाडौं उपत्यका']),
];

// A curated set of fixed-date UN/UN-agency observances across all 12 months.
// Date-varying days are deliberately excluded rather than frozen to one year's date.
export const worldDays: Record<string, Label> = {
  '01-04':['World Braille Day','विश्व ब्रेल दिवस'],
  '01-24':['International Day of Education','अन्तर्राष्ट्रिय शिक्षा दिवस'],
  '01-26':['International Day of Clean Energy','अन्तर्राष्ट्रिय स्वच्छ ऊर्जा दिवस'],
  '02-02':['World Wetlands Day','विश्व सिमसार दिवस'],
  '02-11':['International Day of Women and Girls in Science','विज्ञानमा महिला तथा बालिकाको अन्तर्राष्ट्रिय दिवस'],
  '02-13':['World Radio Day','विश्व रेडियो दिवस'],
  '02-20':['World Day of Social Justice','विश्व सामाजिक न्याय दिवस'],
  '02-21':['International Mother Language Day','अन्तर्राष्ट्रिय मातृभाषा दिवस'],
  '03-03':['World Wildlife Day','विश्व वन्यजन्तु दिवस'],
  '03-08':["International Women’s Day",'अन्तर्राष्ट्रिय महिला दिवस'],
  '03-20':['International Day of Happiness','अन्तर्राष्ट्रिय खुशी दिवस'],
  '03-21':['International Day of Forests','अन्तर्राष्ट्रिय वन दिवस'],
  '03-22':['World Water Day','विश्व जल दिवस'],
  '03-24':['World Tuberculosis Day','विश्व क्षयरोग दिवस'],
  '04-02':['World Autism Awareness Day','विश्व अटिजम सचेतना दिवस'],
  '04-07':['World Health Day','विश्व स्वास्थ्य दिवस'],
  '04-22':['International Mother Earth Day','अन्तर्राष्ट्रिय पृथ्वी दिवस'],
  '04-23':['World Book and Copyright Day','विश्व पुस्तक तथा प्रतिलिपि अधिकार दिवस'],
  '04-25':['World Malaria Day','विश्व मलेरिया दिवस'],
  '05-03':['World Press Freedom Day','विश्व प्रेस स्वतन्त्रता दिवस'],
  '05-15':['International Day of Families','अन्तर्राष्ट्रिय परिवार दिवस'],
  '05-20':['World Bee Day','विश्व मौरी दिवस'],
  '05-21':['International Tea Day','अन्तर्राष्ट्रिय चिया दिवस'],
  '05-22':['International Day for Biological Diversity','अन्तर्राष्ट्रिय जैविक विविधता दिवस'],
  '05-29':['International Day of UN Peacekeepers','संयुक्त राष्ट्र शान्ति सैनिकको अन्तर्राष्ट्रिय दिवस'],
  '05-31':['World No-Tobacco Day','विश्व सुर्तीजन्य पदार्थविरुद्धको दिवस'],
  '06-01':['Global Day of Parents','विश्व अभिभावक दिवस'],
  '06-03':['World Bicycle Day','विश्व साइकल दिवस'],
  '06-05':['World Environment Day','विश्व वातावरण दिवस'],
  '06-07':['World Food Safety Day','विश्व खाद्य स्वच्छता दिवस'],
  '06-08':['World Oceans Day','विश्व महासागर दिवस'],
  '06-12':['World Day Against Child Labour','विश्व बालश्रम विरुद्धको दिवस'],
  '06-14':['World Blood Donor Day','विश्व रक्तदाता दिवस'],
  '06-16':['International Day of Family Remittances','अन्तर्राष्ट्रिय पारिवारिक विप्रेषण दिवस'],
  '06-20':['World Refugee Day','विश्व शरणार्थी दिवस'],
  '06-21':['International Day of Yoga','अन्तर्राष्ट्रिय योग दिवस'],
  '07-11':['World Population Day','विश्व जनसंख्या दिवस'],
  '07-15':['World Youth Skills Day','विश्व युवा सीप दिवस'],
  '07-18':['Nelson Mandela International Day','नेल्सन मण्डेला अन्तर्राष्ट्रिय दिवस'],
  '07-20':['World Chess Day','विश्व चेस दिवस'],
  '07-28':['World Hepatitis Day','विश्व हेपाटाइटिस दिवस'],
  '07-30':['International Day of Friendship','अन्तर्राष्ट्रिय मित्रता दिवस'],
  '08-09':["International Day of the World’s Indigenous Peoples",'विश्व आदिवासी जनजाति दिवस'],
  '08-12':['International Youth Day','अन्तर्राष्ट्रिय युवा दिवस'],
  '08-19':['World Humanitarian Day','विश्व मानवीय सहायता दिवस'],
  '08-27':['World Lake Day','विश्व ताल दिवस'],
  '09-05':['International Day of Charity','अन्तर्राष्ट्रिय परोपकार दिवस'],
  '09-07':['International Day of Clean Air for Blue Skies','नीलो आकाशका लागि स्वच्छ हावाको अन्तर्राष्ट्रिय दिवस'],
  '09-08':['International Literacy Day','अन्तर्राष्ट्रिय साक्षरता दिवस'],
  '09-15':['International Day of Democracy','अन्तर्राष्ट्रिय लोकतन्त्र दिवस'],
  '09-16':['International Day for the Preservation of the Ozone Layer','ओजोन तह संरक्षणको अन्तर्राष्ट्रिय दिवस'],
  '09-17':['World Patient Safety Day','विश्व बिरामी सुरक्षा दिवस'],
  '09-21':['International Day of Peace','अन्तर्राष्ट्रिय शान्ति दिवस'],
  '09-23':['International Day of Sign Languages','अन्तर्राष्ट्रिय सांकेतिक भाषा दिवस'],
  '09-27':['World Tourism Day','विश्व पर्यटन दिवस'],
  '09-30':['International Translation Day','अन्तर्राष्ट्रिय अनुवाद दिवस'],
  '10-01':['International Day of Older Persons','अन्तर्राष्ट्रिय ज्येष्ठ नागरिक दिवस'],
  '10-02':['International Day of Non-Violence','अन्तर्राष्ट्रिय अहिंसा दिवस'],
  '10-05':["World Teachers’ Day",'विश्व शिक्षक दिवस'],
  '10-09':['World Post Day','विश्व हुलाक दिवस'],
  '10-10':['World Mental Health Day','विश्व मानसिक स्वास्थ्य दिवस'],
  '10-11':['International Day of the Girl Child','अन्तर्राष्ट्रिय बालिका दिवस'],
  '10-13':['International Day for Disaster Risk Reduction','अन्तर्राष्ट्रिय विपद् जोखिम न्यूनीकरण दिवस'],
  '10-15':['International Day of Rural Women','अन्तर्राष्ट्रिय ग्रामीण महिला दिवस'],
  '10-16':['World Food Day','विश्व खाद्य दिवस'],
  '10-17':['International Day for the Eradication of Poverty','अन्तर्राष्ट्रिय गरिबी निवारण दिवस'],
  '10-24':['United Nations Day','संयुक्त राष्ट्र दिवस'],
  '10-31':['World Cities Day','विश्व शहर दिवस'],
  '11-05':['World Tsunami Awareness Day','विश्व सुनामी सचेतना दिवस'],
  '11-10':['World Science Day for Peace and Development','शान्ति र विकासका लागि विश्व विज्ञान दिवस'],
  '11-14':['World Diabetes Day','विश्व मधुमेह दिवस'],
  '11-16':['International Day for Tolerance','अन्तर्राष्ट्रिय सहिष्णुता दिवस'],
  '11-19':['World Toilet Day','विश्व शौचालय दिवस'],
  '11-20':["World Children’s Day",'विश्व बाल दिवस'],
  '11-25':['International Day for the Elimination of Violence against Women','महिला हिंसा अन्त्यको अन्तर्राष्ट्रिय दिवस'],
  '12-01':['World AIDS Day','विश्व एड्स दिवस'],
  '12-03':['International Day of Persons with Disabilities','अपाङ्गता भएका व्यक्तिहरूको अन्तर्राष्ट्रिय दिवस'],
  '12-05':['World Soil Day','विश्व माटो दिवस'],
  '12-09':['International Anti-Corruption Day','अन्तर्राष्ट्रिय भ्रष्टाचार विरुद्धको दिवस'],
  '12-10':['Human Rights Day','मानव अधिकार दिवस'],
  '12-11':['International Mountain Day','अन्तर्राष्ट्रिय पर्वत दिवस'],
  '12-18':['International Migrants Day','अन्तर्राष्ट्रिय आप्रवासी दिवस'],
  '12-20':['International Human Solidarity Day','अन्तर्राष्ट्रिय मानव ऐक्यबद्धता दिवस'],
  '12-21':['World Meditation Day','विश्व ध्यान दिवस'],
};

export function dailyObservances(ad: DateParts, lang: 'en' | 'ne') {
  const index = lang === 'ne' ? 1 : 0;
  const bs = convertDate(ad, 'AD');
  const covered = bs.year === holidayYear;
  const entries = covered ? holidays.filter(h=>h.month === bs.month && h.day === bs.day) : [];
  const weekday = new Date(epochDay(ad)*86400000).getUTCDay();
  const weekly = covered && (weekday === 0 || weekday === 6);
  const national = entries.filter(h=>!h.scope);
  const scoped = entries.filter(h=>h.scope);
  const names = entries.map(h=>`${h.name[index]}${h.scope ? ` (${h.scope[index]})` : ''}`);
  const weeklyLabel = lang === 'ne' ? 'साप्ताहिक बिदा' : 'Weekly holiday';
  const nepal = !covered ? (lang === 'ne' ? 'यस वर्षको बिदा विवरण थप्न बाँकी छ' : 'Holiday calendar awaiting update')
    : names.length ? names.join(' / ') : weekly ? weeklyLabel
    : (lang === 'ne' ? 'सूचीमा देशव्यापी बिदा छैन' : 'No nationwide holiday listed');
  const world = worldDays[iso(ad).slice(5)]?.[index];
  const holidayLabel = lang === 'ne' ? 'देशव्यापी बिदा' : 'Nationwide holiday';
  const regionalLabel = lang === 'ne' ? 'तोकिएको समूह वा क्षेत्रमा बिदा' : 'Scoped holiday';
  const primary = !covered ? nepal : national.length ? `${holidayLabel}: ${national.map(h=>h.name[index]).join(' / ')}`
    : scoped.length ? `${regionalLabel}: ${names.join(' / ')}` : weekly ? weeklyLabel : '';
  const holidayStatus = !covered ? 'unavailable' : national.length ? 'nationwide' : scoped.length ? 'scoped' : weekly ? 'weekly' : 'none';
  return { covered, nepal, world, nepalDays:nepalDaysOn(ad,bs,lang), holidayStatus, holidayText: primary || nepal, summary: [primary,world].filter(Boolean).join(' · ') || nepal,
    source: entries.find(h=>h.source)?.source || (weekly && !entries.length ? weekendSource : holidaySource) };
}
