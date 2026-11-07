import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koreaGuides, documentApplies, koreaSources, reviewed, koreaJourney } from '../src/lib/korea';
import { koreaTasks, koreaVisas, visaFamilies, searchVisaOptions, journeyCaution, getTaskChoices, getChangeTargets } from '../src/lib/korea-catalog';
import { koreaGuideSlugs, koreaThreads } from '../src/lib/korea-routes';
import { validateComment, commentsApi } from '../scripts/community-worker';
test('all published Korea documents have bilingual issuer instructions and real source mappings', () => {
  assert.equal(visaFamilies.length,32);
  assert.equal(koreaTasks.length,21);
  assert.deepEqual(new Set(koreaGuides.map(g=>g.slug)),new Set(koreaGuideSlugs));
  assert.equal(new Set(koreaGuideSlugs).size,koreaGuideSlugs.length);
  for (const guide of koreaGuides) {
    assert.equal(guide.reviewed,reviewed);
    assert.ok(['checklist','route'].includes(guide.coverage!));
    assert.ok(koreaThreads.includes(`korea-${guide.slug}`));
    assert.equal(new Set(guide.documents.map(d => d.id)).size, guide.documents.length);
    for (const document of guide.documents) {
      for (const field of [document.name, document.issuer, document.obtain]) assert.ok(field.length === 2 && field.every(s => s.trim().length > 3));
      assert.ok(document.sources.length > 0);
      for (const id of document.sources) assert.ok(new URL(koreaSources[id].url).protocol === 'https:');
    }
  }
  assert.ok(!Number.isNaN(Date.parse(reviewed)));
});
test('visa and task choices resolve only to a reviewed published procedure', () => {
  for (const [visa, expected] of [['D-2','d2-extension'],['D-4-1','d4-extension'],['E-9','e9-extension']]) {
    assert.equal(koreaJourney(visa,'extension'),expected);
    assert.equal(koreaJourney(visa,'address'),'address-change');
    for (const task of ['extension','address']) assert.ok(koreaGuides.some(g=>g.slug===koreaJourney(visa,task)));
  }
  for(const visa of koreaVisas)for(const task of koreaTasks){
    if(task.id==='change'){
      assert.equal(koreaJourney(visa,task.id),null);
      for(const target of [...koreaVisas,'other']){
        const slug=koreaJourney(visa,task.id,target);
        const offered=getTaskChoices(visa).some(t=>t.id==='change')&&(target==='other'||getChangeTargets(visa).some(t=>t.id===target));
        if(!offered)assert.equal(slug,null,`${visa} must not route to unlisted ${target}`);
        else assert.ok(koreaGuideSlugs.includes(slug!),`${visa} → ${target}`);
      }
    }else if(getTaskChoices(visa).some(t=>t.id===task.id))assert.ok(koreaGuideSlugs.includes(koreaJourney(visa,task.id)!));
    else assert.equal(koreaJourney(visa,task.id),null);
  }
  assert.equal(koreaJourney('F-5','extension'),null);
  assert.equal(koreaJourney('F-5','card'),'residence-card');
  assert.equal(koreaJourney('D-2-3','extension'),'d2-extension');
  assert.equal(koreaJourney('F-4','address'),null);
  assert.equal(koreaJourney('F-4','registration'),null);
  assert.equal(koreaJourney('D-2','workplace'),null);
  assert.equal(koreaJourney('E-9','change','invalid'),null);
  assert.equal(koreaJourney('D-2','unreviewed-status-change'),null);
  assert.equal(koreaJourney('','address'),null);
});
test('task relevance removes known mismatches and keeps conditional duties labelled',()=>{
  const tasks=(visa:string)=>getTaskChoices(visa).map(t=>t.id);
  assert.ok(tasks('E-9').includes('workplace')&&tasks('E-9').includes('employment'));
  for(const id of ['part-time','school','outside','permanent','visa','family'])assert.ok(!tasks('E-9').includes(id));
  assert.ok(tasks('D-2-3').includes('part-time'));assert.ok(!tasks('D-2-5').includes('part-time'));
  assert.ok(tasks('D-4-1').includes('part-time'));assert.ok(!tasks('D-4').includes('part-time'));
  assert.ok(!tasks('D-2').includes('employment'));assert.ok(!tasks('D-2').includes('workplace'));
  assert.equal(tasks('F-5')[0],'card');
  for(const id of ['extension','change','permanent','employment','workplace','outside','registration'])assert.ok(!tasks('F-5').includes(id));
  assert.match(getTaskChoices('F-5').find(t=>t.id==='school')!.name[0],/ages 6–18/);
  for(const id of ['registration','address','passport','card','employment','part-time'])assert.ok(!tasks('C-3').includes(id));
  assert.ok(!tasks('B-1').includes('extension'));
  assert.deepEqual(getTaskChoices('invalid'),[]);
});
test('target shortlists distinguish restrictions from special cases and never promise eligibility',()=>{
  const targets=(visa:string)=>getChangeTargets(visa).map(t=>t.id);
  assert.ok(targets('D-2-3').includes('D-10'));assert.ok(targets('D-4-1').includes('D-2'));
  assert.deepEqual(targets('E-9').filter(t=>t.startsWith('E-')),['E-7-4','E-7-4R']);
  for(const id of ['D-2','D-4-1','D-10','E-7','H-1'])assert.ok(!targets('E-9').includes(id));
  assert.ok(getChangeTargets('E-9').find(t=>t.id==='F-3')!.exception);
  assert.ok(targets('C-3').includes('F-1-D'));assert.ok(!targets('C-3').includes('E-7'));
  assert.deepEqual(targets('H-1'),[]);
  assert.ok(getChangeTargets('G-1').every(t=>t.exception));
  assert.equal(koreaJourney('E-9','change','other'),'status-change-check');
  assert.equal(koreaJourney('E-9','change','D-2'),null);
  for(const visa of koreaVisas){assert.ok(!targets(visa).includes(visa));assert.equal(new Set(targets(visa)).size,targets(visa).length);}
});
test('visa search normalises codes and includes all D-2 subtypes without unrelated visas',()=>{
  const ids=searchVisaOptions('D2').map(v=>v.id);
  assert.deepEqual(ids,['D-2',...Array.from({length:8},(_,i)=>`D-2-${i+1}`)]);
  assert.deepEqual(searchVisaOptions(' d—2 ').map(v=>v.id),ids);
  assert.ok(searchVisaOptions('स्नातकोत्तर').some(v=>v.id==='D-2-3'));
  assert.equal(searchVisaOptions('not a visa').length,0);
});
test('critical deadlines, legal penalty types and restricted transitions remain distinct',()=>{
  const address=koreaGuides.find(g=>g.slug==='address-change')!;
  const f4=koreaGuides.find(g=>g.slug==='f4-address-change')!;
  assert.match(address.alerts![0].text[0],/15 days/);
  assert.match(address.alerts![0].text[0],/criminal fine/);
  assert.match(address.alerts![0].detail![0],/legal maximum/);
  assert.match(address.alerts![0].text[0],/₩1,000,000/);
  assert.match(f4.alerts![0].text[0],/14 days/);
  assert.match(f4.alerts![0].text[0],/administrative fine/);
  assert.match(f4.alerts![0].text[0],/₩2,000,000/);
  assert.match(journeyCaution('E-9','change','D-2')![0],/restricts/);
  assert.match(journeyCaution('C-3','change','F-1-D')![0],/exception/);
  assert.match(journeyCaution('F-5','employment')![0],/excluded/);
  for(const g of koreaGuides)for(const alert of g.alerts??[])for(const id of alert.sources)assert.ok(g.sources.includes(id));
});
test('student thesis path replaces ordinary enrollment while unknown E-9 cases retain conditional evidence', () => {
  const student = koreaGuides[0], worker = koreaGuides[2];
  const regular = student.documents.filter(d => documentApplies(d, { stage: 'regular' })).map(d => d.id);
  const thesis = student.documents.filter(d => documentApplies(d, { stage: 'thesis' })).map(d => d.id);
  assert.ok(regular.includes('enrollment') && !regular.includes('advisor'));
  assert.ok(!thesis.includes('enrollment') && thesis.includes('advisor'));
  assert.equal(documentApplies({ ...worker.documents[0], excludeVisas:['F-4'] },{visa:'F-4'}),false);
  const confirmation = worker.documents.find(d => d.id === 'reemployment')!;
  assert.equal(documentApplies(confirmation, { employment: 'renewal' }), false);
  assert.equal(documentApplies(confirmation, { employment: 'reemployment' }), true);
  assert.equal(documentApplies(confirmation, { employment: 'unsure' }), true);
});
const valid = { thread: 'korea-d2-extension', name: 'पाठक', category: 'experience', message: 'आफ्नो संस्थासँग सूची बुझ्दा मलाई सजिलो भयो।', consent: true, website: '' };
test('comments accept Nepali text and reject unconsented, spam, malformed and oversized input', () => {
  assert.equal(validateComment(valid)?.name, 'पाठक');
  assert.equal(validateComment({ ...valid, name: '' })?.name, 'Visitor');
  for (const patch of [{ consent: false }, { website: 'spam.test' }, { thread: 'arbitrary' }, { category: 'published' }, { message: 'short' }, { message: 'x'.repeat(1501) }, { name: 'x'.repeat(41) }, { message: 'bad\u0000message' }, { name: 'a\nb' }]) assert.equal(validateComment({ ...valid, ...patch }), null);
});
test('comment API refuses cross-origin submission and non-JSON before touching the database', async () => {
  const env = {} as Parameters<typeof commentsApi>[1];
  const cross = await commentsApi(new Request('https://sajilodesk.com/api/comments', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: JSON.stringify(valid) }), env);
  assert.equal(cross.status, 403);
  const html = await commentsApi(new Request('https://sajilodesk.com/api/comments', { method: 'POST', headers: { Origin: 'https://sajilodesk.com', 'Content-Type': 'text/plain' }, body: 'test' }), env);
  assert.equal(html.status, 415);
  const invalid = await commentsApi(new Request('https://sajilodesk.com/api/comments?thread=anything'), env);
  assert.equal(invalid.status, 400);
  const method = await commentsApi(new Request('https://sajilodesk.com/api/comments', { method: 'PUT' }), env);
  assert.equal(method.status, 405);
});
