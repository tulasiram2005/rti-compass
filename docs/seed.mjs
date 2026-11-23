import {day,draft,newCase,today} from './core.mjs';
export function examples(){
 const rows=[
 ['School repair invoices','District education office','Invoices and work orders for classroom repairs, April to June.','en',['Filed']],
 ['గ్రంథాలయ పుస్తకాల కొనుగోలు','Municipal library','ఏప్రిల్ నుండి జూన్ వరకు కొనుగోలు చేసిన పుస్తకాల జాబితా','te',[]],
 ['Water testing reports','Water supply department','Monthly water quality test reports for Ward 4.','en',['Filed','Deemed non-reply']],
 ['Tender evaluation sheets','Public works department','Evaluation sheets for the library renovation tender.','en',['Filed','Reply received']],
 ['Bus shelter expenditure','City transport office','Copies of sanction orders for bus shelters.','en',['Filed','Reply received','First appeal drafted']],
 ['Park maintenance schedule','Municipal parks office','Copies of park maintenance schedules for June.','en',['Filed','Reply received','Closed']]
 ];
 return rows.map(([title,authority,records,lang,states],i)=>{
 const start=day(today(),i===0?-29:-60);
 const c=newCase(title,authority,records,lang,start);
 c.synthetic=true;c.ordinary=true;c.application=draft(c);
 states.forEach((state,index)=>c.events.push({state,date:day(start,index===0?1:32+index),detail:index===0?'Post · receipt confirmed':'Synthetic event'}));
 if(i===3)c.reply='Access is refused under section 8. The evaluation sheets are exempt.';
 if(i===4)c.grounds='Please review the omitted sanction orders and identify any separable portions.';
 return c;
 });
}
