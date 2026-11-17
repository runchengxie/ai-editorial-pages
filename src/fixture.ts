import type { Edition } from './contract.ts';
export function fixture(now = new Date()): Edition[] {
 return [{date:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(now),generatedAt:now.toISOString(),windowDays:7,
  sources:[{sourceId:'preview',sourceName:'Preview source',ok:true}],
  items:[{title:'Preview: Python tools for financial data',url:'https://example.org/research',publishedAt:new Date(now.getTime()-3600000).toISOString(),sourceId:'preview',sourceName:'Preview source',audience:'finance'}]}];
}
