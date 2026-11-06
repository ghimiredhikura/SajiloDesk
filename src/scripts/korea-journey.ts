import { koreaJourney, koreaVisas } from '../lib/korea';
import { route, type Lang } from '../lib/catalog';
const picker = document.querySelector<HTMLElement>('[data-journey]');
if (picker) {
  const visa = picker.querySelector<HTMLSelectElement>('#journey-visa')!;
  const task = picker.querySelector<HTMLSelectElement>('#journey-task')!;
  const button = picker.querySelector<HTMLButtonElement>('#journey-open')!;
  const queryVisa = new URL(location.href).searchParams.get('visa');
  if (queryVisa && koreaVisas.includes(queryVisa as typeof koreaVisas[number])) visa.value = queryVisa;
  const update = () => { task.disabled = !visa.value; button.disabled = !koreaJourney(visa.value, task.value); };
  visa.addEventListener('change', update); task.addEventListener('change', update);
  picker.querySelector('form')!.addEventListener('submit', event => {
    event.preventDefault(); const slug = koreaJourney(visa.value, task.value); if (!slug) return;
    const target = new URL(route(picker.dataset.lang as Lang, `life-abroad/korea/${slug}`), location.origin);
    if (slug === 'address-change') target.searchParams.set('visa', visa.value);
    location.assign(target.href);
  });
  if (queryVisa && koreaVisas.includes(queryVisa as typeof koreaVisas[number])) for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-language]')) { const target = new URL(link.href); target.searchParams.set('visa', queryVisa); link.href = target.href; }
  update();
}
