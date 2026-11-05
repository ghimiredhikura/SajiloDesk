import test from 'node:test';
import assert from 'node:assert/strict';
import { nepalKeyDays } from '../src/lib/nepal-key-days';
import { dailyObservances } from '../src/lib/observances';
import { convertDate,validateDate } from '../src/lib/dates';
const bs=(year:number,month:number,day:number)=>convertDate({year,month,day},'BS');

test('the sourced Nepal key-day map covers all twelve BS months with valid dates',()=>{
  assert.equal(new Set(nepalKeyDays.filter(day=>day.calendar==='BS').map(day=>day.month)).size,12);
  for(const day of nepalKeyDays){
    validateDate({year:day.year||(day.calendar==='BS'?2083:2026),month:day.month,day:day.day},day.calendar);
    assert.match(new URL(day.source).hostname,/gov\.np$/);
    assert.ok(day.name[0]&&day.name[1]);
  }
});
test('birth anniversaries are bilingual observances and do not create holidays',()=>{
  const date=bs(2083,3,29),en=dailyObservances(date,'en'),ne=dailyObservances(date,'ne');
  assert.equal(en.nepalDays[0].name,'Bhanu Bhakta Acharya Jayanti');
  assert.equal(ne.nepalDays[0].name,'भानुभक्त आचार्य जयन्ती');
  assert.equal(en.holidayStatus,'none');
  assert.match(dailyObservances(bs(2083,10,24),'en').nepalDays[0].name,/Balkrishna Sama/);
});
test('Nepal and world observances coexist independently of weekly holiday status',()=>{
  const result=dailyObservances(bs(2083,4,24),'en');
  assert.equal(result.nepalDays[0].name,'Soil Conservation Day');
  assert.match(result.world!,/Indigenous Peoples/);
  assert.equal(result.holidayStatus,'weekly');
});
test('Gregorian key days follow AD, while lunar dates do not repeat in another year',()=>{
  for(const year of [2026,2027])assert.ok(dailyObservances({year,month:5,day:2},'en').nepalDays.some(day=>day.name==='National ICT Day'));
  assert.ok(dailyObservances(bs(2083,1,18),'en').nepalDays.some(day=>day.name==='Buddha Jayanti'));
  assert.ok(!dailyObservances(bs(2084,1,18),'en').nepalDays.some(day=>day.name==='Buddha Jayanti'));
  assert.deepEqual(dailyObservances(bs(2082,3,29),'en').nepalDays,[]);
});
