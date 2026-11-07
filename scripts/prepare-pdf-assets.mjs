import { cp,mkdir,copyFile } from 'node:fs/promises';
// Keep renderer resources on our own origin, including CMaps for Asian PDFs.
const destination='public/vendor/pdfjs';
await mkdir(destination,{recursive:true});
for(const folder of ['cmaps','standard_fonts','wasm','iccs'])await cp(`node_modules/pdfjs-dist/${folder}`,`${destination}/${folder}`,{recursive:true});
await copyFile('node_modules/pdfjs-dist/LICENSE',`${destination}/LICENSE`);
console.log('Local PDF renderer fonts, CMaps and image decoders prepared.');
