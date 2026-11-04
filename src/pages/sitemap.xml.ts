import type { APIRoute } from 'astro';
import { tools } from '../lib/catalog';
export const GET: APIRoute = ({ site }) => {
  const paths = ['','tools/','about/','privacy/','contact/','methodology/','guides/','guides/application-prep/','guides/photo-size/','guides/nepali-dates/',...tools.map(t=>`tools/${t.id}/`)];
  const rows=['en','ne'].flatMap(lang=>paths.map(path=>{const url=new URL(`/${lang}/${path}`,site).href;return `<url><loc>${url}</loc><xhtml:link rel="alternate" hreflang="en" href="${new URL(`/en/${path}`,site).href}"/><xhtml:link rel="alternate" hreflang="ne" href="${new URL(`/ne/${path}`,site).href}"/></url>`;}));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${rows.join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});
};
