import {spawnSync} from 'node:child_process';
for(const lang of ['en','ne'])for(const id of ['home','saved','date-converter','age-calculator','preeti-unicode','land-converter','photo-resizer']){
 const run=spawnSync(process.execPath,['--import','tsx','tests/entry-runner.mjs',lang,id],{encoding:'utf8',timeout:20000});
 process.stdout.write(run.stdout||'');if(run.status!==0){process.stderr.write(run.stderr||String(run.error));process.exit(run.status||1);}
}
console.log('14 DOM event integration scenarios passed. Real browser rendering, clipboard permissions, EXIF and mobile memory are separate launch checks.');
