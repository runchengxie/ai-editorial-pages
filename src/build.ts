import { readFile, writeFile, mkdir, copyFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CONTRACT_VERSION, SOURCE_URL, fetchEditions, validateEditions } from './contract.ts';
import { fixture } from './fixture.ts';
import { renderPage } from './render.ts';
import {fetchMagazine,RELEASE_URL} from './magazine/fetch.ts';
import {validateLibrary} from './magazine/contract.ts';
import {fixtureLibrary} from './magazine/fixture.ts';
import {renderArticle,filename,magazineRss} from './magazine/render.ts';
const args=process.argv.slice(2);
function option(key:string):string|undefined{const i=args.indexOf(key);return i<0?undefined:args[i+1];}
const output=option('--out');if(!output)throw new Error('--out must identify an external output directory');
const target=path.resolve(output),repo=path.resolve(import.meta.dirname,'..');
if(target===repo||target.startsWith(repo+path.sep))throw new Error('Output must be outside the source repository');
await mkdir(target,{recursive:true});
const resolved=await realpath(target);if(resolved===repo||resolved.startsWith(repo+path.sep))throw new Error('Output resolves inside the source repository');
const preview=args.includes('--fixture'),input=option('--input'),now=new Date();
const raw=preview?fixture(now):input?JSON.parse(await readFile(input,'utf8')):await fetchEditions();
const editions=validateEditions(raw,now),latest=editions[0];
const magazineInput=option('--magazine-input');
const magazine=preview?{library:fixtureLibrary(now),sha256:'fixture',producerRevision:'fixture'}:magazineInput?{library:validateLibrary(JSON.parse(await readFile(magazineInput,'utf8')),now),sha256:'local-file',producerRevision:'local'}:await fetchMagazine();
const library=magazine.library,daily=library.issues.find(i=>i.kind==='daily')!,weekly=library.issues.find(i=>i.kind==='weekly')!;
for(const e of editions)for(const locale of ['en','zh-CN'] as const)await writeFile(path.join(target,`${e.date}.${locale}.html`),renderPage(e,editions,locale));
for(const [file,locale] of [['index.html','en'],['zh-CN.html','zh-CN']] as const)await writeFile(path.join(target,file),renderPage(latest,editions,locale));
for(const issue of library.issues)for(const locale of ['en','zh-CN']as const){
 await writeFile(path.join(target,filename(issue,locale)),renderArticle(issue,library,locale));
 await writeFile(path.join(target,`export-${issue.id}.${locale}.html`),renderArticle(issue,library,locale,true));
}
for(const locale of ['en','zh-CN']as const){
 await writeFile(path.join(target,locale==='en'?'index.html':'zh-CN.html'),renderArticle(daily,library,locale));
 await writeFile(path.join(target,`weekly.${locale}.html`),renderArticle(weekly,library,locale));
}
await writeFile(path.join(target,'magazine.json'),JSON.stringify(library)+'\n');
await writeFile(path.join(target,'feed.xml'),magazineRss(library));
await writeFile(path.join(target,'latest.json'),JSON.stringify(latest,null,2)+'\n');
await writeFile(path.join(target,'editions.json'),JSON.stringify(editions)+'\n');
await writeFile(path.join(target,'build.json'),JSON.stringify({contractVersion:2,sourceContractVersion:CONTRACT_VERSION,magazineSource:RELEASE_URL,magazineSha256:magazine.sha256,producerRevision:magazine.producerRevision,magazineGeneratedAt:daily.generatedAt,source:preview?'fixture':input?'local-file':SOURCE_URL,
 dataSha256:createHash('sha256').update(JSON.stringify(editions)).digest('hex'),generatedAt:latest.generatedAt,builtAt:now.toISOString(),rendererRevision:process.env.GITHUB_SHA??'local',preview},null,2)+'\n');
await writeFile(path.join(target,'.nojekyll'),'');
for(const asset of ['style.css','language.js'])await copyFile(new URL(asset,import.meta.url),path.join(target,asset));
console.log(`Built ${editions.length} editions, ${latest.items.length} links, source generated ${latest.generatedAt}`);
