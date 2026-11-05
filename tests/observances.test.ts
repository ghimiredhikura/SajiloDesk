import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyObservances, holidays, worldDays } from '../src/lib/observances';
import { convertDate, epochDay, fromEpochDay, todayNepal, validateDate } from '../src/lib/dates';
const bs = (month:number,day:number) => convertDate({year:2083,month,day},'BS');

test('2083 holiday entries use valid dates and declare scoped holidays',()=>{
  for(const h of holidays) validateDate({year:2083,month:h.month,day:h.day},'BS');
  assert.match(dailyObservances(bs(5,29),'en').summary,/women employees/);
  assert.match(dailyObservances(bs(12,7),'en').summary,/hill and mountain/);
  assert.match(dailyObservances(bs(12,8),'en').summary,/Terai/);
});
test('Dashain, Tihar and the full official year use date-specific coverage',()=>{
  for(const date of [bs(6,31),bs(7,1),bs(7,6)]) assert.match(dailyObservances(date,'en').summary,/Dashain/);
  for(let day=22;day<=26;day++) assert.match(dailyObservances(bs(7,day),'en').summary,/Tihar/);
  const start=epochDay(bs(1,1)),end=epochDay(convertDate({year:2084,month:1,day:1},'BS'));
  for(let day=start;day<end;day++) assert.equal(dailyObservances(fromEpochDay(day),'en').covered,true);
  assert.equal(dailyObservances(fromEpochDay(start-1),'en').covered,false);
  assert.match(dailyObservances(fromEpochDay(end),'en').summary,/awaiting update/);
});
test('both Saturday and Sunday are weekly holidays and UN days are distinct',()=>{
  assert.match(dailyObservances({year:2026,month:11,day:14},'en').summary,/Weekly holiday.*World Diabetes Day/);
  assert.match(dailyObservances({year:2026,month:11,day:22},'en').summary,/Weekly holiday/);
  assert.equal(dailyObservances({year:2026,month:11,day:5},'en').world,'World Tsunami Awareness Day');
  assert.equal(dailyObservances({year:2026,month:11,day:5},'ne').world,'विश्व सुनामी सचेतना दिवस');
  assert.match(dailyObservances({year:2026,month:11,day:5},'en').nepal,/No nationwide holiday listed/);
});
test('Nepal midnight changes the selected day, and key days cover all months',()=>{
  assert.equal(dailyObservances(todayNepal(new Date('2026-11-04T18:14:59Z')),'en').world,undefined);
  assert.equal(dailyObservances(todayNepal(new Date('2026-11-04T18:15:00Z')),'en').world,'World Tsunami Awareness Day');
  assert.equal(new Set(Object.keys(worldDays).map(key=>key.slice(0,2))).size,12);
  for(const key of Object.keys(worldDays)) validateDate({year:2026,month:Number(key.slice(0,2)),day:Number(key.slice(3))},'AD');
});
