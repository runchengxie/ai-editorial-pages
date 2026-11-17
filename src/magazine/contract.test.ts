import {test} from 'node:test';import assert from 'node:assert/strict';
import {validateLibrary} from './contract.ts';import {fixtureLibrary} from './fixture.ts';
const now=new Date('2026-11-17T00:27:00Z');
test('accepts article editions with source-linked paragraphs and strips private fields',()=>{
 const raw=fixtureLibrary(now);Object.assign(raw.issues[0],{rawEvidence:'secret'});const v=validateLibrary(raw,now);
 assert.equal(v.issues.length,2);assert.ok(!JSON.stringify(v).includes('secret'));
});
test('rejects unsafe URLs, uncited prose, bad periods and unknown source references',()=>{
 for(const mutate of [(v:any)=>v.issues[0].sources[0].url='javascript:alert(1)',(v:any)=>v.issues[0].stories[0].paragraphs[0].sourceIds=[],(v:any)=>v.issues[0].stories[0].paragraphs[0].sourceIds=['missing'],(v:any)=>v.issues[1].end='2026-11-14']){
  const v=fixtureLibrary(now);mutate(v);assert.throws(()=>validateLibrary(v,now),/magazine/);
 }
});
test('requires a fresh daily and a recent complete weekly edition',()=>{
 assert.throws(()=>validateLibrary(fixtureLibrary(now),new Date(now.getTime()+73*3600000)),/stale/);
 const v=fixtureLibrary(now);v.issues=v.issues.filter(i=>i.kind==='daily');assert.throws(()=>validateLibrary(v,now),/weekly/);
});
test('rejects attribute injection in public identities before rendering',()=>{
 const v=fixtureLibrary(now);v.issues[0].stories[0].id='story-1"><img src=x onerror=alert(1)>';assert.throws(()=>validateLibrary(v,now),/identity/);
});
