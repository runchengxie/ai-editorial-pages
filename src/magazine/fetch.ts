import {createHash} from 'node:crypto';import {validateLibrary,type Library} from './contract.ts';
export const RELEASE_URL='https://api.github.com/repos/runchengxie/ai-editorial/releases/tags/magazine-current';
async function bytes(response:Response,max=4_000_000):Promise<Buffer>{
 if(!response.ok||!response.body)throw new Error(`Magazine download HTTP ${response.status}`);
 const chunks:Uint8Array[]=[];let length=0;const reader=response.body.getReader();
 try{for(;;){const next=await reader.read();if(next.done)break;length+=next.value.length;if(length>max)throw new Error('Magazine payload too large');chunks.push(next.value);}}
 finally{await reader.cancel();reader.releaseLock();}
 return Buffer.concat(chunks);
}
export async function fetchMagazine():Promise<{library:Library;sha256:string;producerRevision:string}>{
 const release=JSON.parse((await bytes(await fetch(RELEASE_URL,{redirect:'error',signal:AbortSignal.timeout(30000),headers:{accept:'application/vnd.github+json',...(process.env.GH_TOKEN?{authorization:`Bearer ${process.env.GH_TOKEN}`}:{})}}),200000)).toString());
 const manifest=JSON.parse(release.body),name=`magazine-${manifest.sha256}.json`;
 if(manifest.schemaVersion!==2||!/^[0-9a-f]{64}$/.test(manifest.sha256)||!/^[0-9a-f]{40}$/.test(manifest.producerRevision)||manifest.asset!==name)throw new Error('Invalid magazine manifest');
 const asset=release.assets?.find((a:any)=>a.name===name);
 const prefix='https://github.com/runchengxie/ai-editorial/releases/download/magazine-current/';
 if(!asset?.browser_download_url||asset.browser_download_url!==prefix+name)throw new Error('Invalid magazine asset location');
 const data=await bytes(await fetch(asset.browser_download_url,{signal:AbortSignal.timeout(30000)}));
 const sha256=createHash('sha256').update(data).digest('hex');if(sha256!==manifest.sha256)throw new Error('Magazine digest mismatch');
 return {library:validateLibrary(JSON.parse(data.toString())),sha256,producerRevision:manifest.producerRevision};
}
