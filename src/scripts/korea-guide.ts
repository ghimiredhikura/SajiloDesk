import { getGuide, documentApplies, textFor } from '../lib/korea';
import { downloadBlob } from './shared';
const root = document.querySelector<HTMLElement>('[data-korea-guide]');
if (root) {
  const guide = getGuide(root.dataset.koreaGuide!);
  const lang = document.documentElement.lang === 'ne' ? 'ne' : 'en';
  const say = (en: string, ne: string) => lang === 'ne' ? ne : en;
  if (guide) {
    const key = `sajilo-korea-v1-${guide.slug}`;
    const selectors = [...root.querySelectorAll<HTMLSelectElement>('[data-answer]')];
    const inputs = [...root.querySelectorAll<HTMLInputElement>('[data-ready]')];
    const cards = [...root.querySelectorAll<HTMLElement>('[data-document]')];
    const status = root.querySelector<HTMLElement>('#korea-save-status')!;
    const answers = () => Object.fromEntries(selectors.map(s => [s.dataset.answer!, s.value]));
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
        status.textContent = say('Saved preparation restored from this browser.', 'यस ब्राउजरमा सेभ गरेको तयारी देखाइएको छ।');
      }
    } catch { status.textContent = say('Storage is unavailable. You can still use and download this checklist.', 'सेभ गर्ने सुविधा चलेन। सूची प्रयोग र डाउनलोड गर्न सक्नुहुन्छ।'); }
    const dirty = () => { update(); status.textContent = say('Changes are not saved yet. Use “Save on this device”.', 'परिवर्तन सेभ भएको छैन। “यही उपकरणमा सेभ गर्नुहोस्” थिच्नुहोस्।'); };
    [...selectors, ...inputs].forEach(input => input.addEventListener('change', dirty));
    root.querySelector('#korea-save')!.addEventListener('click', () => {
      try { localStorage.setItem(key, JSON.stringify({ answers: answers(), checked: inputs.filter(i => i.checked).map(i => i.dataset.ready) })); status.textContent = say('Saved in this browser. Open this guide here to continue.', 'यही ब्राउजरमा सेभ भयो। पछि यही जानकारी खोलेर तयारी जारी राख्न सक्नुहुन्छ।'); }
      catch { status.textContent = say('Could not save. Download the checklist to keep a copy.', 'सेभ हुन सकेन। प्रतिलिपि राख्न सूची डाउनलोड गर्नुहोस्।'); }
    });
    root.querySelector('#korea-reset')!.addEventListener('click', () => {
      inputs.forEach(input => { input.checked = false; }); selectors.forEach(select => { select.selectedIndex = 0; });
      try { localStorage.removeItem(key); } catch { /* Page reset still works. */ }
      update(); status.textContent = say('This checklist has been reset.', 'यो सूचीको चिनो हटाइयो।');
    });
    root.querySelector('#korea-download')!.addEventListener('click', () => {
      const values = answers();
      const lines = [`SajiloDesk · Korea · ${guide.visa === 'ALL' ? say('Registered residents', 'दर्ता भएका विदेशी') : guide.visa}`, textFor(lang, guide.title), '', textFor(lang, guide.scope), '', ...selectors.map(s => `${s.labels?.[0]?.textContent}: ${s.selectedOptions[0]?.textContent}`), '', say('Prepared / checked (not an approval assessment)', 'तयार / बुझिएको (स्वीकृतिको मूल्याङ्कन होइन)')];
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
