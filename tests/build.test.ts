import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fixture } from '../src/fixture.ts';
import {fixtureLibrary} from '../src/magazine/fixture.ts';
test('failed validation leaves existing output untouched; valid archives render without engine checkout',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'reader-build-'));
 try{
  const out=path.join(root,'public'),input=path.join(root,'input.json');
  execFileSync(process.execPath,['src/build.ts','--fixture','--out',out]);
  const previous=await readFile(path.join(out,'index.html'),'utf8');
  await writeFile(input,JSON.stringify(fixture(new Date(Date.now()-49*3600000))));
  assert.throws(()=>execFileSync(process.execPath,['src/build.ts','--input',input,'--out',out],{stdio:'pipe'}),/Command failed/);
  assert.equal(await readFile(path.join(out,'index.html'),'utf8'),previous);
  const magazineFile=path.join(root,'magazine.json');await writeFile(magazineFile,JSON.stringify(fixtureLibrary()));
  const now=new Date(),editions=[...fixture(now),...fixture(new Date(now.getTime()-86400000))];
  await writeFile(input,JSON.stringify(editions));
  execFileSync(process.execPath,['src/build.ts','--input',input,'--out',out,'--magazine-input',magazineFile]);
  assert.equal(JSON.parse(await readFile(path.join(out,'editions.json'),'utf8')).length,2);
  assert.match(await readFile(path.join(out,`${editions[1].date}.zh-CN.html`),'utf8'),/未经人工审核/);
  const build=JSON.parse(await readFile(path.join(out,'build.json'),'utf8'));assert.equal(build.contractVersion,2);assert.match(build.dataSha256,/^[0-9a-f]{64}$/);
 }finally{await rm(root,{recursive:true});}
});
