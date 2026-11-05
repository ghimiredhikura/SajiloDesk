import { convertPreeti } from '../lib/preeti';
import { t,el,setText,showError,clearError,number } from './form-utils';
import { copyText,downloadBlob } from './shared';
const input=el<HTMLTextAreaElement>('preeti-input');const output=el<HTMLTextAreaElement>('preeti-output');
function invalidate(){output.value='';el<HTMLButtonElement>('copy-preeti').disabled=true;el<HTMLButtonElement>('download-preeti').disabled=true;setText('text-result-status',t('Your converted text will appear here.','युनिकोडमा बदलेको पाठ यहाँ देखिन्छ।'));clearError();}
input.addEventListener('input',()=>{setText('preeti-count',`${number(input.value.length,0)} / 50,000`);invalidate();});
function convert(){invalidate();try{output.value=convertPreeti(input.value);el<HTMLButtonElement>('copy-preeti').disabled=false;el<HTMLButtonElement>('download-preeti').disabled=false;setText('text-result-status',t('Converted. Review the text, then copy or download.','पाठ युनिकोडमा बदलियो। एक पटक पढेर कपी वा डाउनलोड गर्नुहोस्।'));}catch(error){showError(error);}}
el('preeti-form').addEventListener('submit',e=>{e.preventDefault();convert();});
el('preeti-example').addEventListener('click',()=>{input.value='g]kfn\nlgdf{0f\n[[Email: hello@example.com]]';setText('preeti-count',`${number(input.value.length,0)} / 50,000`);convert();});
el('preeti-reset').addEventListener('click',()=>{input.value='';setText('preeti-count','0 / 50,000');invalidate();input.focus();});
el('copy-preeti').addEventListener('click',()=>{if(output.value)copyText(output.value);});
el('download-preeti').addEventListener('click',()=>{if(output.value)downloadBlob(new Blob([output.value],{type:'text/plain;charset=utf-8'}),'sajilo-unicode.txt');});
el('preeti-example').click();
