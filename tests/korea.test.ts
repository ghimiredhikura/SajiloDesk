import { test } from 'node:test';
import assert from 'node:assert/strict';
import { koreaGuides, documentApplies, koreaSources, reviewed, koreaJourney } from '../src/lib/korea';
import { validateComment, commentsApi } from '../scripts/community-worker';
test('all published Korea documents have bilingual issuer instructions and real source mappings', () => {
  assert.equal(koreaGuides.length, 4);
  for (const guide of koreaGuides) {
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
  assert.equal(koreaJourney('D-10','extension'),null);
  assert.equal(koreaJourney('D-2','unreviewed-status-change'),null);
  assert.equal(koreaJourney('','address'),null);
});
test('student thesis path replaces ordinary enrollment while unknown E-9 cases retain conditional evidence', () => {
  const student = koreaGuides[0], worker = koreaGuides[2];
  const regular = student.documents.filter(d => documentApplies(d, { stage: 'regular' })).map(d => d.id);
  const thesis = student.documents.filter(d => documentApplies(d, { stage: 'thesis' })).map(d => d.id);
  assert.ok(regular.includes('enrollment') && !regular.includes('advisor'));
  assert.ok(!thesis.includes('enrollment') && thesis.includes('advisor'));
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
