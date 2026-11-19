import type {Library,Issue} from './contract.ts';
export function fixtureLibrary(now=new Date()):Library{
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const midnight=new Date(today+'T00:00:00Z');const daysSinceMonday=(midnight.getUTCDay()+6)%7;
 const previousMonday=new Date(midnight.getTime()-(daysSinceMonday+7)*86400000),weekEnd=new Date(previousMonday.getTime()+6*86400000);
 const block={en:'Preview: CSV import for financial data.',zh:'预览用于财务数据处理的 CSV 导入。',sourceIds:['preview']};
 function issue(kind:'daily'|'weekly'):Issue{
  const coverageStart=kind==='daily'?new Date(now.getTime()-86400000).toISOString():new Date(previousMonday.getTime()-8*3600000).toISOString(),coverageEnd=kind==='daily'?now.toISOString():new Date(weekEnd.getTime()+86400000-8*3600000).toISOString();
  const end=kind==='daily'?today:weekEnd.toISOString().slice(0,10),start=kind==='daily'?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(coverageStart)):previousMonday.toISOString().slice(0,10);
  return {id:`${kind}-${end}`,kind,generatedAt:now.toISOString(),start,end,coverageStart,coverageEnd,title:block,lead:block,
   stories:[{id:'story-1',audience:'finance',headline:block,summary:block,paragraphs:[block,{...block,en:'The layout test retains CLAUDE_CODE_DISABLE_DEFERRED_TOOL_RESUME as a long configuration identifier.',zh:'排版样例保留配置标识 CLAUDE_CODE_DISABLE_DEFERRED_TOOL_RESUME，用于检查窄屏换行。'}],related:[],practicalNote:null}],briefs:[block],outlook:[],
   sources:[{id:'preview',url:'https://example.org/research',title:'Preview source',source:'Example',publishedAt:new Date(Date.parse(coverageStart)+3600000).toISOString(),level:'article',audience:'finance'}]};
 }
 const daily=issue('daily'),weekly=issue('weekly');
 for(const edition of [daily,weekly]){const count=edition.kind==='daily'?6:12;const prototype=edition.stories[0];edition.stories=Array.from({length:count},(_,i)=>({...structuredClone(prototype),id:`story-${i+1}`,audience:i<2?'finance':i<count-2?'development':'general',headline:{...block,en:`Preview workflow ${i+1}`,zh:`预览工作流 ${i+1}`}}));edition.briefs=Array.from({length:edition.kind==='daily'?12:25},(_,i)=>({...block,en:`Preview short update ${i+1}: fictional data for layout checks.`,zh:`预览短讯 ${i+1}，这份虚构内容用于排版检查。`}));}
 return {schemaVersion:2,issues:[daily,weekly]};
}
