import type {Library,Issue} from './contract.ts';
export function fixtureLibrary(now=new Date()):Library{
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const midnight=new Date(today+'T00:00:00Z');const daysSinceMonday=(midnight.getUTCDay()+6)%7;
 const previousMonday=new Date(midnight.getTime()-(daysSinceMonday+7)*86400000),weekEnd=new Date(previousMonday.getTime()+6*86400000);
 const block={en:'Preview: CSV import for financial data.',zh:'预览：用于财务数据处理的 CSV 导入。',sourceIds:['preview']};
 function issue(kind:'daily'|'weekly'):Issue{
  const coverageStart=kind==='daily'?new Date(now.getTime()-86400000).toISOString():new Date(previousMonday.getTime()-8*3600000).toISOString(),coverageEnd=kind==='daily'?now.toISOString():new Date(weekEnd.getTime()+86400000-8*3600000).toISOString();
  const end=kind==='daily'?today:weekEnd.toISOString().slice(0,10),start=kind==='daily'?new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(coverageStart)):previousMonday.toISOString().slice(0,10);
  return {id:`${kind}-${end}`,kind,generatedAt:now.toISOString(),start,end,coverageStart,coverageEnd,title:block,lead:block,
   stories:[{id:'story-1',audience:'finance',headline:block,summary:block,paragraphs:[block,{...block,en:'This is fixture content for layout tests, not a product announcement.',zh:'这是排版测试样例，不是真实产品公告。'}],related:[],practicalNote:null}],briefs:[block],outlook:[],
   sources:[{id:'preview',url:'https://example.org/research',title:'Preview source',source:'Example',publishedAt:new Date(Date.parse(coverageStart)+3600000).toISOString(),level:'article',audience:'finance'}]};
 }
 return {schemaVersion:2,issues:[issue('daily'),issue('weekly')]};
}
