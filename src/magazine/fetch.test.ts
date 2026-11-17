import {test} from 'node:test';import assert from 'node:assert/strict';import {createHash}from'node:crypto';
import {fetchMagazine,RELEASE_URL}from'./fetch.ts';import{fixtureLibrary}from'./fixture.ts';
test('accepts only the fixed release asset and verifies its digest before rendering',async()=>{
 const payload=JSON.stringify(fixtureLibrary()),sha=createHash('sha256').update(payload).digest('hex');
 const asset=`magazine-${sha}.json`,url='https://github.com/runchengxie/ai-editorial/releases/download/magazine-current/'+asset;
 const release={body:JSON.stringify({schemaVersion:2,asset,sha256:sha,producerRevision:'a'.repeat(40)}),assets:[{name:asset,browser_download_url:url}]};
 const original=globalThis.fetch;let corrupt=false;
 globalThis.fetch=async(input:any)=>new Response(String(input)===RELEASE_URL?JSON.stringify(release):corrupt?'{}':payload);
 try{const result=await fetchMagazine();assert.equal(result.library.issues.length,2);corrupt=true;await assert.rejects(fetchMagazine(),/digest/);
  release.assets[0].browser_download_url='https://example.org/other.json';await assert.rejects(fetchMagazine(),/location/);
 }finally{globalThis.fetch=original;}
});
