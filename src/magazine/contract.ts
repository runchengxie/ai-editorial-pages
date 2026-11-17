export interface Block {en:string;zh:string;sourceIds:string[];}
export interface Source {id:string;url:string;title:string;source:string;publishedAt:string;level:'article'|'feed';audience:'finance'|'development'|'general';}
export interface Story {id:string;audience:Source['audience'];headline:Block;summary:Block;paragraphs:Block[];related:Block[];practicalNote:Block|null;}
export interface Issue {id:string;kind:'daily'|'weekly';generatedAt:string;start:string;end:string;coverageStart:string;coverageEnd:string;title:Block;lead:Block;stories:Story[];briefs:Block[];outlook:{date:string;text:Block}[];sources:Source[];}
export interface Library {schemaVersion:2;issues:Issue[];}
const DAY=86400000;const bad=(reason:string):never=>{throw new Error('Invalid magazine: '+reason);};
const object=(v:any):Record<string,any>=>v&&typeof v==='object'&&!Array.isArray(v)?v:bad('object');
const text=(v:any,max=1200):string=>typeof v==='string'&&v.trim()&&v.length<=max?v:bad('text');
function iso(v:any):string {const t=text(v,30);if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(t)||!Number.isFinite(Date.parse(t))||new Date(t).toISOString()!==t)bad('timestamp');return t;}
function date(v:any):string {const s=text(v,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)bad('date');return s;}
function link(v:any):string {let u:URL;try{u=new URL(text(v,4000));}catch{return bad('URL');}if(!['http:','https:'].includes(u.protocol)||u.username||u.password)bad('unsafe URL');return u.toString();}
function list(v:any,max:number,min=0):any[]{if(!Array.isArray(v)||v.length<min||v.length>max)bad('array bounds');return v;}
const shanghaiDate=(v:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v));
export function validateLibrary(value:unknown,now=new Date()):Library{
 const root=object(value);if(root.schemaVersion!==2)bad('version');const ids=new Set<string>();
 const issues=list(root.issues,42,1).map((raw:any):Issue=>{
  const r=object(raw);if(!['daily','weekly'].includes(r.kind))bad('kind');const kind=r.kind as Issue['kind'];
  const start=date(r.start),end=date(r.end),generatedAt=iso(r.generatedAt),coverageStart=iso(r.coverageStart),coverageEnd=iso(r.coverageEnd);
  const id=text(r.id,32);if(id!==`${kind}-${end}`||ids.has(id))bad('issue identity');ids.add(id);
  if(Date.parse(generatedAt)>now.getTime()||coverageStart>=coverageEnd||Date.parse(coverageEnd)>Date.parse(generatedAt)||start>end||end>shanghaiDate(generatedAt))bad('period');
  if(kind==='weekly'&&(Date.parse(end)-Date.parse(start)!==6*DAY||new Date(start).getUTCDay()!==1||new Date(end).getUTCDay()!==0||coverageStart!==new Date(start+'T00:00:00+08:00').toISOString()||Date.parse(coverageEnd)-Date.parse(coverageStart)!==7*DAY))bad('weekly period');
  if(kind==='daily'&&(Date.parse(coverageEnd)-Date.parse(coverageStart)>72*3600000||end!==shanghaiDate(generatedAt)))bad('daily window');
  const sources=list(r.sources,24,1).map((v:any):Source=>{
   const s=object(v);if(!['article','feed'].includes(s.level)||!['finance','development','general'].includes(s.audience))bad('source type');
   const publishedAt=iso(s.publishedAt);if(publishedAt<coverageStart||publishedAt>=coverageEnd)bad('source date outside coverage');
   const sid=text(s.id,64);if(!/^[a-z0-9-]+$/.test(sid))bad('source identity');return {id:sid,url:link(s.url),title:text(s.title,500),source:text(s.source,500),publishedAt,level:s.level,audience:s.audience};
  });
  const sourceIds=new Set(sources.map(s=>s.id));if(sourceIds.size!==sources.length)bad('duplicate source');
  function block(v:any):Block{const b=object(v),refs=list(b.sourceIds,4,1).map(s=>text(s,64));if(refs.some(s=>!sourceIds.has(s)))bad('unknown source reference');return {en:text(b.en),zh:text(b.zh),sourceIds:[...new Set(refs)]};}
  const storyIds=new Set<string>();const stories=list(r.stories,10,1).map((v:any):Story=>{
   const s=object(v),sid=text(s.id,64);if(!/^story-[1-9]\d?$/.test(sid)||storyIds.has(sid)||!['finance','development','general'].includes(s.audience))bad('story identity');storyIds.add(sid);
   return {id:sid,audience:s.audience,headline:block(s.headline),summary:block(s.summary),paragraphs:list(s.paragraphs,4,2).map(block),related:list(s.related,3).map(block),practicalNote:s.practicalNote===null?null:block(s.practicalNote)};
  });
  return {id,kind,generatedAt,start,end,coverageStart,coverageEnd,title:block(r.title),lead:block(r.lead),stories,briefs:list(r.briefs,8).map(block),outlook:list(r.outlook,5).map(v=>{
   const d=date(object(v).date);if(d<=shanghaiDate(generatedAt)||Date.parse(d)-Date.parse(end)>365*DAY)bad('outlook date');return {date:d,text:block(v.text)};
  }),sources};
 }).sort((a,b)=>b.end.localeCompare(a.end)||a.kind.localeCompare(b.kind));
 const daily=issues.find(i=>i.kind==='daily'),weekly=issues.find(i=>i.kind==='weekly');
 if(!daily||now.getTime()-Date.parse(daily.generatedAt)>72*3600000)bad('stale daily');
 if(!weekly||now.getTime()-Date.parse(weekly.end)>15*DAY)bad('weekly missing or stale');
 return {schemaVersion:2,issues};
}
