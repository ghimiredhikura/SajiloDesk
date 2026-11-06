import { tools } from '../lib/catalog';
const ne = document.documentElement.lang === 'ne';
let toastTimer: ReturnType<typeof setTimeout>;
export function toast(message: string) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
}
export async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); toast(ne ? 'कपी भयो।' : 'Copied to clipboard.'); }
  catch { toast(ne ? 'कपी गर्न सकिएन। नतिजा छानेर आफैँ कपी गर्नुहोस्।' : 'Clipboard unavailable. Select the result and copy it.'); }
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
const allowed = new Set<string>(tools.map(t => t.id));
function getFavorites(): string[] {
  try { const saved: unknown = JSON.parse(localStorage.getItem('sajilo-favorites') || '[]'); return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string' && allowed.has(id)) : []; } catch { return []; }
}
let favorites = getFavorites();
function renderFavorites() {
  document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach(button => button.setAttribute('aria-pressed', String(favorites.includes(button.dataset.favorite!))));
}
document.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.favorite!;
  if (favorites.includes(id)) favorites = favorites.filter(x => x !== id); else favorites.push(id);
  try { localStorage.setItem('sajilo-favorites', JSON.stringify(favorites)); toast(ne ? 'मनपर्ने उपकरणको सूची फेरियो।' : 'Your saved tools are updated.'); }
  catch { toast(ne ? 'सूची सेभ हुन सकेन। यो पृष्ठ खुलेसम्म मात्र रहन्छ।' : 'Storage unavailable. Saved for this page only.'); }
  renderFavorites(); filterTools();
}));
renderFavorites();
document.querySelectorAll<HTMLAnchorElement>('[data-language]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('sajilo-language', a.dataset.language!); } catch { /* language links still work */ } }));
let category = 'all';
const search = document.querySelector<HTMLInputElement>('#tool-search');
function filterTools() {
  const query = (search?.value || '').trim().toLowerCase().normalize('NFKC');
  const onlySaved = !!document.querySelector('[data-saved-only=true]');
  let count = 0;
  document.querySelectorAll<HTMLElement>('[data-tool-card]').forEach(card => {
    const match = (category === 'all' || card.dataset.category === category) && query.split(/\s+/).every(q => (card.dataset.search || '').toLowerCase().normalize('NFKC').includes(q)) && (!onlySaved || favorites.includes(card.dataset.toolId!));
    card.hidden = !match; if (match) count++;
  });
  const empty = document.querySelector<HTMLElement>('#no-tools'); if (empty) empty.hidden = count > 0;
  const countEl = document.querySelector('#search-count'); if (countEl) countEl.textContent = ne ? `${count} उपकरण भेटिए।` : `${count} tools found.`;
  const journey = document.querySelector<HTMLElement>('[data-journey-card]'); if (journey) journey.hidden = !!query || category !== 'all';
}
document.querySelectorAll<HTMLButtonElement>('[data-category-filter]').forEach(button => button.addEventListener('click', () => {
  category = button.dataset.categoryFilter!;
  document.querySelectorAll<HTMLButtonElement>('[data-category-filter]').forEach(b => { const active = b === button; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
  filterTools();
}));
search?.addEventListener('input', filterTools); filterTools();
document.addEventListener('keydown', e => { const target = e.target as HTMLElement; if (e.key === '/' && search && !['INPUT','TEXTAREA','SELECT'].includes(target.tagName) && !target.isContentEditable) { e.preventDefault(); search.focus(); } });
document.querySelector('[data-share]')?.addEventListener('click', () => copyText(`${location.origin}${location.pathname}`));
document.querySelector('[data-clear-preferences]')?.addEventListener('click', () => { try { localStorage.removeItem('sajilo-favorites'); localStorage.removeItem('sajilo-language'); for (const key of Object.keys(localStorage)) if (key.startsWith('sajilo-korea-v1-')) localStorage.removeItem(key); favorites = []; renderFavorites(); toast(ne ? 'सेभ गरेको भाषा, उपकरण र कागजातको सूची हटाइयो।' : 'Saved preferences cleared.'); } catch { toast(ne ? 'ब्राउजरमा सेभ गरिएको विवरण हटाउन सकिएन।' : 'Local storage is unavailable.'); } });
