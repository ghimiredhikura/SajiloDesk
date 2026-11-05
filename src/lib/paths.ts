// Astro supplies BASE_URL in built pages; the fallback also supports source-handler tests.
const runtime = globalThis as typeof globalThis & {process?:{env?:Record<string,string|undefined>}};
const configuredBase = import.meta.env?.BASE_URL ?? runtime.process?.env?.PUBLIC_BASE_PATH ?? '/';
export const basePath = `/${configuredBase.replace(/^\/+|\/+$/g,'')}${configuredBase.replace(/^\/+|\/+$/g,'')?'/':''}`;
export function withBase(path='') {return `${basePath}${path.replace(/^\/+/, '')}`;}
export function withoutBase(path:string) {
  const prefix=basePath.slice(0,-1);
  return prefix && (path===prefix || path.startsWith(`${prefix}/`)) ? path.slice(prefix.length)||'/' : path;
}
