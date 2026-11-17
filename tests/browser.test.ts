import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
test('public site works on desktop/mobile, switches language, and exposes source/RSS/archive',async()=>{
 const out=await mkdtemp(path.join(tmpdir(),'daily-pages-browser-'));
 execFileSync(process.execPath,['src/build.ts','--fixture','--out',out]);
 const server=createServer(async(req,res)=>{
  try{const file=path.basename(new URL(req.url!,'http://localhost').pathname)||'index.html';
   res.setHeader('content-type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.xml')?'application/rss+xml':'text/html');
   res.end(await readFile(path.join(out,file)));
  }catch{res.writeHead(404).end();}
 });
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=(server.address() as {port:number}).port;
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage();await page.goto(`http://127.0.0.1:${port}/`);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('article').count(),1);
  await page.getByRole('link',{name:'简体中文'}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),'zh-CN');
  await page.goto(`http://127.0.0.1:${port}/`);await page.waitForURL('**/zh-CN.html');
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.ok(await page.getByText('未经人工审核',{exact:false}).isVisible());
  const rss=await page.request.get(`http://127.0.0.1:${port}/feed.xml`);assert.equal(rss.status(),200);assert.match(await rss.text(),/<rss/);
  const archive=page.locator('nav a').first();await archive.click();assert.equal(await page.locator('article').count(),1);
 }finally{await browser.close();await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));await rm(out,{recursive:true});}
});
