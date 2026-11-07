import { koreaTasks, routeVisaOptions, codeSlug, usesD2Checklist } from './korea-catalog';
export const koreaGuideSlugs = [
  'd2-extension','d4-extension','e9-extension','address-change',
  ...routeVisaOptions.filter(v=>!usesD2Checklist(v.id)&&!['D-4-1','E-9'].includes(v.id)&&v.family!=='F-5').map(v=>`extend-${codeSlug(v.id)}`),
  ...routeVisaOptions.map(v=>`change-to-${codeSlug(v.id)}`),
  'f4-registration','f4-address-change','status-change-check',
  ...koreaTasks.filter(t=>!['extension','change','address','permanent'].includes(t.id)).map(t=>t.slug),
];
export const koreaThreads = koreaGuideSlugs.map(slug=>`korea-${slug}`);
export function moderationGuideTitle(slug:string):string {
  if(slug==='status-change-check')return 'Other / special-case status change';
  if(slug.startsWith('change-to-'))return `Change to ${slug.slice(10).toUpperCase()}`;
  if(slug.startsWith('extend-'))return `${slug.slice(7).toUpperCase()} extension`;
  if(slug==='d2-extension')return 'D-2 extension';
  if(slug==='d4-extension')return 'D-4-1 extension';
  if(slug==='e9-extension')return 'E-9 extension';
  if(slug==='f4-registration')return 'F-4 domestic-residence registration';
  if(slug==='f4-address-change')return 'F-4 address change';
  return koreaTasks.find(t=>t.slug===slug)?.name[0] ?? slug;
}
