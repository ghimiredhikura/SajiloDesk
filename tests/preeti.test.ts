import {test} from 'node:test';
import assert from 'node:assert/strict';
import {convertPreeti,TEXT_LIMIT} from '../src/lib/preeti';
// Known spelling fixtures; these are automated checks, not a claim of human typist review.
const pairs=[['g]kfn','नेपाल'],['ls/0f','किरण'],['lgdf{0f','निर्माण'],['k|s[lt','प्रकृति'],['sfo{','कार्य'],['ljsf;','विकास'],['sf7df08"','काठमाण्डू'],['If','क्ष'],['1','ज्ञ'],['>L','श्री'],['g]kfn .','नेपाल ।'],['g]kfn\n;/sf/','नेपाल\nसरकार']];
test('common Preeti text, short-i, repha, conjuncts and punctuation',()=>{for(const [input,expected] of pairs)assert.equal(convertPreeti(input),expected,input);});
test('explicit English spans preserve mixed text, line breaks and spacing',()=>{
  assert.equal(convertPreeti('g]kfn  [[Office 2026]]\n;/sf/'),'नेपाल  Office 2026\nसरकार');
  assert.equal(convertPreeti('[[Email: hello@example.com]]\nlgdf{0f'),'Email: hello@example.com\nनिर्माण');
  assert.equal(convertPreeti('नेपाल\n[[<script>alert(1)</script>]]'),'नेपाल\n<script>alert(1)</script>');
});
test('empty input and the browser text size limit',()=>{assert.throws(()=>convertPreeti(' \n\t'),/empty-text/);assert.throws(()=>convertPreeti('a'.repeat(TEXT_LIMIT+1)),/text-limit/);assert.doesNotThrow(()=>convertPreeti('a'.repeat(TEXT_LIMIT)));});
