import type { APIRoute } from 'astro';
import { withBase } from '../lib/paths';
export const GET: APIRoute = ({ site }) => new Response(import.meta.env.PUBLIC_INDEXABLE==='true'?`User-agent: *\nAllow: ${withBase()}\nDisallow: ${withBase('en/saved/')}\nDisallow: ${withBase('ne/saved/')}\nSitemap: ${new URL(withBase('sitemap.xml'),site).href}\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
