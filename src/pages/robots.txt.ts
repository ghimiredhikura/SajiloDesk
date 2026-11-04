import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(import.meta.env.PUBLIC_INDEXABLE==='true'?`User-agent: *\nAllow: /\nDisallow: /en/saved/\nDisallow: /ne/saved/\nSitemap: ${new URL('/sitemap.xml',site).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
