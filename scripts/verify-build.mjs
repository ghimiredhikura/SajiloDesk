import { readdir,readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
async function walk(dir){const entries=await readdir(dir,{withFileTypes:true});return(await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const files=await walk('dist'),htmlFiles=files.filter(f=>f.endsWith('.html'));
const all=new Set(files.map(f=>f.replaceAll('\\','/')));const documents=new Map();let linkCount=0,fieldCount=0;
const headers=await readFile('dist/_headers','utf8');
const basePath=`/${(process.env.PUBLIC_BASE_PATH||'/').replace(/^\/+|\/+$/g,'')}`.replace(/\/$/,'');
function resolveLocal(url){let clean=decodeURIComponent(url.pathname);assert.ok(!basePath||clean===basePath||clean.startsWith(`${basePath}/`),`Local URL escaped the project base: ${clean}`);clean=clean.slice(basePath.length)||'/';return `dist${clean.endsWith('/')?`${clean}index.html`:clean}`;}
for(const file of htmlFiles){
 const html=await readFile(file,'utf8');const {document}=parseHTML(html);const normalized=file.replaceAll('\\','/');documents.set(normalized,document);
 assert.equal(document.querySelectorAll('h1').length,1,`${file}: one H1`);
 assert.ok(['en','ne'].includes(document.documentElement.lang),`${file}: document language`);
 assert.ok(document.querySelector('title')?.textContent.trim(),`${file}: title`);
 assert.ok(document.querySelector('meta[name=description]')?.getAttribute('content'),`${file}: description`);
 assert.ok(document.querySelector('link[rel=canonical]')?.getAttribute('href'),`${file}: canonical`);
 assert.ok(document.querySelector('meta[name=viewport]'),`${file}: responsive viewport`);
 const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length,`${file}: duplicate IDs`);
 for(const control of document.querySelectorAll('input,select,textarea')){fieldCount++;assert.ok(control.getAttribute('aria-label')||control.closest('label')||(control.id&&document.querySelector(`label[for="${control.id}"]`)),`${file}: missing label for ${control.id}`);}
 for(const button of document.querySelectorAll('button'))assert.ok(button.textContent.trim()||button.getAttribute('aria-label'),`${file}: unnamed button`);
 const base=new URL(document.querySelector('link[rel=canonical]').getAttribute('href'));
 for(const element of document.querySelectorAll('a[href],link[href],script[src],img[src]')){
  const raw=element.getAttribute('href')||element.getAttribute('src');if(!raw||/^(mailto:|data:|blob:)/.test(raw))continue;
  const url=new URL(raw,base);if(url.origin!==base.origin)continue;
  const target=resolveLocal(url);assert.ok(all.has(target),`${file}: broken local reference ${raw} → ${target}`);linkCount++;
  if(url.hash&&target===normalized)assert.ok(document.getElementById(url.hash.slice(1)),`${file}: missing fragment ${raw}`);
 }
 for(const script of document.querySelectorAll('script:not([src])'))if(script.textContent.trim()){const hash=createHash('sha256').update(script.textContent).digest('base64');assert.ok(headers.includes(`'sha256-${hash}'`),`${file}: CSP blocks inline script`);}
 if(/dist\/(en|ne)\//.test(normalized))for(const lang of ['en','ne']){const alternate=document.querySelector(`link[hreflang="${lang}"]`);assert.ok(alternate,`${file}: hreflang ${lang}`);const expected=normalized.replace(/dist\/(en|ne)\//,`dist/${lang}/`);assert.equal(resolveLocal(new URL(alternate.getAttribute('href'))),expected);}
}
const sitemap=await readFile('dist/sitemap.xml','utf8');
for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g))assert.ok(all.has(resolveLocal(new URL(match[1]))),`Sitemap has missing URL ${match[1]}`);
assert.ok(!sitemap.includes('/saved/'),'Saved tools are not search pages');assert.ok(all.has('dist/404.html'),'Real 404 page missing');
assert.ok(!files.some(f=>/(_worker\.js|server\.|\.env|research\.md)/.test(f)),'No server/secret/research artifact in public output');
const robots=await readFile('dist/robots.txt','utf8');const isIndexable=!robots.includes('Disallow: /\n');
const expectedOrigin=process.env.PUBLIC_SITE_URL?new URL(process.env.PUBLIC_SITE_URL).origin:null;
for(const [file,document] of documents){
 const canonical=new URL(document.querySelector('link[rel=canonical]').getAttribute('href'));
 const meta=document.querySelector('meta[name=robots]').getAttribute('content');
 if(expectedOrigin)assert.equal(canonical.origin,expectedOrigin,`${file}: canonical must use the configured site origin`);
 if(isIndexable){
  assert.ok(canonical.protocol==='https:'&&!canonical.hostname.includes('localhost'),`Indexable build must have an HTTPS production hostname: ${file}`);
  const excluded=file==='dist/404.html'||/\/saved\/index\.html$/.test(file);
  assert.equal(meta.split(',').includes('noindex'),excluded,`${file}: public pages must be indexable; saved/404 pages must not be`);
 }else assert.ok(meta.includes('noindex'),`${file}: preview must be noindex`);
}
if(expectedOrigin)for(const match of sitemap.matchAll(/<loc>(.*?)<\/loc>/g))assert.equal(new URL(match[1]).origin,expectedOrigin,'Sitemap must use the configured site origin');
assert.ok(files.length<20000,'Cloudflare free asset count exceeded');for(const file of files)assert.ok((await stat(file)).size<=25*1024*1024,`Asset too large: ${file}`);
const scripts=files.filter(f=>f.endsWith('.js'));const scriptSize=(await Promise.all(scripts.map(async f=>({file:path.basename(f),bytes:(await stat(f)).size,gzip:gzipSync(await readFile(f)).length}))));
const report={htmlPages:htmlFiles.length,checkedLocalReferences:linkCount,labeledFormControls:fieldCount,staticAssets:files.length,indexable:isIndexable,scripts:scriptSize};
console.log(JSON.stringify(report,null,2));
console.log('Static routes, links, labels, language alternates, CSP, preview indexing and asset limits passed.');
