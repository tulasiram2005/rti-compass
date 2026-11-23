import {rules} from './rules.mjs';
export const flow = {
 Drafted:['Filed'], Filed:['Acknowledged','Transferred','Reply received','Deemed non-reply'],
 Acknowledged:['Transferred','Reply received','Deemed non-reply'], Transferred:['Reply received'],
 'Reply received':['First appeal drafted','Closed'], 'Deemed non-reply':['First appeal drafted','Reply received'],
 'First appeal drafted':['First appeal filed','Closed'], 'First appeal filed':['Second appeal ready','Closed'],
 'Second appeal ready':['Closed'],Closed:[]
};
export const templates = {
 en:['To the Public Information Officer','Application under section 6(1) of the Right to Information Act, 2005','Please provide copies of the following records'],
 hi:['लोक सूचना अधिकारी को','सूचना का अधिकार अधिनियम, 2005 की धारा 6(1) के अंतर्गत आवेदन','कृपया निम्नलिखित अभिलेखों की प्रतियाँ प्रदान करें'],
 te:['ప్రజా సమాచార అధికారికి','సమాచార హక్కు చట్టం, 2005 సెక్షన్ 6(1) కింద దరఖాస్తు','దయచేసి క్రింది రికార్డుల ప్రతులు అందించండి'],
 ta:['பொதுத் தகவல் அலுவலருக்கு','தகவல் அறியும் உரிமைச் சட்டம், 2005 பிரிவு 6(1) கீழ் விண்ணப்பம்','பின்வரும் பதிவுகளின் நகல்களை வழங்கவும்']
};
export function draft(c,lang=c.lang){
 const [to,subject,ask]=templates[lang];
 return [to,c.authority, '',subject,'',ask,'',...c.records.split('\n').filter(s=>s.trim()).map((s,i)=>(i+1)+'. '+s.trim())].join('\n');
}
export function day(date, offset=0){
 const d=new Date(date+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(+d)||d.toISOString().slice(0,10)!==date) throw Error('Enter a valid calendar date.');
 d.setUTCDate(d.getUTCDate()+offset); return d.toISOString().slice(0,10);
}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function estimate(c){
 const state=c.events.at(-1).state;
 if(state==='Reply received')return {date:day(c.events.at(-1).date,rules.firstAppeal.days),rule:rules.firstAppeal,label:'First appeal'};
 if(!c.ordinary || c.events.some(e=>e.state==='Transferred'))return null;
 const receipt=c.events.find(e=>e.state==='Filed');
 if(!receipt)return null;
 const due=day(receipt.date,rules.ordinary.days);
 if(state==='Deemed non-reply')return {date:day(due,rules.firstAppeal.days),rule:rules.firstAppeal,label:'First appeal'};
 return ['Filed','Acknowledged'].includes(state)?{date:due,rule:rules.ordinary,label:'Reply'}:null;
}
export function advance(c,state,date,detail='',now=today()){
 const last=c.events.at(-1);
 if(!flow[last.state]?.includes(state))throw Error('Choose an available transition.');
 if(day(date)<last.date||date>now)throw Error('Use a date between the last event and today.');
 if(state==='Filed'&&!detail.trim())throw Error('Record the submission mode and confirm receipt date.');
 if(state==='Deemed non-reply'&&(!estimate(c)||date<=estimate(c).date))throw Error('Confirm the applicable deadline has passed.');
 return {...c,events:[...c.events,{state,date,detail}]};
}
export function review(text){
 const checks=[
 [/\b(refus\w*|exempt\w*|denied)\b/i,'Possible refusal',['7(8)','10(1)','19(1)']],
 [/\bpartial\w*/i,'Possible partial disclosure',['10(1)','19(1)']],
 [/\btransfer\w*/i,'Possible transfer',['6(1)']],
 [/\bfee\b/i,'Possible fee notice',[]],
 [/\b(enclosed|provided|attached)\b/i,'Possible disclosure',[]]
 ];
 for(const [pattern,label,cites] of checks) if(pattern.test(text))return {label,cites};
 return {label:'Manual review needed',cites:[]};
}
export function newCase(title,authority,records,lang='en',date=today()){
 return {id:crypto.randomUUID(),title,authority,records,lang,application:'',reply:'',grounds:'',ordinary:false,synthetic:false,events:[{state:'Drafted',date:day(date),detail:''}]};
}
