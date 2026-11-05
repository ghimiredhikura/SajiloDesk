// Original illustration for the photo tool; no external image or licence required.
import { createCanvas } from '@napi-rs/canvas';
import { mkdir, writeFile } from 'node:fs/promises';
const canvas = createCanvas(1280,800), ctx = canvas.getContext('2d');
const sky = ctx.createLinearGradient(0,0,0,800);
sky.addColorStop(0,'#f8ddc3'); sky.addColorStop(.65,'#fff1d8'); sky.addColorStop(1,'#e8e8db');
ctx.fillStyle=sky; ctx.fillRect(0,0,1280,800);
ctx.fillStyle='#ec8c57'; ctx.beginPath(); ctx.arc(990,210,83,0,Math.PI*2); ctx.fill();
function polygon(points,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(...points[0]);for(const point of points.slice(1))ctx.lineTo(...point);ctx.closePath();ctx.fill();}
polygon([[0,570],[230,220],[410,455],[680,140],[1020,570],[1280,360],[1280,800],[0,800]],'#a9bdbe');
polygon([[154,335],[230,220],[320,339],[264,312],[232,330],[205,300]],'#fffaf0');
polygon([[535,320],[680,140],[855,360],[739,301],[682,325],[636,264],[593,320]],'#fffaf0');
polygon([[0,650],[300,460],[540,590],[820,400],[1100,610],[1280,515],[1280,800],[0,800]],'#5e8e85');
polygon([[0,730],[280,625],[570,720],[960,540],[1280,670],[1280,800],[0,800]],'#315b5e');
polygon([[650,800],[795,665],[900,635],[820,700],[790,800]],'#d9c4a1');
ctx.fillStyle='#fff9ee';ctx.font='bold 32px sans-serif';ctx.fillText('SAJILO DESK',54,711);
ctx.font='18px sans-serif';ctx.fillText('Example image · 1280 × 800 px',55,747);
await mkdir('public/examples',{recursive:true});
await writeFile('public/examples/mountain-sample.jpg',canvas.toBuffer('image/jpeg',92));
console.log('Generated public/examples/mountain-sample.jpg (1280 × 800).');
