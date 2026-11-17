/** Independent consumer of the producer-owned editions.json v1 contract. No engine code dependency. */
export interface DailyItem {
 title: string; url: string; publishedAt: string; sourceId: string; sourceName: string;
 audience: 'finance' | 'development' | 'general';
}
export interface Edition {
 date: string; generatedAt: string; windowDays: 7;
 sources: {sourceId:string;sourceName:string;ok:boolean}[]; items:DailyItem[];
}
export const SOURCE_URL = 'https://runchengxie.github.io/ai-editorial/editions.json';
export const CONTRACT_VERSION = 1;
const DAY = 86_400_000;
const MAX_BYTES = 2_000_000;
const invalid = (reason:string):never => {throw new Error(`Invalid editions v1 contract: ${reason}`);};
function object(value:unknown):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value))return invalid('object required');
 return value as Record<string,unknown>;
}
function text(value:unknown,max=500):string{
 if(typeof value!=='string'||!value.trim()||value.length>max)return invalid('bounded text required');
 return value;
}
function timestamp(value:unknown):string{
 const s=text(value,30);
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString()!==s)return invalid('ISO UTC timestamp required');
 return s;
}
function url(value:unknown):string{
 const s=text(value,4000);let u:URL;
 try{u=new URL(s);}catch{return invalid('URL required');}
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return invalid('unsafe URL');
 return u.toString();
}
export function validateEditions(value:unknown,now=new Date()):Edition[]{
 if(!Array.isArray(value)||value.length<1||value.length>30)return invalid('1–30 editions required');
 const dates=new Set<string>();
 const editions=value.map((entry):Edition=>{
  const raw=object(entry),date=text(raw.date,10),generatedAt=timestamp(raw.generatedAt);
  const time=Date.parse(generatedAt);
  const expectedDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
  if(date!==expectedDate||raw.windowDays!==7)return invalid('edition date or window');
  if(time>now.getTime())return invalid('future edition');
  if(now.getTime()-time>30*DAY)return invalid('expired archive');
  if(dates.has(date))return invalid('duplicate edition date');dates.add(date);
  if(!Array.isArray(raw.sources)||raw.sources.length<1||raw.sources.length>100)return invalid('source bounds');
  const ids=new Map<string,{sourceId:string;sourceName:string;ok:boolean}>();
  const sources=raw.sources.map(v=>{
   const s=object(v);if(typeof s.ok!=='boolean')return invalid('source status');
   const row={sourceId:text(s.sourceId,150),sourceName:text(s.sourceName),ok:s.ok};
   if(ids.has(row.sourceId))return invalid('duplicate source');ids.set(row.sourceId,row);return row;
  });
  if(sources.filter(s=>s.ok).length/sources.length<.5)return invalid('source health');
  if(!Array.isArray(raw.items)||raw.items.length<1||raw.items.length>8)return invalid('item bounds');
  const urls=new Set<string>(),counts=new Map<string,number>();
  const items=raw.items.map((v):DailyItem=>{
   const i=object(v),sourceId=text(i.sourceId,150),sourceName=text(i.sourceName),source=ids.get(sourceId);
   if(!source?.ok||source.sourceName!==sourceName)return invalid('source reference');
   const publishedAt=timestamp(i.publishedAt),published=Date.parse(publishedAt);
   if(published>time||published<time-7*DAY)return invalid('item publication window');
   const link=url(i.url);if(urls.has(link))return invalid('duplicate URL');urls.add(link);
   const count=(counts.get(sourceId)??0)+1;if(count>2)return invalid('source item cap');counts.set(sourceId,count);
   if(!['finance','development','general'].includes(i.audience as string))return invalid('audience');
   return {title:text(i.title),url:link,publishedAt,sourceId,sourceName,audience:i.audience as DailyItem['audience']};
  });
  return {date,generatedAt,windowDays:7,sources,items};
 }).sort((a,b)=>b.date.localeCompare(a.date));
 if(now.getTime()-Date.parse(editions[0].generatedAt)>48*3600000)return invalid('stale latest edition');
 return editions;
}
export async function readResponse(response:Response):Promise<unknown>{
 if(!response.ok)throw new Error(`Source HTTP ${response.status}`);
 if(!/^application\/json\b/i.test(response.headers.get('content-type')??''))throw new Error('Source must return JSON');
 if(Number(response.headers.get('content-length'))>MAX_BYTES)throw new Error('Source too large');
 if(!response.body)throw new Error('Missing JSON body');
 const reader=response.body.getReader();const chunks:Uint8Array[]=[];let bytes=0;
 try{for(;;){const next=await reader.read();if(next.done)break;bytes+=next.value.length;if(bytes>MAX_BYTES)throw new Error('Source too large');chunks.push(next.value);}}
 finally{await reader.cancel();reader.releaseLock();}
 return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export async function fetchEditions():Promise<unknown>{
 return readResponse(await fetch(SOURCE_URL,{redirect:'error',signal:AbortSignal.timeout(30_000),headers:{accept:'application/json','cache-control':'no-cache'}}));
}
