import {advance,day,draft,estimate,flow,newCase,review,templates,today} from './core.mjs';
import {notes,source} from './rules.mjs';
import {examples} from './seed.mjs';
import {openVault,seal} from './vault.mjs';
const $=id=>document.getElementById(id);
function el(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
let cases=examples(),active=cases[0],view='application',dirty=false;
function announce(text){$('msg').textContent=text;}
function showView(name){view=name;render();}
function render(){
 const c=active;
 $('cases').replaceChildren();
 for(const item of cases){
  const b=el('button',item.title);
  b.append(el('small',(item.synthetic?'Synthetic · ':'')+item.events.at(-1).state));
  b.setAttribute('aria-current',String(c===item));b.onclick=()=>{active=item;showView('application');};$('cases').append(b);
 }
 document.querySelector('article').hidden=!c;
 if(!c){$('notes').replaceChildren();return;}
 $('ref').textContent=(c.synthetic?'Synthetic example':'Private case')+' / '+c.id.slice(0,8);
 $('title').textContent=c.title;$('agency').textContent=c.authority;
 const due=estimate(c);
 let status=c.events.at(-1).state;
 if(due){
  const days=Math.round((Date.parse(due.date)-Date.parse(today()))/86400000);
  status+=' · '+due.label+' estimate '+due.date+' ('+(days<0?Math.abs(days)+' days overdue':days+' days left')+'). Confirm the date yourself. § '+due.rule.section;
 }
 $('status').textContent=status;
 for(const b of document.querySelectorAll('[data-view]')){
  $(b.dataset.view).hidden=b.dataset.view!==view;b.setAttribute('aria-current',String(b.dataset.view===view));
 }
 $('letter').value=c.application;$('response').value=c.reply;$('grounds').value=c.grounds;
 $('events').replaceChildren(...c.events.map(e=>el('li',e.date+' · '+e.state+(e.detail?' — '+e.detail:''))));
 const options=flow[c.events.at(-1).state].filter(s=>s!=='Deemed non-reply'||(due&&due.date<today()));
 $('next').replaceChildren(...options.map(s=>new Option(s,s)));$('step').hidden=!options.length;
 $('when').value=today();$('when').min=c.events.at(-1).date;$('when').max=today();$('detail').value='';
 $('standard').hidden=!options.includes('Filed');$('ordinary').checked=c.ordinary;
 refreshNotes();
}
function refreshNotes(){
 const result=review(active.reply);
 $('analysis').textContent=active.reply?'English keyword review · '+result.label+'. Check the original before relying on this suggestion.':'Paste a reply to see a preliminary keyword review.';
 const ids=view==='reply'?[...new Set([...result.cites,'19(1)'])]:view==='timeline'?['7(1)','7(2)','19(1)']:['6(1)'];
 $('notes').replaceChildren(...ids.flatMap(id=>[el('strong','Section '+id),el('p',notes[id])]));
 $('source').href=source;
}
for(const b of document.querySelectorAll('[data-view]'))b.onclick=()=>showView(b.dataset.view);
for(const [id,key] of [['letter','application'],['response','reply'],['grounds','grounds']]){
 $(id).oninput=()=>{active[key]=$(id).value;dirty=true;if(id==='response')refreshNotes();};
}
$('newcase').onclick=()=>$('create').showModal();
$('vault').onclick=()=>{$('vaultmsg').textContent='';$('files').showModal();};
$('files').onclose=()=>{$('pass').value='';};
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>b.closest('dialog').close();
$('builder').onsubmit=e=>{
 e.preventDefault();const values=['name','authority','records'].map(id=>$(id).value.trim());
 if(values.some(v=>!v)){announce('Complete the case title, authority and records.');return;}
 active=newCase(...values,$('lang').value);active.application=draft(active);
 if($('bilingual').checked&&active.lang!=='en')active.application+='\n\n'+draft(active,'en');
 cases.unshift(active);dirty=true;$('create').close();e.target.reset();showView('application');
};
$('step').onsubmit=e=>{
 e.preventDefault();
 try{
  const c=advance({...active,ordinary:$('ordinary').checked},$('next').value,$('when').value,$('detail').value);
  cases[cases.indexOf(active)]=c;active=c;dirty=true;render();announce('Event recorded.');
 }catch(err){announce(err.message);}
};
function printCase(pack){
 const c=active;
 const parts=[(c.synthetic?'Synthetic example · ':'')+c.title,c.authority,c.application];
 if(pack)parts.unshift('First appeal for review under section 19(1)','To the First Appellate Authority, '+c.authority,'Please review the decision or delay described below.',c.grounds||'[Add your appeal grounds before filing.]');
 if(pack)parts.push('Timeline',...c.events.map(e=>e.date+' · '+e.state+' '+e.detail),'Reply',c.reply||'[No reply recorded]','Enclosures to attach','Original application, proof of receipt, and any authority correspondence.','Verify the applicable procedure and recipient.',source);
 $('paper').textContent=parts.join('\n\n');window.print();
}
$('print').onclick=()=>printCase(false);$('pack').onclick=()=>printCase(true);
$('save').onclick=async()=>{
 try{
 const version=JSON.stringify(cases);
 const data=await seal(JSON.parse(version),$('pass').value);
 const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='rti-compass-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);
 if(JSON.stringify(cases)===version)dirty=false;$('vaultmsg').textContent='Download started. Keep the file and passphrase.';
 }catch(err){$('vaultmsg').textContent=err.message;}
};
function valid(c){
 if(!c||!['title','authority','records','application','reply','grounds','id'].every(k=>typeof c[k]==='string')||!Object.hasOwn(templates,c.lang)||typeof c.ordinary!=='boolean'||typeof c.synthetic!=='boolean'||!Array.isArray(c.events)||!c.events.length)return false;
 return c.events.every((e,i)=>typeof e.detail==='string'&&day(e.date)===e.date&&Object.hasOwn(flow,e.state)&&(i===0?e.state==='Drafted':flow[c.events[i-1].state].includes(e.state)&&c.events[i-1].date<=e.date));
}
$('import').onchange=async e=>{
 try{
 const file=e.target.files[0];if(!file)return;
 if(file.size>10000000)throw Error();
 const incoming=await openVault(await file.text(),$('pass').value);
 if(!Array.isArray(incoming)||!incoming.every(valid))throw Error();
 const added=incoming.map(c=>({...c,id:crypto.randomUUID()}));cases.unshift(...added);active=added[0]||active;dirty=true;render();
 $('vaultmsg').textContent='Restored '+added.length+' cases.';
 }catch{$('vaultmsg').textContent='Could not restore. Check the file and passphrase.';}
 e.target.value='';
};
$('erase').onclick=()=>{if(confirm('Clear every case from this tab? Export first if you need a copy.')){cases=[];active=null;dirty=false;render();$('files').close();announce('Desk cleared. Choose New case to start.');}};
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
render();
