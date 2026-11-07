import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visaOptions, getTaskChoices, getChangeTargets, koreaJourney, searchVisaOptions } from '../src/lib/korea-catalog';
import { visaEligibility, getVisaEligibility, gniReference, netAssetsReference } from '../src/lib/korea-eligibility';
import { koreaGuides } from '../src/lib/korea';
import { koreaGuideSlugs } from '../src/lib/korea-routes';

test('Nepali catalogue covers each listed visa and preserves legacy published links',()=>{
  assert.equal(new Set(visaOptions.map(v=>v.id)).size,visaOptions.length);
  assert.equal(visaEligibility.length,visaOptions.length);
  for(const record of visaEligibility){
    assert.ok(record.criteria.length>0&&record.section.length>5);
    assert.equal(record.reviewed,'2026-11-07');
    for(const pair of [...record.criteria,...record.evidence])assert.ok(pair[0].length>15&&pair[1].length>15);
  }
  for(const code of ['F-4','H-2','H-1','B-1','B-2','F-5-6','F-5-7','F-5-8','F-5-14'])assert.ok(!visaOptions.some(v=>v.id===code),code);
  for(const slug of ['change-to-f-4','extend-h-2','f4-address-change','f4-registration','extend-h-1'])assert.ok(koreaGuideSlugs.includes(slug)&&koreaGuides.some(g=>g.slug===slug));
});
test('F-5 search exposes distinct Nepal-applicable numbered and talent routes',()=>{
  const expected=[1,2,3,4,5,9,10,11,12,13,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29].map(n=>`F-5-${n}`);
  for(const code of [...expected,'F-5-S1','F-5-S2','F-5-T','F-5-T1'])assert.ok(searchVisaOptions('F5').some(v=>v.id===code),code);
  for(const code of expected){
    assert.equal(getTaskChoices(code)[0].id,'card');
    assert.equal(koreaJourney(code,'extension'),null);
    assert.equal(koreaJourney(code,'change','D-2'),null);
    assert.ok(!koreaGuideSlugs.includes(`extend-${code.toLowerCase()}`));
  }
});
test('F-5-15 doctorate, employment, livelihood and exemptions follow the separate doctoral route',()=>{
  const route=getVisaEligibility('F-5-15')!;
  assert.equal(route.income?.multiple,1);assert.equal(route.income?.assetMultiple,1);
  assert.match(route.criteria.map(c=>c[0]).join(' '),/regular doctoral programme.*Korean/);
  assert.match(route.criteria.map(c=>c[0]).join(' '),/at least one year/);
  assert.match(route.criteria.map(c=>c[0]).join(' '),/30 days/);
  assert.match(route.knowledge![0],/exempt/);assert.match(route.criminal![0],/omission/);
  const docs=koreaGuides.find(g=>g.slug==='change-to-f-5-15')!.documents;
  assert.ok(docs.some(d=>d.id==='net-assets'));assert.ok(docs.some(d=>d.id==='tax-clearance'));assert.ok(!docs.some(d=>d.id==='knowledge'||d.id==='criminal-record'));
  assert.match(docs.find(d=>d.id==='route-proof')!.obtain[0],/doctorate and transcript/);
});
test('F-5 income, asset alternatives and integration are not flattened into one rule',()=>{
  for(const code of ['F-5-1','F-5-16','F-5-26']){
    assert.equal(getVisaEligibility(code)!.income?.multiple,2);
    assert.equal(getVisaEligibility(code)!.income?.assetMultiple,1.5);
  }
  assert.equal(getVisaEligibility('F-5-10')!.income?.multiple,1);
  assert.equal(getVisaEligibility('F-5-10')!.income?.assetMultiple,undefined);
  assert.match(getVisaEligibility('F-5-10')!.knowledge![0],/KIIP level 5/);
  assert.match(getVisaEligibility('F-5-26')!.knowledge![0],/exempt/);
  assert.match(getVisaEligibility('F-5-2')!.income!.text[0],/median/);
  assert.equal(getVisaEligibility('F-5-T')!.income?.multiple,3);
  assert.match(getVisaEligibility('F-5-T')!.knowledge![0],/TOPIK level 3/);
  assert.match(getVisaEligibility('F-5-S1')!.criteria[0][0],/90\/200/);
  assert.equal(getVisaEligibility('F-5-S1')!.income,undefined);
});
test('GNI releases and asset statistics are dated separately from immigration applicability',()=>{
  assert.equal(gniReference.year,2025);
  assert.equal(gniReference.visaReference,52416000);
  assert.equal(gniReference.revisedStatistic,52570000);
  assert.equal(gniReference.revisionPublished,'2026-06-09');
  assert.equal(gniReference.visaReference*2,104832000);
  assert.equal(netAssetsReference.mean,471440000);
  assert.equal(netAssetsReference.mean*1.5,707160000);
});
test('subtype prerequisites filter known mismatches and newborn status uses its own procedure',()=>{
  const targets=(visa:string)=>getChangeTargets(visa).map(v=>v.id);
  assert.ok(targets('F-2-7').includes('F-5-16'));assert.ok(!targets('E-7-1').includes('F-5-16'));
  assert.ok(targets('F-2-T').includes('F-5-T'));assert.ok(!targets('F-2-7').includes('F-5-T'));
  assert.ok(targets('D-8-4').includes('F-5-24'));assert.ok(!targets('D-2-4').includes('F-5-24'));
  assert.ok(targets('E-9').includes('E-7-4R'));assert.ok(!targets('D-2').includes('E-7-4R'));
  assert.ok(!targets('F-2').includes('F-5-20'));
  assert.match(getVisaEligibility('F-5-20')!.criteria[1][0],/within 90 days/);
  assert.ok(getChangeTargets('G-1').every(v=>v.exception));
});

test('newborn and non-F5 income rules retain their distinct official procedures',()=>{
  const newborn=koreaGuides.find(g=>g.slug==='change-to-f-5-20')!;
  assert.equal(newborn.task,'birth');
  assert.match(newborn.documents.find(d=>d.id==='form34')!.obtain[0],/grant of status/);
  assert.equal(getVisaEligibility('E-7-T')!.income?.multiple,2);
  assert.equal(getVisaEligibility('F-2-T')!.income?.multiple,3);
  assert.match(getVisaEligibility('F-1-D')!.income!.text[0],/With spouse\/minor children/);
  assert.match(getVisaEligibility('F-1-D')!.criteria[0][0],/100,000,000/);
});
