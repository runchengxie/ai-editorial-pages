import { readFile, writeFile, mkdir, copyFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CONTRACT_VERSION, SOURCE_URL, fetchEditions, validateEditions } from './contract.ts';
import { fixture } from './fixture.ts';
import { renderPage, renderRss } from './render.ts';
const args=process.argv.slice(2);
function option(key:string):string|undefined{const i=args.indexOf(key);return i<0?undefined:args[i+1];}
const output=option('--out');if(!output)throw new Error('--out must identify an external output directory');
const target=path.resolve(output),repo=path.resolve(import.meta.dirname,'..');
if(target===repo||target.startsWith(repo+path.sep))throw new Error('Output must be outside the source repository');
await mkdir(target,{recursive:true});
const resolved=await realpath(target);if(resolved===repo||resolved.startsWith(repo+path.sep))throw new Error('Output resolves inside the source repository');
const preview=args.includes('--fixture'),input=option('--input'),now=new Date();
const raw=preview?fixture(now):input?JSON.parse(await readFile(input,'utf8')):await fetchEditions();
const editions=validateEditions(raw,now),latest=editions[0],base='https://runchengxie.github.io/ai-editorial-pages/';
for(const e of editions)for(const locale of ['en','zh-CN'] as const)await writeFile(path.join(target,`${e.date}.${locale}.html`),renderPage(e,editions,locale));
for(const [file,locale] of [['index.html','en'],['zh-CN.html','zh-CN']] as const)await writeFile(path.join(target,file),renderPage(latest,editions,locale));
await writeFile(path.join(target,'feed.xml'),renderRss(latest,base));
await writeFile(path.join(target,'latest.json'),JSON.stringify(latest,null,2)+'\n');
await writeFile(path.join(target,'editions.json'),JSON.stringify(editions)+'\n');
await writeFile(path.join(target,'build.json'),JSON.stringify({contractVersion:CONTRACT_VERSION,source:preview?'fixture':input?'local-file':SOURCE_URL,
 dataSha256:createHash('sha256').update(JSON.stringify(editions)).digest('hex'),generatedAt:latest.generatedAt,builtAt:now.toISOString(),rendererRevision:process.env.GITHUB_SHA??'local',preview},null,2)+'\n');
await writeFile(path.join(target,'.nojekyll'),'');
for(const asset of ['style.css','language.js'])await copyFile(new URL(asset,import.meta.url),path.join(target,asset));
console.log(`Built ${editions.length} editions, ${latest.items.length} links, source generated ${latest.generatedAt}`);
