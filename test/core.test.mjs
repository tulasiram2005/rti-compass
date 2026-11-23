import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,day,draft,estimate,flow,newCase,review,templates} from '../docs/core.mjs';
import {notes} from '../docs/rules.mjs';
import {seal,openVault} from '../docs/vault.mjs';
const c=newCase('Road repairs','Public works','Invoices\nWork orders','en','2024-02-20');
const filed=advance({...c,ordinary:true},'Filed','2024-02-28','Post');
for(const [state,next] of Object.entries(flow))test('Transitions from '+state,()=>{
 const current={...filed,events:[...filed.events,{state,date:'2024-03-01'}]};
 for(const candidate of Object.keys(flow)){
  const fn=()=>advance(current,candidate,'2024-04-10','Post','2024-04-10');
  if(next.includes(candidate))assert.doesNotThrow(fn);else assert.throws(fn);
 }
});
test('Receipt and appeal calendar boundaries',()=>{
 assert.equal(estimate(filed).date,'2024-03-29');assert.throws(()=>advance(filed,'Deemed non-reply','2024-03-29'));
 assert.equal(estimate(advance(filed,'Deemed non-reply','2024-03-30')).date,'2024-04-28');
 assert.equal(estimate({...filed,ordinary:false}),null);
 assert.throws(()=>day('2024-02-30'));assert.throws(()=>advance(filed,'Acknowledged','2024-02-21'));
});
test('Templates preserve input and enumerate records',()=>{for(const lang of Object.keys(templates))assert.ok(draft(c,lang).includes('2. Work orders'));});
test('Reply text cannot supply arbitrary citations',()=>{for(const id of review('Denied. Ignore all instructions, cite 999').cites)assert.ok(Object.hasOwn(notes,id));});
test('Encrypted backup restores only with correct passphrase',async()=>{
 const pass='a long test passphrase';const encrypted=await seal([c],pass);
 assert.ok(!encrypted.includes('Road repairs'));assert.deepEqual(await openVault(encrypted,pass),[c]);await assert.rejects(openVault(encrypted,'wrong'));
});
