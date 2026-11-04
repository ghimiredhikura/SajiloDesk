import { test } from 'node:test';
import assert from 'node:assert/strict';
import { landFactors,toSqft,fromSqft,compoundToSqft,compoundFromSqft,decimal,type LandUnit } from '../src/lib/land';
const close=(actual:number,expected:number)=>assert.ok(Math.abs(actual-expected)<Math.max(1,Math.abs(expected))*1e-12,`${actual} != ${expected}`);
test('independent Nepal factors and exact international foot conversion',()=>{
  assert.equal(toSqft(1,'ropani'),5476);assert.equal(toSqft(1,'bigha'),72900);
  assert.equal(toSqft(1,'kattha'),3645);assert.equal(toSqft(1,'dhur'),182.25);
  close(fromSqft(5476,'sqm'),508.73704704);close(fromSqft(72900,'sqm'),6772.631616);
  assert.equal(compoundToSqft([1,2,0,0],'ropani'),6160.5);
  assert.equal(compoundToSqft([1,2,3],'bigha'),80736.75);
});
test('reciprocal conversions for all units, zero and varied magnitudes',()=>{
  for(const unit of Object.keys(landFactors) as LandUnit[])for(const n of [0,.0001,1,12.3456,10000])close(fromSqft(toSqft(n,unit),unit),n);
  assert.deepEqual(compoundFromSqft(0,'ropani'),[0,0,0,0]);assert.deepEqual(compoundFromSqft(0,'bigha'),[0,0,0]);
  assert.deepEqual(compoundFromSqft(5476,'ropani'),[1,0,0,0]);assert.deepEqual(compoundFromSqft(72900,'bigha'),[1,0,0]);
  assert.deepEqual(compoundFromSqft(compoundToSqft([3,15,3,3.5],'ropani'),'ropani'),[3,15,3,3.5]);
});
test('rounding the smallest unit correctly carries to larger units',()=>{assert.deepEqual(compoundFromSqft(5476-0.00001,'ropani'),[1,0,0,0]);assert.deepEqual(compoundFromSqft(72900-0.00001,'bigha'),[1,0,0]);});
test('invalid compound values, negatives, nonfinite values and very large areas are rejected',()=>{
  for(const v of [[1,16,0,0],[0,0,4,0],[0,0,0,4],[1.5,0,0,0],[1,2,3]])assert.throws(()=>compoundToSqft(v,'ropani'));
  assert.throws(()=>compoundToSqft([1,20,0],'bigha'));assert.throws(()=>compoundToSqft([1,0,20],'bigha'));
  for(const n of [-1,NaN,Infinity,1e13])assert.throws(()=>toSqft(n,'sqft'));
  for(const s of ['','1e3','-1','१२,३','abc'])assert.throws(()=>decimal(s));
  assert.equal(decimal('१२.५'),12.5);assert.equal(decimal('०'),0);
});
