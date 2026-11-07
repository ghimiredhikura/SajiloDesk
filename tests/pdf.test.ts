import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument,degrees } from 'pdf-lib';
import { pageSelection,openPdf,copyPdfPages,examplePdfs,pdfLimits } from '../src/lib/pdf';
test('PDF page ranges accept Nepali digits, preserve requested order and reject invalid pages',()=>{
  assert.deepEqual(pageSelection('३, १–२, ३',4),[2,0,1]);
  assert.deepEqual(pageSelection('1, 3-5',5),[0,2,3,4]);
  for(const value of ['',',','0','1,','-1','2-1','1.5','6','1-99999999999','1 OR 2'])assert.throws(()=>pageSelection(value,5),/pages/);
});
test('PDF extraction and merging copy the right pages, order, dimensions and rotation',async()=>{
  const [first,second]=await Promise.all((await examplePdfs()).map(openPdf));
  first.document.getPage(2).setSize(320,480);first.document.getPage(2).setRotation(degrees(90));
  const bytes=await copyPdfPages([{source:first,indices:[2,0]},{source:second,indices:[1]}]);
  const result=await PDFDocument.load(bytes);
  assert.equal(result.getPageCount(),3);assert.equal(result.getPage(0).getWidth(),320);
  assert.equal(result.getPage(0).getRotation().angle,90);assert.equal(result.getPage(1).getWidth(),420);
  await assert.rejects(copyPdfPages([{source:first,indices:[0]}],()=>{throw new Error('cancelled');}),/cancelled/);
});
test('PDF opening rejects invalid, oversized and excessive-page input; form copying is explicit',async()=>{
  await assert.rejects(openPdf(new File(['not a PDF'],'bad.pdf',{type:'application/pdf'})),/invalid-pdf/);
  await assert.rejects(openPdf(new File([new Uint8Array(pdfLimits.fileBytes+1)],'large.pdf')),/file-limit/);
  const form=await PDFDocument.create();form.addPage();form.getForm().createTextField('name').setText('Example');
  const source=await openPdf(new File([Uint8Array.from(await form.save()).buffer],'form.pdf'));
  await assert.rejects(copyPdfPages([{source,indices:[0]}]),/form-pdf/);
  const large=await PDFDocument.create();for(let n=0;n<=pdfLimits.pages;n++)large.addPage([10,10]);
  await assert.rejects(openPdf(new File([Uint8Array.from(await large.save()).buffer],'pages.pdf')),/page-limit/);
});
