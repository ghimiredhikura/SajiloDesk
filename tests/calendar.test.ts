import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarMonth,monthInRange } from '../src/lib/calendar';
import { iso } from '../src/lib/dates';

test('BS and AD grids identify the same independently checked current date',()=>{
  const bs=calendarMonth(2083,7,'BS'),ad=calendarMonth(2026,11,'AD');
  assert.equal(iso(bs.days[18].ad!),'2026-11-05');
  assert.equal(iso(ad.days[4].bs!),'2083-07-19');
  assert.equal(bs.days[18].weekday,4);
  assert.equal(ad.days[4].weekday,4);
  assert.equal(bs.cells[0]?.day,1);
  assert.equal(bs.cells.length%7,0);
});
test('Gregorian leap months and year navigation retain their real boundaries',()=>{
  assert.equal(calendarMonth(2028,2,'AD').days.length,29);
  assert.equal(calendarMonth(2027,2,'AD').days.length,28);
  assert.deepEqual(calendarMonth(2026,12,'AD').next,{year:2027,month:1});
  assert.deepEqual(calendarMonth(2083,1,'BS').previous,{year:2082,month:12});
});
test('partial Gregorian boundary months disable unsupported days',()=>{
  const first=calendarMonth(1918,4,'AD'),last=calendarMonth(2043,4,'AD');
  assert.ok(first.days.slice(0,12).every(day=>!day.available));
  assert.equal(iso(first.days[12].bs!),'1975-01-01');
  assert.equal(first.hasPrevious,false);
  assert.equal(last.days[12].available,true);
  assert.ok(last.days.slice(13).every(day=>!day.available));
  assert.equal(last.hasNext,false);
  assert.equal(calendarMonth(1975,1,'BS').hasPrevious,false);
  assert.equal(calendarMonth(2099,12,'BS').hasNext,false);
});
test('unsupported, fractional and invalid month/year selections are rejected',()=>{
  for(const [year,month] of [[2083,0],[2083,13],[2083.5,1],[1974,12],[2100,1]])assert.throws(()=>calendarMonth(year,month,'BS'),/range/);
  assert.equal(monthInRange(1918,3,'AD'),false);
  assert.equal(monthInRange(2043,5,'AD'),false);
});
