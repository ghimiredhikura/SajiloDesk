import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { spawnSync } from 'node:child_process';
if(existsSync('.env'))loadEnvFile('.env');
const base=process.env.PUBLIC_SITE_URL;
if(!base || !/^https:\/\/[a-z0-9.-]+\/?$/i.test(base) || /localhost|example\./i.test(base))throw new Error('Set PUBLIC_SITE_URL to your actual authorized HTTPS hostname in .env before deployment.');
const npm=process.platform==='win32'?'npm.cmd':'npm';
for(const args of [['run','verify'],['exec','--','wrangler','deploy'],['exec','--','wrangler','deploy','--config','wrangler.redirect.jsonc']]){const result=spawnSync(npm,args,{stdio:'inherit',shell:process.platform==='win32',env:process.env});if(result.status!==0)process.exit(result.status||1);}
