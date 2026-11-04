import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertDate,validateDate,iso,epochDay,fromEpochDay,todayNepal,integer,nepaliDigits,ageOnDate,addMonthsClamped } from '../src/lib/dates';

const d=(year:number,month:number,day:number)=>({year,month,day});
// Independent source: Nepal Embassy Abu Dhabi holiday list, accessed 2026-11-04.
// https://ae.nepalembassy.gov.np/pages/holidays-16/
// Rows with internally inconsistent month/weekday labels are excluded, not silently corrected.
const officialPairs=[
  [d(2082,1,1),d(2025,4,14)], [d(2082,1,18),d(2025,5,1)],
  [d(2082,2,15),d(2025,5,29)], [d(2082,6,3),d(2025,9,19)],
  [d(2082,6,16),d(2025,10,2)], [d(2082,7,3),d(2025,10,20)],
  [d(2082,7,6),d(2025,10,23)], [d(2082,7,10),d(2025,10,27)],
  [d(2082,10,16),d(2026,1,30)], [d(2082,11,7),d(2026,2,19)],
];
test('independent official BS/AD fixtures in both directions',()=>{for(const [bs,ad] of officialPairs){assert.deepEqual(convertDate(bs,'BS'),ad);assert.deepEqual(convertDate(ad,'AD'),bs);}});
test('every supported day round-trips with continuous BS day transitions',()=>{
  const first=epochDay(d(1918,4,13)),last=epochDay(d(2043,4,13));
  let previous:ReturnType<typeof convertDate>|undefined;
  for(let day=first;day<=last;day++){
    const ad=fromEpochDay(day),bs=convertDate(ad,'AD');
    assert.deepEqual(convertDate(bs,'BS'),ad,`round trip at ${iso(ad)}`);
    if(previous){const prior=previous;if(bs.month===prior.month&&bs.year===prior.year)assert.equal(bs.day,prior.day+1);else{assert.equal(bs.day,1);assert.ok(prior.day>=29&&prior.day<=32);assert.throws(()=>validateDate({...prior,day:prior.day+1},'BS'));}}
    previous=bs;
  }
  assert.deepEqual(convertDate(d(1918,4,13),'AD'),d(1975,1,1));
  assert.deepEqual(previous,d(2099,12,30));
  console.log(`Exhaustive date coverage: ${last-first+1} days.`);
});
test('every BS year and month boundary remains a valid calendar month',()=>{
  for(let year=1975;year<=2099;year++)for(let month=1;month<=12;month++){
    const start=convertDate(d(year,month,1),'BS');
    const next=month===12?d(year+1,1,1):d(year,month+1,1);
    const endDay=year===2099&&month===12?epochDay(d(2043,4,13))+1:epochDay(convertDate(next,'BS'));
    const length=endDay-epochDay(start);assert.ok(length>=29&&length<=32);
    assert.doesNotThrow(()=>validateDate(d(year,month,length),'BS'));
    assert.throws(()=>validateDate(d(year,month,length+1),'BS'));
  }
});
test('calendar rejects invalid days, fractional parts and out-of-range inputs',()=>{
  for(const date of [d(2023,2,29),d(2024,2,30),d(2024,4,31),d(2024,0,1),d(2024,13,1),d(2024,1,0),d(2024.5,1,1),d(1918,4,12),d(2043,4,14)])assert.throws(()=>convertDate(date,'AD'));
  for(const date of [d(1974,12,30),d(2100,1,1),d(2082,1,32)])assert.throws(()=>convertDate(date,'BS'));
  assert.deepEqual(convertDate(d(2024,2,29),'AD'),d(2080,11,17));
  for(let year=1920;year<=2040;year+=4)assert.deepEqual(convertDate(convertDate(d(year,2,29),'AD'),'BS'),d(year,2,29));
});
test('Nepali numerals and strict integers',()=>{
  assert.equal(integer('२०८३'),2083);assert.equal(integer(' १८ '),18);assert.equal(nepaliDigits('2083-07-18'),'२०८३-०७-१८');
  for(const s of ['','-1','1.5','2e3','Infinity','१०abc'])assert.throws(()=>integer(s));
});
test('Nepal today changes at Kathmandu midnight, independent of host time zone',()=>{
  for(const tz of ['UTC','Asia/Kathmandu','America/Los_Angeles','Pacific/Auckland']){
    const old=process.env.TZ;process.env.TZ=tz;
    try{assert.deepEqual(todayNepal(new Date('2026-11-03T18:14:59Z')),d(2026,11,3));assert.deepEqual(todayNepal(new Date('2026-11-03T18:15:00Z')),d(2026,11,4));assert.deepEqual(convertDate(d(2082,1,1),'BS'),d(2025,4,14));}finally{if(old===undefined)delete process.env.TZ;else process.env.TZ=old;}
  }
});
test('completed age follows documented leap-day and shorter-month conventions',()=>{
  assert.deepEqual(ageOnDate(d(2000,2,29),d(2025,2,28)),{years:25,months:0,days:0,totalDays:9131});
  assert.deepEqual(ageOnDate(d(2023,1,31),d(2023,2,28)),{years:0,months:1,days:0,totalDays:28});
  const march=ageOnDate(d(2023,1,31),d(2023,3,30));assert.deepEqual([march.years,march.months,march.days],[0,1,30]);
  const full=ageOnDate(d(2023,1,31),d(2023,3,31));assert.deepEqual([full.years,full.months,full.days],[0,2,0]);
  assert.deepEqual(ageOnDate(d(2024,2,29),d(2024,2,29)),{years:0,months:0,days:0,totalDays:0});
  const boundary=ageOnDate(d(2000,12,31),d(2001,1,1));assert.deepEqual([boundary.years,boundary.months,boundary.days],[0,0,1]);
  assert.throws(()=>ageOnDate(d(2025,1,1),d(2024,12,31)),/future-birth/);
  assert.deepEqual(addMonthsClamped(d(2000,2,29),48),d(2004,2,29));
});
