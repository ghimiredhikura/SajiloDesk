import { compoundToSqft,compoundFromSqft,toSqft,fromSqft,decimal,type LandUnit } from '../lib/land';
import { t,el,val,setText,showError,clearError,number } from './form-utils';
import { copyText } from './shared';
let copy='';
function invalidate(){copy='';el('land-result').hidden=true;el('result-empty').hidden=false;clearError();}
el('land-form').addEventListener('input',invalidate);
el('land-system').addEventListener('change',()=>{for(const system of ['ropani','bigha','decimal'])el(`${system}-fields`).hidden=val('land-system')!==system;invalidate();});
el('land-form').addEventListener('submit',e=>{
 e.preventDefault();invalidate();
 try{
  const system=val('land-system');
  const fields=system==='ropani'?['ropani','aana','paisa','daam']:['bigha','kattha','dhur'];
  const sqft=system==='decimal'?toSqft(decimal(val('land-value')),val('land-unit') as LandUnit):compoundToSqft(fields.map(f=>decimal(val(`land-${f}`))),system as 'ropani'|'bigha');
  const hill=compoundFromSqft(sqft,'ropani').map(v=>number(v)).join(' – ');const terai=compoundFromSqft(sqft,'bigha').map(v=>number(v)).join(' – ');
  setText('land-ropani-result',hill);setText('land-bigha-result',terai);
  setText('land-ropani-decimal',`${number(fromSqft(sqft,'ropani'))} ${t('ropani (decimal)','रोपनी (दशमलव)')}`);
  setText('land-bigha-decimal',`${number(fromSqft(sqft,'bigha'))} ${t('bigha (decimal)','बिघा (दशमलव)')}`);
  setText('land-sqft-result',number(sqft));setText('land-sqm-result',number(fromSqft(sqft,'sqm')));
  copy=`${t('Ropani – Aana – Paisa – Daam','रोपनी – आना – पैसा – दाम')}: ${hill}\n${t('Bigha – Kattha – Dhur','बिघा – कठ्ठा – धुर')}: ${terai}\n${t('Square feet','वर्ग फिट')}: ${number(sqft)}\n${t('Square metres','वर्ग मिटर')}: ${number(fromSqft(sqft,'sqm'))}\n${t('Nepal convention; rounded to 4 decimals.','नेपालको प्रचलन; ४ दशमलवसम्म।')}`;
  el('land-result').hidden=false;el('result-empty').hidden=true;
 }catch(error){showError(error);}
});
el('copy-land').addEventListener('click',()=>{if(copy)copyText(copy);});
el('land-reset').addEventListener('click',()=>{(el('land-form') as HTMLFormElement).reset();for(const system of ['ropani','bigha','decimal'])el(`${system}-fields`).hidden=system!=='ropani';invalidate();});
