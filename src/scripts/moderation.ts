import { koreaGuideSlugs, moderationGuideTitle } from '../lib/korea-routes';
interface ReviewComment { id: number; thread: string; name: string; category: string; message: string; createdAt: string; status: string }
interface ReviewPage { comments: ReviewComment[]; counts: { pending: number; published: number }; nextBefore: number | null; reviewer: string }
const list = document.querySelector<HTMLElement>('#review-list')!;
const statusText = document.querySelector<HTMLElement>('#review-status')!;
const thread = document.querySelector<HTMLSelectElement>('#review-thread')!;
const category = document.querySelector<HTMLSelectElement>('#review-category')!;
const refresh = document.querySelector<HTMLButtonElement>('#review-refresh')!;
const more = document.querySelector<HTMLButtonElement>('#review-more')!;
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-review-tab]')];
const dialog = document.querySelector<HTMLDialogElement>('#review-delete-dialog')!;
const confirmDelete = document.querySelector<HTMLButtonElement>('#review-confirm-delete')!;
const cancelDelete = document.querySelector<HTMLButtonElement>('#review-cancel-delete')!;
const guides:Record<string,[string,string]>=Object.fromEntries(koreaGuideSlugs.map(slug=>[`korea-${slug}`,[moderationGuideTitle(slug),slug]]));
const types: Record<string, string> = { experience: 'Experience', correction: 'Correction', request: 'Suggestion' };
let selected = 'pending', nextBefore: number | null = null, busy = false, expired = false;
let deleting: ReviewComment | null = null, deleteTrigger: HTMLButtonElement | null = null;
function message(text: string, error = false) { statusText.textContent = text; statusText.parentElement!.dataset.error = String(error); }
function lock(value: boolean) {
  busy = value; list.setAttribute('aria-busy', String(value));
  for (const control of document.querySelectorAll<HTMLButtonElement | HTMLSelectElement>('main button, main select')) control.disabled = value || expired;
}
async function api(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, cache: 'no-store', credentials: 'same-origin', redirect: 'manual' });
  if (response.type === 'opaqueredirect' || response.status === 401 || (response.status === 403 && !response.headers.get('Content-Type')?.includes('application/json'))) {
    expired = true; document.querySelector<HTMLElement>('#review-sign-in')!.hidden = false;
    throw new Error('Your sign-in expired. Sign in again to continue.');
  }
  const data = await response.json();
  if (response.status === 403 && data.error === 'sign_in_required') {
    expired = true; document.querySelector<HTMLElement>('#review-sign-in')!.hidden = false;
    throw new Error('Your sign-in expired. Sign in again to continue.');
  }
  if (!response.ok) throw new Error(data.error === 'comment_changed' ? 'This comment changed or was removed. Refresh to see the latest list.' : 'Could not complete the request. Please try again.');
  return data;
}
function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = '', className = '') { const node = document.createElement(tag); node.textContent = text; node.className = className; return node; }
function card(comment: ReviewComment) {
  const article = element('article', '', 'review-card'); article.dataset.commentId = String(comment.id);
  const top = element('div', '', 'review-card-top'), author = element('div');
  const heading = element('h2', comment.name); author.append(heading);
  const meta = element('div', '', 'review-meta');
  const date = element('time'); date.dateTime = comment.createdAt;
  date.textContent = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(comment.createdAt));
  meta.append(element('span', types[comment.category] || comment.category, 'review-category'), element('span', `#${comment.id}`), date); author.append(meta); top.append(author);
  const guide = guides[comment.thread];
  if (guide) { const link = element('a', guide[0], 'review-guide'); link.href = `/en/life-abroad/korea/${guide[1]}/#experiences`; link.target = '_blank'; link.rel = 'noopener noreferrer'; top.append(link); }
  article.append(top, element('p', comment.message, 'review-message'));
  const actions = element('div', '', 'review-actions');
  if (comment.status === 'pending') {
    const publish = element('button', 'Publish', 'review-primary'); publish.type = 'button'; publish.setAttribute('aria-label', `Publish comment ${comment.id}`);
    publish.addEventListener('click', () => { void act(comment, 'publish'); }); actions.append(publish);
  }
  const remove = element('button', 'Delete', 'review-danger'); remove.type = 'button'; remove.setAttribute('aria-label', `Delete comment ${comment.id}`);
  remove.addEventListener('click', () => {
    deleting = comment; deleteTrigger = remove;
    document.querySelector('#review-delete-title')!.textContent = `Delete comment #${comment.id}?`;
    dialog.showModal(); cancelDelete.focus();
  }); actions.append(remove); article.append(actions); return article;
}
async function load(append = false, notice = '') {
  lock(true); if (!notice) message('Loading comments…');
  if (!append) { list.replaceChildren(); more.hidden = true; }
  try {
    const query = new URLSearchParams({ status: selected, thread: thread.value, category: category.value });
    if (append && nextBefore) query.set('before', String(nextBefore));
    const data: ReviewPage = await api(`/admin/api/comments?${query}`);
    for (const comment of data.comments) list.append(card(comment));
    if (!list.childElementCount) list.append(element('p', selected === 'pending' ? 'All caught up. No pending comments for this selection.' : 'No published comments for this selection.', 'review-empty'));
    document.querySelector('#review-pending-count')!.textContent = String(data.counts.pending);
    document.querySelector('#review-published-count')!.textContent = String(data.counts.published);
    document.querySelector('#review-account')!.textContent = `Signed in as ${data.reviewer}`;
    nextBefore = data.nextBefore; more.hidden = nextBefore === null;
    const count = list.querySelectorAll('article').length;
    message(notice || `${count} ${selected} comment${count === 1 ? '' : 's'} shown.`);
  } catch (error) { message(`${notice ? `${notice} ` : ''}${error instanceof Error ? error.message : 'Could not load comments. Please try again.'}`, true); }
  finally { lock(false); }
}
async function act(comment: ReviewComment, action: 'publish' | 'delete') {
  if (busy || expired) return;
  lock(true); message(action === 'publish' ? 'Publishing…' : 'Deleting…');
  try {
    await api(`/admin/api/comments/${comment.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-SajiloDesk-Moderation': '1' }, body: JSON.stringify({ action }) });
    await load(false, action === 'publish' ? `Comment #${comment.id} published. It is now visible on the guide.` : `Comment #${comment.id} deleted.`);
  } catch (error) { message(error instanceof Error ? error.message : 'Please try again.', true); }
  finally { lock(false); }
}
for (const tab of tabs) tab.addEventListener('click', () => {
  if (busy || tab.dataset.reviewTab === selected) return;
  selected = tab.dataset.reviewTab!; for (const button of tabs) button.setAttribute('aria-pressed', String(button === tab));
  void load();
});
thread.addEventListener('change', () => { void load(); }); category.addEventListener('change', () => { void load(); });
refresh.addEventListener('click', () => { void load(); }); more.addEventListener('click', () => { void load(true); });
cancelDelete.addEventListener('click', () => dialog.close());
confirmDelete.addEventListener('click', () => { const comment = deleting; dialog.close(); if (comment) void act(comment, 'delete'); });
dialog.addEventListener('close', () => { deleting = null; deleteTrigger?.focus(); });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
void load();
