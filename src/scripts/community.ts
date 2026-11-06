const section = document.querySelector<HTMLElement>('[data-comments]');
if (section) {
  const ne = document.documentElement.lang === 'ne';
  const say = (en: string, np: string) => ne ? np : en;
  const thread = section.dataset.thread!;
  const list = section.querySelector('#community-list')!;
  const loadStatus = section.querySelector<HTMLElement>('#community-load-status')!;
  const more = section.querySelector<HTMLButtonElement>('#community-more')!;
  const retry = section.querySelector<HTMLButtonElement>('#community-retry')!;
  let cursor: number | null = null, loading = false;
  const categories: Record<string, string> = { experience: say('Experience', 'अनुभव'), correction: say('Document / correction', 'कागजात / सुधार'), request: say('Guide request', 'जानकारीको अनुरोध') };
  async function load(append = false) {
    if (loading) return;
    loading = true; more.disabled = true; retry.hidden = true;
    loadStatus.textContent = say('Loading published comments…', 'प्रकाशित टिप्पणी लोड हुँदैछन्…');
    try {
      const response = await fetch(`/api/comments?thread=${encodeURIComponent(thread)}${append && cursor ? `&before=${cursor}` : ''}`, { credentials: 'omit' });
      if (!response.ok) throw new Error('load');
      const data = await response.json() as { comments: { id: number; name: string; message: string; category: string; createdAt: string }[]; nextBefore: number | null };
      if (!Array.isArray(data.comments)) throw new Error('format');
      if (!append) list.replaceChildren();
      for (const comment of data.comments) {
        const article = document.createElement('article'); article.className = 'community-comment';
        const header = document.createElement('div'); header.className = 'community-comment-head';
        const name = document.createElement('strong'); name.textContent = comment.name;
        const meta = document.createElement('span'); meta.textContent = `${categories[comment.category] || categories.experience} · ${new Intl.DateTimeFormat(ne ? 'ne-NP' : 'en-GB', { dateStyle: 'medium' }).format(new Date(comment.createdAt))} · #${comment.id}`;
        const message = document.createElement('p'); message.textContent = comment.message;
        header.append(name, meta); article.append(header, message); list.append(article);
      }
      cursor = data.nextBefore; more.hidden = !cursor;
      loadStatus.textContent = list.childElementCount ? say('Reader experiences · not official instructions.', 'पाठकका अनुभव · आधिकारिक निर्देशन होइनन्।') : say('No published comments yet. You can be the first to share.', 'अहिलेसम्म टिप्पणी प्रकाशित भएका छैनन्। तपाईंले सुरुवात गर्न सक्नुहुन्छ।');
    } catch {
      loadStatus.textContent = say('Comments could not be loaded. Try again in a moment.', 'टिप्पणी लोड भएनन्। केही बेरपछि फेरि प्रयास गर्नुहोस्।'); retry.hidden = false;
    } finally { loading = false; more.disabled = false; }
  }
  more.addEventListener('click', () => { void load(true); }); retry.addEventListener('click', () => { void load(); });
  const form = section.querySelector<HTMLFormElement>('#community-form')!;
  section.querySelector<HTMLButtonElement>('#community-submit')!.disabled = false;
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!form.reportValidity()) return;
    const button = section.querySelector<HTMLButtonElement>('#community-submit')!;
    if (button.disabled) return;
    const status = section.querySelector<HTMLElement>('#community-submit-status')!;
    const fields = new FormData(form); button.disabled = true;
    status.textContent = say('Submitting for review…', 'समीक्षाका लागि पठाउँदै…');
    try {
      const response = await fetch('/api/comments', { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ thread, name: fields.get('name'), category: fields.get('category'), message: fields.get('message'), website: fields.get('website'), consent: true }) });
      if (!response.ok) { if (response.status === 429) throw new Error('limit'); if (response.status === 400 || response.status === 413) throw new Error('invalid'); throw new Error('unavailable'); }
      const result = await response.json() as { id: number };
      status.textContent = say(`Submitted for review (#${result.id}). It will appear after approval. Please do not submit it again.`, `समीक्षाका लागि पठाइयो (#${result.id})। स्वीकृत भएपछि देखिनेछ। फेरि उही टिप्पणी नपठाउनुहोस्।`);
      form.reset();
    } catch (error) {
      const reason = error instanceof Error ? error.message : '';
      status.textContent = reason === 'limit' ? say('The daily submission limit has been reached for this connection. Please try tomorrow.', 'यस इन्टरनेट जडानबाट आज पठाउन मिल्ने सीमा पुग्यो। भोलि प्रयास गर्नुहोस्।') : reason === 'invalid' ? say('Check your comment length and the selected category, then try again.', 'टिप्पणीको लम्बाइ र छानिएको विषय जाँचेर फेरि पठाउनुहोस्।') : say('Could not confirm submission. Your text is still here. Try again later; if you already received a receipt, do not resubmit.', 'पठाइएको पुष्टि भएन। तपाईंको लेखाइ यहीँ छ। केही बेरपछि प्रयास गर्नुहोस्। पहिले नै रसिद नम्बर पाएको भए फेरि नपठाउनुहोस्।');
    } finally { button.disabled = false; }
  });
  void load();
}
