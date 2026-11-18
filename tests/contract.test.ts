import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEditions, readResponse } from '../src/contract.ts';
import { fixture } from '../src/fixture.ts';
import { renderPage, renderRss } from '../src/render.ts';
const now=new Date('2026-11-17T04:00:00Z');
const clone=()=>structuredClone(fixture(now));
test('accepts the production v1 DTO, whitelists fields, and renders safe HTML/RSS',()=>{
 const raw=clone();Object.assign(raw[0],{privateNotes:'SECRET'});Object.assign(raw[0].items[0],{title:'<script>alert(1)</script>',excerpt:'SECRET'});
 const clean=validateEditions(raw,now);assert.equal(clean.length,1);assert.ok(!JSON.stringify(clean).includes('SECRET'));
 assert.ok(renderPage(clean[0],clean,'en').includes('&lt;script&gt;'));assert.ok(!renderRss(clean[0],'https://example.org/').includes('<script>'));
});
test('rejects stale, future, empty and duplicate editions',()=>{
 assert.throws(()=>validateEditions([],now),/contract/);
 assert.throws(()=>validateEditions(clone(),new Date(now.getTime()+49*3600000)),/stale/);
 assert.throws(()=>validateEditions(clone(),new Date(now.getTime()-60000)),/future/);
 assert.throws(()=>validateEditions([...clone(),...clone()],now),/duplicate/);
});
test('rejects unsafe dates, URLs and inconsistent source identities',()=>{
 for(const mutation of [
  (v:any)=>v[0].items[0].publishedAt='2026-11-16("><svg/onload=1>)',
  (v:any)=>v[0].items[0].url='javascript:alert(1)',
  (v:any)=>v[0].date='../../evil',
  (v:any)=>v[0].items[0].sourceId='unknown',
  (v:any)=>v[0].items[0].sourceName='another source',
  (v:any)=>v[0].sources[0].ok=false,
  (v:any)=>v[0].items[0].publishedAt='2026-11-18T00:00:00.000Z'
 ]) {const raw=clone();mutation(raw);assert.throws(()=>validateEditions(raw,now),/contract/);}
});
test('bounded public download refuses HTTP errors, wrong media type, oversized or malformed responses',async()=>{
 await assert.rejects(readResponse(new Response('x',{status:503})),/HTTP/);
 await assert.rejects(readResponse(new Response('<html/>',{headers:{'content-type':'text/html'}})),/JSON/);
 await assert.rejects(readResponse(new Response('{}',{headers:{'content-type':'application/json','content-length':'3000000'}})),/large/);
 await assert.rejects(readResponse(new Response('x'.repeat(2_000_001),{headers:{'content-type':'application/json'}})),/large/);
 await assert.rejects(readResponse(new Response('{',{headers:{'content-type':'application/json'}})),SyntaxError);
 assert.deepEqual(await readResponse(new Response('[]',{headers:{'content-type':'application/json'}})),[]);
});
test('validates multiple dates independently and rejects duplicate links or source overrepresentation',()=>{
 const raw=[...fixture(now),...fixture(new Date(now.getTime()-86400000))];
 assert.equal(validateEditions(raw,now).length,2);
 const duplicate=clone();duplicate[0].items.push({...duplicate[0].items[0]});
 assert.throws(()=>validateEditions(duplicate,now),/duplicate URL/);
 const over=clone();over[0].items.push({...over[0].items[0],url:'https://example.org/b'},{...over[0].items[0],url:'https://example.org/c'});
 assert.throws(()=>validateEditions(over,now),/source item cap/);
});

test('legacy archives disclose paused publication in both languages',()=>{
 const editions=validateEditions(clone(),now);
 for(const [locale,notice] of [['en','Automatic updates are paused.'],['zh-CN','自动更新已暂停']] as const){
  const html=renderPage(editions[0],editions,locale);
  assert.ok(html.includes(notice));
  assert.ok(!html.includes('08:17'));
 }
});
