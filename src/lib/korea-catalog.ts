import type { Bilingual } from './korea';

// These are status families, not a claim that every numbered programme has
// identical eligibility. Keep uncommon subcodes under their parent family.
export const visaOptions: { id: string; family: string; name: Bilingual; group: string }[] = [
  { id:'E-9', family:'E-9', name:['EPS worker','EPS श्रमिक'], group:'common' },
  { id:'D-2', family:'D-2', name:['University student','विश्वविद्यालयका विद्यार्थी'], group:'common' },
  { id:'D-4-1', family:'D-4', name:['Korean-language student','कोरियाली भाषा विद्यार्थी'], group:'common' },
  { id:'D-10', family:'D-10', name:['Job seeking / startup preparation','जागिर खोज्ने / व्यवसायको तयारी'], group:'common' },
  { id:'E-7', family:'E-7', name:['Specialised employment','विशेष सीपको रोजगारी'], group:'common' },
  { id:'E-7-4', family:'E-7', name:['Skilled worker','दक्ष श्रमिक'], group:'common' },
  { id:'F-3', family:'F-3', name:['Dependent family','आश्रित परिवार'], group:'common' },
  { id:'F-6', family:'F-6', name:['Marriage migrant','वैवाहिक आप्रवासन'], group:'common' },
  { id:'F-2', family:'F-2', name:['Resident','दीर्घकालीन बसोबास'], group:'common' },
  { id:'D-1', family:'D-1', name:['Culture / arts','संस्कृति / कला'], group:'study' },
  { id:'D-2-1', family:'D-2', name:['Associate degree','एसोसिएट डिग्री'], group:'study' },
  { id:'D-2-2', family:'D-2', name:['Bachelor’s degree','स्नातक'], group:'study' },
  { id:'D-2-3', family:'D-2', name:['Master’s degree','स्नातकोत्तर'], group:'study' },
  { id:'D-2-4', family:'D-2', name:['Doctoral degree','विद्यावारिधि'], group:'study' },
  { id:'D-2-5', family:'D-2', name:['Research study','अनुसन्धान अध्ययन'], group:'study' },
  { id:'D-2-6', family:'D-2', name:['Exchange student','आदानप्रदानका विद्यार्थी'], group:'study' },
  { id:'D-2-7', family:'D-2', name:['Work–study programme','पढाइसँग काम जोडिएको कार्यक्रम'], group:'study' },
  { id:'D-2-8', family:'D-2', name:['Visiting student','आगन्तुक विद्यार्थी'], group:'study' },
  { id:'D-3', family:'D-3', name:['Industrial training','औद्योगिक तालिम'], group:'study' },
  { id:'D-4', family:'D-4', name:['General training · other subtypes','अन्य अध्ययन / तालिम'], group:'study' },
  { id:'D-4-7', family:'D-4', name:['Foreign-language training','विदेशी भाषाको तालिम'], group:'study' },
  { id:'D-5', family:'D-5', name:['Journalism','पत्रकारिता'], group:'work' },
  { id:'D-6', family:'D-6', name:['Religious work','धार्मिक काम'], group:'work' },
  { id:'D-7', family:'D-7', name:['Company transfer','कम्पनीको शाखामा सरुवा'], group:'work' },
  { id:'D-8', family:'D-8', name:['Business investment / technology startup','लगानी / प्रविधि व्यवसाय'], group:'work' },
  { id:'D-9', family:'D-9', name:['Trade / business management','व्यापार / व्यवसाय सञ्चालन'], group:'work' },
  { id:'E-1', family:'E-1', name:['Professor','प्राध्यापक'], group:'work' },
  { id:'E-2', family:'E-2', name:['Foreign-language instructor','विदेशी भाषा प्रशिक्षक'], group:'work' },
  { id:'E-3', family:'E-3', name:['Researcher','अनुसन्धानकर्ता'], group:'work' },
  { id:'E-4', family:'E-4', name:['Technical instructor','प्राविधिक प्रशिक्षक'], group:'work' },
  { id:'E-5', family:'E-5', name:['Licensed professional','इजाजतप्राप्त पेसाकर्मी'], group:'work' },
  { id:'E-6', family:'E-6', name:['Arts / performance','कला / प्रस्तुति'], group:'work' },
  { id:'E-8', family:'E-8', name:['Seasonal worker','मौसमी श्रमिक'], group:'work' },
  { id:'E-10', family:'E-10', name:['Ship crew','पानीजहाजका कर्मचारी'], group:'work' },
  { id:'H-1', family:'H-1', name:['Working holiday','घुम्दै काम गर्ने'], group:'work' },
  { id:'H-2', family:'H-2', name:['Working visit · ethnic Korean','कोरियाली मूलका आगन्तुक श्रमिक'], group:'work' },
  { id:'F-1', family:'F-1', name:['Family visit / other residence','परिवार भेट / अन्य बसोबास'], group:'family' },
  { id:'F-1-D', family:'F-1', name:['Digital nomad / workcation','विदेशको काम गर्दै कोरियामा बस्ने'], group:'family' },
  { id:'F-4', family:'F-4', name:['Overseas Korean','विदेशी नागरिकता भएका कोरियाली मूलका व्यक्ति'], group:'family' },
  { id:'F-5', family:'F-5', name:['Permanent resident','स्थायी बासिन्दा'], group:'family' },
  { id:'G-1', family:'G-1', name:['Humanitarian / medical / other grounds','मानवीय / उपचार / अन्य आधार'], group:'family' },
  { id:'C-3', family:'C-3', name:['Short-term visit','छोटो भ्रमण'], group:'short' },
  { id:'C-4', family:'C-4', name:['Short-term employment','छोटो अवधिको रोजगारी'], group:'short' },
  { id:'C-1', family:'C-1', name:['Short-term news coverage','छोटो अवधिको समाचार सङ्कलन'], group:'short' },
  { id:'B-1', family:'B-1', name:['Visa exemption','भिसा छुट'], group:'short' },
  { id:'B-2', family:'B-2', name:['Tourism / transit without a visa','भिसाबिनाको भ्रमण / ट्रान्जिट'], group:'short' },
  { id:'A-1', family:'A-1', name:['Diplomat','कूटनीतिक'], group:'official' },
  { id:'A-2', family:'A-2', name:['Official duty','सरकारी काम'], group:'official' },
  { id:'A-3', family:'A-3', name:['Agreement','विशेष सम्झौता'], group:'official' },
];
export const visaGroups: { id:string; name:Bilingual }[] = [
  {id:'common',name:['Common choices','धेरैलाई चाहिने']},
  {id:'study',name:['Study, culture & training','अध्ययन, कला र तालिम']},
  {id:'work',name:['Work & business','रोजगारी र व्यवसाय']},
  {id:'family',name:['Family, residence & other','परिवार, बसोबास र अन्य']},
  {id:'short',name:['Short visits','छोटो भ्रमण']},
  {id:'official',name:['Diplomatic & official','कूटनीतिक र सरकारी']},
];
export const koreaVisas = visaOptions.map(v=>v.id);
export const visaFamily = (visa:string) => visaOptions.find(v=>v.id===visa)?.family ?? '';
export const normalizeVisaSearch=(value:string)=>value.normalize('NFKC').toLocaleLowerCase().replace(/[\s‐‑–—-]/g,'');
export function searchVisaOptions(query:string){
  const q=normalizeVisaSearch(query);
  return visaOptions.filter(v=>!q||normalizeVisaSearch(`${v.id} ${v.name.join(' ')}`).includes(q));
}
export const visaFamilies = [...new Set(visaOptions.map(v=>v.family))];
export const isShortStay = (visa:string) => /^[BC]-/.test(visaFamily(visa));
export const isOfficial = (visa:string) => /^A-/.test(visaFamily(visa));
export const codeSlug = (visa:string) => visa.toLowerCase();
export const usesD2Checklist=(visa:string)=>['D-2','D-2-1','D-2-2','D-2-3','D-2-4','D-2-7'].includes(visa);
export const koreaTasks: { id:string; name:Bilingual; slug:string }[] = [
  {id:'extension',name:['Extend my stay','बसाइको म्याद थप्ने'],slug:'stay-extension'},
  {id:'change',name:['Change to another visa / status','अर्को भिसामा परिवर्तन गर्ने'],slug:'status-change'},
  {id:'address',name:['Report a new address','नयाँ ठेगाना दर्ता गर्ने'],slug:'address-change'},
  {id:'registration',name:['First residence card / registration','पहिलो विदेशी दर्ता / परिचयपत्र'],slug:'first-registration'},
  {id:'passport',name:['Report passport / personal-detail changes','राहदानी / व्यक्तिगत विवरण सच्याउने'],slug:'passport-change'},
  {id:'workplace',name:['Change or add a workplace','कम्पनी फेर्ने / अर्को कार्यस्थल थप्ने'],slug:'workplace-change'},
  {id:'part-time',name:['Student part-time work','विद्यार्थीले आंशिक काम गर्ने'],slug:'student-work'},
  {id:'outside',name:['Work / activity outside my status','भिसाको दायराबाहिरको काम'],slug:'outside-status'},
  {id:'employment',name:['Report occupation / income changes','पेसा / आम्दानीको विवरण दिने'],slug:'employment-report'},
  {id:'school',name:['Change school / course or report study details','संस्था / पढाइको विवरण फेर्ने'],slug:'school-change'},
  {id:'card',name:['Lost / damaged card or F-5 card renewal','हराएको परिचयपत्र / F-5 कार्ड नवीकरण'],slug:'residence-card'},
  {id:'travel',name:['Travel abroad & re-enter Korea','विदेश गएर कोरिया फर्कने'],slug:'re-entry'},
  {id:'family',name:['Bring family / dependents','परिवार / आश्रित सदस्य बोलाउने'],slug:'family-invitation'},
  {id:'birth',name:['Child born in Korea / grant of status','कोरियामा जन्मेको बच्चाको बसाइ अनुमति'],slug:'child-status'},
  {id:'permanent',name:['Apply for permanent residence (F-5)','स्थायी बसोबास (F-5) का लागि आवेदन'],slug:'change-to-f-5'},
  {id:'visa',name:['Apply for a visa before entering Korea','कोरिया आउनुअघि भिसा लिने'],slug:'entry-visa'},
  {id:'departure',name:['Leave Korea / more time to depart','कोरिया छोड्ने / प्रस्थानका लागि समय माग्ने'],slug:'departure'},
  {id:'overdue',name:['Already late / stay expired','म्याद नाघिसकेको अवस्था'],slug:'overdue'},
  {id:'refusal',name:['Refusal / cancellation / appeal','अस्वीकृति / रद्द / पुनरावेदन'],slug:'refusal'},
  {id:'certificates',name:['Get immigration certificates','अध्यागमनका प्रमाणपत्र लिने'],slug:'immigration-certificates'},
  {id:'appointment',name:['Appointments, forms, fees & application tracking','भेटको समय, फाराम, शुल्क र आवेदनको अवस्था'],slug:'application-help'},
];
// UI relevance, checked against the 261106 HiKorea manual. These are usual
// procedure/route shortlists, not an eligibility decision or an exhaustive ban.
// Unknown nationality, history, qualifications and humanitarian grounds must
// remain accessible through the separately labelled special-case route.
const professionalFamilies=['E-1','E-2','E-3','E-4','E-5','E-6','E-7'];
const employmentReportFamilies=['D-7','D-8','D-9',...professionalFamilies,'E-8','E-9','E-10','F-2','F-4','F-6','H-2'];
const studentWorkVisas=['D-2','D-2-1','D-2-2','D-2-3','D-2-4','D-2-6','D-2-7','D-2-8','D-4-1','D-4-7'];
export interface JourneyChoice {id:string; name:Bilingual}
export interface ChangeTarget extends JourneyChoice {exception:boolean}
export const otherChangeTarget='other';
export const otherChangeName:Bilingual=['Other / special-case route','अन्य / विशेष अवस्थाको प्रक्रिया'];
export function getTaskChoices(visa:string):JourneyChoice[]{
  if(!koreaVisas.includes(visa))return [];
  const family=visaFamily(visa),short=isShortStay(visa),official=isOfficial(visa);
  const ids=new Set(['change','departure','overdue','refusal','certificates','appointment']);
  if(!short&&!official){
    for(const id of ['extension','address','registration','passport','card','travel','birth'])ids.add(id);
  }else if(short){
    if(family.startsWith('C-'))ids.add('extension');
  }else{
    ids.add('travel');ids.add('birth');ids.add('outside');
    if(family==='A-3')ids.add('extension');
  }
  if(studentWorkVisas.includes(visa))ids.add('part-time');
  if(['D-2','D-4','F-1','F-2','F-3','F-4','F-5','F-6'].includes(family))ids.add('school');
  if(employmentReportFamilies.includes(family))ids.add('employment');
  if([...professionalFamilies,'E-8','E-9','E-10','D-7','D-8','D-9','H-2','F-2'].includes(family))ids.add('workplace');
  if(['D-1','D-2','D-4','D-5','D-6','D-7','D-8','D-9','D-10',...professionalFamilies,'F-1','F-3','G-1'].includes(family)&&visa!=='F-1-D')ids.add('outside');
  if(['D-1','D-2','D-4','D-5','D-6','D-7','D-8','D-9','D-10',...professionalFamilies,'F-1','F-2','F-4','F-5','F-6','H-2'].includes(family))ids.add('family');
  if(['D-2','D-7','D-8','D-9',...professionalFamilies,'F-1','F-2','F-3','F-4','F-6','H-2'].includes(family))ids.add('permanent');
  if(visa==='F-5')for(const id of ['extension','change','registration','employment','outside','workplace','permanent','part-time'])ids.delete(id);
  if(visa==='F-1-D')ids.delete('permanent');
  const names:Record<string,Bilingual>={};
  if(visa==='F-5'){
    names.card=['Renew / replace my permanent-resident card','स्थायी बासिन्दाको कार्ड नवीकरण / फेरि बनाउने'];
    names.overdue=['Missed a report / card deadline','सूचना वा कार्डको म्याद नाघेको'];
  }else if(ids.has('card'))names.card=['Replace a lost / damaged residence card','हराएको / बिग्रिएको परिचयपत्र फेरि बनाउने'];
  if(short)names.extension=['Check a short-stay extension (exception)','छोटो बसाइ थप्ने अपवादबारे बुझ्ने'];
  if(family==='A-3')names.extension=['Extend an agreement-based stay','सम्झौताअनुसार बसाइ थप्ने'];
  if(family==='E-8')names.workplace=['Ask about changing a seasonal employer','मौसमी कामको रोजगारदाता फेर्न बुझ्ने'];
  if(family==='H-2')names.workplace=['Report starting work / a new employer','काम सुरु / रोजगारदाता फेरिएको सूचना'];
  if(family==='F-2')names.workplace=['Workplace changes under my F-2 conditions','F-2 का सर्तअनुसार कार्यस्थल फेर्ने'];
  if(ids.has('school')&&!['D-2','D-4'].includes(family))names.school=['Report school details (ages 6–18)','विद्यालयको विवरण दिने (६–१८ वर्ष)'];
  const choices=koreaTasks.filter(t=>ids.has(t.id)).map(t=>({id:t.id,name:names[t.id]??t.name}));
  if(visa==='F-5')choices.sort((a,b)=>Number(b.id==='card')-Number(a.id==='card'));
  return choices;
}
export function getChangeTargets(visa:string):ChangeTarget[]{
  if(!koreaVisas.includes(visa)||visa==='F-5')return [];
  const f=visaFamily(visa),ids=new Set<string>(),exceptions=new Set<string>();
  const add=(...codes:string[])=>codes.forEach(code=>ids.add(code));
  const study=()=>{for(const v of visaOptions)if(['D-2','D-4'].includes(v.family))ids.add(v.id);};
  const professional=()=>add(...professionalFamilies);
  if(isShortStay(visa)){
    if(['B-1','B-2','C-3'].includes(f))add('F-1-D');
    add('F-3','F-6','G-1');exceptions.add('F-6');
  }else if(['D-3','E-8','E-9','E-10'].includes(f)){
    add('F-3','F-6','G-1');
    if(['E-9','E-10'].includes(f))add('E-7-4');
  }else if(f==='G-1'){
    // Humanitarian G-1 subtypes and restoration of a former E-9 status need
    // individual grounds; never present these as ordinary open conversions.
    study();add('E-9','F-3','F-6');
    for(const id of ids)exceptions.add(id);
  }else if(f==='H-1'){
    // H-1 manual permits qualifying professional changes under some national
    // agreements, but expressly excludes an in-country H-1 -> F-6 change.
    professional();for(const id of ids)exceptions.add(id);
  }else{
    study();professional();add('D-8','D-9','D-10','F-3','F-6','G-1');
    if(isOfficial(visa))add('A-1','A-2','A-3');
    if(['D-7','D-8','D-9'].includes(f))add('D-7');
    if(f!=='D-4')add('F-2');
    if(getTaskChoices(visa).some(t=>t.id==='permanent'))add('F-5');
    if(f==='H-2')add('E-7-4','F-4');
    if(f==='F-6'){add('F-1');exceptions.add('F-1');}
    if(visa==='F-1-D')add('F-1');
  }
  // F-3 domestic changes are humanitarian/change-of-circumstances cases.
  exceptions.add('F-3');exceptions.add('G-1');
  return visaOptions.filter(v=>v.id!==visa&&ids.has(v.id)).map(v=>{
    let name=v.name;
    if(f==='G-1'&&v.id==='E-9')name=['Restore a former EPS status','पहिलेको EPS भिसा पुनः पाउने'];
    const exception=exceptions.has(v.id);
    return {id:v.id,name:[`${v.id} · ${name[0]}${exception?' · special case':''}`,`${v.id} · ${name[1]}${exception?' · विशेष अवस्था':''}`] as Bilingual,exception};
  }).sort((a,b)=>Number(a.exception)-Number(b.exception));
}
export function isJourneyChoiceRelevant(visa:string,task:string,target=''):boolean{
  if(!getTaskChoices(visa).some(t=>t.id===task))return false;
  return task!=='change'||target===otherChangeTarget||getChangeTargets(visa).some(t=>t.id===target);
}
export function koreaJourney(visa:string, task:string, target=''):string|null {
  if (!isJourneyChoiceRelevant(visa,task,target)) return null;
  if(task==='change'&&target===otherChangeTarget)return 'status-change-check';
  if (task==='change') return koreaVisas.includes(target) && visa!==target ? `change-to-${codeSlug(target)}` : null;
  if (task==='extension') {
    if (visa==='F-5') return 'residence-card';
    if (usesD2Checklist(visa)) return 'd2-extension';
    if (visa==='D-4-1') return 'd4-extension';
    if (visa==='E-9') return 'e9-extension';
    return `extend-${codeSlug(visa)}`;
  }
  if (task==='address' && visa==='F-4') return 'f4-address-change';
  if (task==='registration' && visa==='F-4') return 'f4-registration';
  if (task==='permanent' && visa==='F-5') return 'residence-card';
  if (task==='workplace' && ['D-2','D-4'].includes(visaFamily(visa))) return 'student-work';
  return koreaTasks.find(t=>t.id===task)?.slug ?? null;
}
export function journeyCaution(visa:string, task:string, target=''):Bilingual|null {
  const f=visaFamily(visa), t=visaFamily(target);
  if(task==='change' && target==='F-1-D' && ['B-1','B-2','C-3'].includes(f))return ['The current F-1-D manual includes an in-country route for qualifying B-1/B-2/C-3 visitors. Overseas remote employment, experience, income, insurance and criminal-record conditions still apply; this is an exception to ordinary short-stay restrictions.','हालको F-1-D निर्देशिकामा योग्य B-1/B-2/C-3 आगन्तुकले कोरियामै परिवर्तन गर्न सक्ने व्यवस्था छ। विदेशको अनलाइन रोजगारी, अनुभव, आय, बीमा र आपराधिक अभिलेखका सर्त भने लागू हुन्छन्। यो छोटो बसाइको सामान्य प्रतिबन्धको अपवाद हो।'];
  if (task==='change' && t==='D-2' && ['D-3','E-8','E-9','E-10'].includes(f)) return ['The current D-2 manual restricts this in-country change. Admission alone does not remove that restriction. Ask about applying for a student visa abroad before changing your plans.','हालको D-2 निर्देशिकाले यो भिसाबाट कोरियामै परिवर्तन गर्न रोक लगाएको छ। भर्ना पाउँदैमा त्यो हट्दैन। योजना फेर्नुअघि विदेशबाट विद्यार्थी भिसा लिने प्रक्रियाबारे बुझ्नुहोस्।'];
  if (task==='change' && ['E-8','E-9','H-1','H-2'].includes(t)) return ['This target has a special recruitment, nationality or entry route. It is not an ordinary switch from any visa. Confirm an explicit in-country exception (for example, a qualifying former E-9 worker recovering status) before using the papers below.','यो भिसामा विशेष भर्ती, राष्ट्रियता वा प्रवेशको प्रक्रिया हुन्छ। जुनसुकै भिसाबाट सामान्य रूपमा परिवर्तन हुँदैन। तलका कागजात प्रयोग गर्नुअघि कोरियामै मिल्ने स्पष्ट अपवाद छ कि बुझ्नुहोस्। उदाहरणका लागि योग्य पहिलेको E-9 श्रमिकले पुरानै भिसा पुनः पाउने अवस्था।'];
  if (task==='change' && isShortStay(visa)) return ['Short-stay and visa-free entrants are generally restricted from changing status in Korea. Nationality and specific exceptions matter; verify with immigration before collecting or paying for documents.','छोटो भ्रमण र भिसा छुटमा आएका व्यक्तिलाई कोरियामै भिसा परिवर्तनमा सामान्यतया रोक छ। राष्ट्रियता र विशेष अपवाद महत्त्वपूर्ण हुन्छन्। कागजात जुटाउन वा खर्च गर्नुअघि अध्यागमनसँग निश्चित गर्नुहोस्।'];
  if (isOfficial(visa) && ['registration','address','passport','employment'].includes(task)) return ['Diplomatic/official/agreement exemptions can apply. Establish your registration duty with the mission or responsible office before using the ordinary registered-resident procedure.','कूटनीतिक/सरकारी/सम्झौताको छुट लागू हुन सक्छ। सामान्य विदेशी दर्ताको प्रक्रिया प्रयोग गर्नुअघि नियोग वा जिम्मेवार कार्यालयसँग आफ्नो दायित्व निश्चित गर्नुहोस्।'];
  if (isShortStay(visa) && ['registration','address','passport'].includes(task)) return ['This is normally a registered long-term resident’s procedure. Short-stay visitors do not automatically have the same registration or reporting duty; confirm your own situation with immigration.','यो सामान्यतया दीर्घकालीन विदेशी दर्ता भएका व्यक्तिको प्रक्रिया हो। छोटो भ्रमणमा त्यही दर्ता वा सूचना दिने दायित्व स्वतः लागू हुँदैन। आफ्नो अवस्था अध्यागमनसँग बुझ्नुहोस्।'];
  if (task==='part-time' && !['D-2','D-4'].includes(f)) return ['This checklist is for qualifying student statuses. Your selected status does not itself qualify for the student part-time scheme; use the additional-activity or status-change guide for your own route.','यो सूची योग्य विद्यार्थी भिसाका लागि हो। छानिएको भिसा भएकै आधारमा विद्यार्थीको आंशिक कामको सुविधा पाइँदैन। आफ्नो आधारका लागि थप कामको अनुमति वा भिसा परिवर्तनको जानकारी हेर्नुहोस्।'];
  if (task==='employment' && !['D-7','D-8','D-9','E-1','E-2','E-3','E-4','E-5','E-6','E-7','E-8','E-9','E-10','F-2','F-4','F-6','H-2'].includes(f)) return ['The selected status is outside the published employment-information reporting list. F-5 is expressly excluded. A different work, internship or school report may still apply.','छानिएको भिसा प्रकाशित रोजगार विवरण दिने सूचीमा छैन। F-5 लाई स्पष्ट रूपमा बाहिर राखिएको छ। तर काम, इन्टर्नसिप वा संस्थाको अर्को सूचना लागू हुन सक्छ।'];
  if (task==='workplace' && ['F-5','F-6'].includes(f)) return ['Ordinary employer-sponsored workplace permission is generally not the route for this status. F-6 employment-information changes still need reporting. Check any professional licence and your exact conditions.','यो भिसामा सामान्य रोजगारदातामा आधारित कार्यस्थल अनुमति प्रक्रिया प्रायः लागू हुँदैन। F-6 मा रोजगार विवरण फेरिएको सूचना भने चाहिन्छ। पेसागत इजाजत र आफ्नै सर्त जाँच्नुहोस्।'];
  if(task==='workplace' && f==='E-8')return ['Seasonal work is managed through the participating local government. Contact its coordinator before leaving or changing an employer; do not use the EPS E-9 transfer process.','मौसमी काम स्थानीय सरकारको कार्यक्रमबाट चल्छ। रोजगारदाता छोड्न वा फेर्नुअघि कार्यक्रमको संयोजकसँग बुझ्नुहोस्। EPS को E-9 परिवर्तन प्रक्रिया प्रयोग नगर्नुहोस्।'];
  if(task==='workplace' && f==='H-2')return ['H-2 uses its own work-start / workplace-change report, normally within 15 days. Confirm the permitted sector, employment training and employer’s special employment confirmation; this is not E-9 prior workplace-change permission.','H-2 मा काम सुरु / कार्यस्थल परिवर्तनको आफ्नै सूचना हुन्छ, सामान्यतया १५ दिनभित्र। अनुमति भएको क्षेत्र, रोजगार तालिम र रोजगारदाताको विशेष रोजगार पुष्टि जाँच्नुहोस्। यो E-9 को पहिले अनुमति लिने प्रक्रिया होइन।'];
  if (task==='family' && f==='E-9') return ['E-9 is not an ordinary F-3 dependent sponsor. A relative may need a separate visitor or other independently eligible visa; confirm the consular route.','E-9 बाट सामान्य F-3 आश्रित परिवार बोलाउने सुविधा हुँदैन। नातेदारले भ्रमण वा आफ्नै योग्यतामा अर्को भिसा लिनुपर्ने हुन सक्छ। नियोगको प्रक्रिया बुझ्नुहोस्।'];
  return null;
}
