import { getVisaEligibility, eligibilitySources, gniReference, won } from '../lib/korea-eligibility';
import { getGuide, documentApplies, textFor } from '../lib/korea';
import { downloadBlob } from './shared';
import { journeyCaution, routeVisaOptions, visaFamily, usesD2Checklist } from '../lib/korea-catalog';
import { route } from '../lib/catalog';
const root = document.querySelector<HTMLElement>('[data-korea-guide]');
if (root) {
  const guide = getGuide(root.dataset.koreaGuide!);
  const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
  const say = (en: string, ne: string) => lang === 'ne' ? ne : en;
  if (guide) {
    const queryVisa = new URL(location.href).searchParams.get('visa') || '';
    const fixedVisa = guide.task !== 'change' && guide.visa !== 'ALL' ? guide.visa : '';
    const studentSubtype=guide.slug==='d2-extension'&&usesD2Checklist(queryVisa)?queryVisa:'';
    const currentVisa = studentSubtype || fixedVisa || (routeVisaOptions.some(v=>v.id===queryVisa) ? queryVisa : '');
    if (guide.slug === 'address-change' && currentVisa === 'F-4') {
      location.replace(`${route(lang,'life-abroad/korea/f4-address-change')}?visa=F-4`);
    }
    if(guide.slug==='first-registration'&&currentVisa==='F-4')location.replace(`${route(lang,'life-abroad/korea/f4-registration')}?visa=F-4`);
    const selectedTask=guide.task || 'extension';
    const caution=journeyCaution(currentVisa,selectedTask,guide.task==='change'?guide.visa:'');
    const context=root.querySelector<HTMLElement>('.korea-context')!;
    if(currentVisa){
      context.hidden=false;
      context.querySelector('#korea-context-label')!.textContent=guide.task==='change'?`${currentVisa} → ${guide.visa==='ALL'?say('Other / special case','अन्य / विशेष अवस्था'):guide.visa}`:say(`Your selected status: ${currentVisa}`,`छानिएको भिसा: ${currentVisa}`);
      context.querySelector('#korea-context-caution')!.textContent=caution?textFor(lang,caution):say('Check your exact subcode against the linked official manual.','आफ्नो सही उपप्रकार जोडिएको आधिकारिक निर्देशिकासँग मिलाउनुहोस्।');
      context.dataset.caution=String(!!caution);
    }
    for(const alert of root.querySelectorAll<HTMLElement>('[data-alert-visas]')) {
      if(currentVisa && alert.dataset.alertVisas) alert.hidden=!alert.dataset.alertVisas.split(',').some(v=>v===currentVisa||v===visaFamily(currentVisa));
    }
    // A shared procedure must not restore another visa's prepared documents.
    const legacy=['d2-extension','d4-extension','e9-extension'].includes(guide.slug)&&currentVisa===guide.visa;
    const key = `sajilo-korea-v1-${guide.slug}${legacy?'':`-${currentVisa||'all'}`}`;
    const selectors = [...root.querySelectorAll<HTMLSelectElement>('[data-answer]')];
    const inputs = [...root.querySelectorAll<HTMLInputElement>('[data-ready]')];
    const cards = [...root.querySelectorAll<HTMLElement>('[data-document]')];
    const status = root.querySelector<HTMLElement>('#korea-save-status')!;
    const answers = ():Record<string,string> => ({...Object.fromEntries(selectors.map(s => [s.dataset.answer!, s.value])),visa:visaFamily(currentVisa)});
    function update() {
      const values = answers();
      for (const card of cards) { const doc = guide!.documents.find(d => d.id === card.dataset.document)!; card.hidden = !documentApplies(doc, values); }
      for (const help of root!.querySelectorAll<HTMLElement>('[data-housing]')) help.hidden = help.dataset.housing !== values.housing;
      const visible = inputs.filter(input => !input.closest<HTMLElement>('[data-document]')!.hidden);
      const count = visible.filter(input => input.checked).length;
      const progress = root!.querySelector<HTMLProgressElement>('#korea-progress')!;
      progress.value = count; progress.max = Math.max(visible.length, 1);
      root!.querySelector('#korea-progress-text')!.textContent = say(`${count} of ${visible.length} prepared / checked`, `${visible.length} मध्ये ${count} तयार / बुझिएको`);
    }
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || 'null');
      if (saved && typeof saved === 'object') {
        const record = saved as { answers?: Record<string, unknown>; checked?: unknown };
        for (const select of selectors) { const value = record.answers?.[select.dataset.answer!]; if (typeof value === 'string' && [...select.options].some(o => o.value === value)) select.value = value; }
        if (Array.isArray(record.checked)) for (const input of inputs) input.checked = record.checked.includes(input.dataset.ready);
        status.textContent = say('Saved checklist restored.', 'सेभ गरेको सूची देखाइएको छ।');
      }
    } catch { status.textContent = say('Storage unavailable. Download a copy.', 'सेभ गर्ने सुविधा चलेन। सूची डाउनलोड गर्नुहोस्।'); }
    const dirty = () => { update(); status.textContent = say('Changes are not saved.', 'परिवर्तन सेभ भएको छैन।'); };
    [...selectors, ...inputs].forEach(input => input.addEventListener('change', dirty));
    root.querySelector('#korea-save')!.addEventListener('click', () => {
      try { localStorage.setItem(key, JSON.stringify({ answers: answers(), checked: inputs.filter(i => i.checked).map(i => i.dataset.ready) })); status.textContent = say('Saved in this browser.', 'यही ब्राउजरमा सेभ भयो।'); }
      catch { status.textContent = say('Could not save. Download a copy.', 'सेभ हुन सकेन। सूची डाउनलोड गर्नुहोस्।'); }
    });
    root.querySelector('#korea-reset')!.addEventListener('click', () => {
      inputs.forEach(input => { input.checked = false; }); selectors.forEach(select => { select.selectedIndex = 0; });
      try { localStorage.removeItem(key); } catch { /* Page reset still works. */ }
      update(); status.textContent = say('Checklist reset.', 'सूचीको चिनो हटाइयो।');
    });
    root.querySelector('#korea-download')!.addEventListener('click', () => {
      const values = answers();
      const lines = [`SajiloDesk · Korea · ${currentVisa || guide.visa}`, textFor(lang, guide.title), '', textFor(lang, guide.scope), ...(caution?[textFor(lang,caution)]:[]), '', ...selectors.map(s => `${s.labels?.[0]?.textContent}: ${s.selectedOptions[0]?.textContent}`), '', say('Prepared / checked (not an approval assessment)', 'तयार / बुझिएको (स्वीकृतिको मूल्याङ्कन होइन)')];
      const eligibility=getVisaEligibility(guide.visa);
      if(eligibility){
        lines.push('',say('Eligibility & criteria','योग्यता र सर्त'),...eligibility.criteria.map(c=>textFor(lang,c)));
        if(eligibility.income)lines.push(textFor(lang,eligibility.income.text));
        if(eligibility.income?.multiple)lines.push(`${eligibility.income.multiple}× GNI: ${won(gniReference.visaReference*eligibility.income.multiple)} (published 2026 visa reference); BOK revised 2025 GNI to ${won(gniReference.revisedStatistic)} on 2026-06-09. Confirm the filing-effective figure with 1345.`,eligibilitySources.gniMarch.url,eligibilitySources.gniJune.url,eligibilitySources.visa2026.url);
        if(eligibility.knowledge)lines.push(textFor(lang,eligibility.knowledge));
        if(eligibility.criminal)lines.push(textFor(lang,eligibility.criminal));
        lines.push(...eligibility.evidence.map(e=>textFor(lang,e)),`Last checked: ${eligibility.reviewed}; HiKorea: ${eligibility.section}`,eligibilitySources.manual.url);
      }
      for(const alert of root!.querySelectorAll<HTMLElement>('.korea-deadline'))if(!alert.hidden)lines.push(alert.textContent?.trim()||'',...[...alert.querySelectorAll<HTMLAnchorElement>('a')].map(a=>a.href));
      for (const doc of guide.documents.filter(d => documentApplies(d, values))) {
        const checked = inputs.find(i => i.dataset.ready === doc.id)?.checked;
        lines.push(`\n[${checked ? 'x' : ' '}] ${doc.korean} — ${textFor(lang, doc.name)} (${doc.requirement})`, textFor(lang, doc.obtain));
        if (doc.detail) lines.push(textFor(lang, doc.detail));
        if (doc.id === 'address') lines.push(root!.querySelector<HTMLElement>(`[data-housing="${values.housing}"]`)?.textContent || '');
        for (const link of root!.querySelectorAll<HTMLAnchorElement>(`[data-document="${doc.id}"] .document-source-links a`)) lines.push(link.href);
      }
      if (guide.steps) lines.push('', ...guide.steps.map(step => textFor(lang, step)));
      else lines.push('', say('Check current fees, accepted formats and any additional evidence with immigration and your school/employer. Apply before your stay expires. A visit reservation is not an application.', 'हालको शुल्क, कागजातको ढाँचा र थप प्रमाण अध्यागमन र संस्था/रोजगारदातासँग बुझ्नुहोस्। बसाइको म्यादभित्र आवेदन दिनुहोस्। समय बुक गर्दैमा आवेदन दिएको मानिँदैन।'), `Sources checked: ${root!.dataset.reviewed}`, location.href.split('#')[0]);
      if (guide.steps) lines.push(`Sources checked: ${root!.dataset.reviewed}`, location.href.split('#')[0]);
      downloadBlob(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }), `sajilodesk-korea-${guide.slug}.txt`);
    });
    const reviewAge = (Date.now() - Date.parse(`${root.dataset.reviewed}T00:00:00Z`)) / 86400000;
    if (reviewAge > 90) root.querySelector<HTMLElement>('.korea-stale')!.hidden = false;
    update();
  }
}
