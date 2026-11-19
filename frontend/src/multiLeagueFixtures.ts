import {LOCAL_COMPETITIONS,isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import type {LocalFixturesResult} from './localFixtures'
import {validDay} from './dateNavigation'

export type LeagueResult = {result?:LocalFixturesResult;error?:string}
export type DayResults = Partial<Record<LocalCompetitionCode,LeagueResult>>
const cache=new Map<string,LocalFixturesResult>()
const MAX_CACHED_RESPONSES=18
export const cacheKey=(day:string,league:LocalCompetitionCode)=>day+':'+league
export function getCachedDay(day:string):DayResults{
  const out:DayResults={}
  if(!validDay(day))return out
  for(const league of LOCAL_COMPETITIONS){
    const value=cache.get(cacheKey(day,league.code))
    if(value)out[league.code]={result:value}
  }
  return out
}
export function clearMatchDayCache(){cache.clear()}
export function storeMatchDayResult(day:string,league:LocalCompetitionCode,value:LocalFixturesResult){
  if(!validDay(day)||!isLocalCompetition(league))return
  const key=cacheKey(day,league)
  cache.delete(key)
  cache.set(key,value)
  while(cache.size>MAX_CACHED_RESPONSES)cache.delete(cache.keys().next().value!)
}
export function orderedCompetitions(favorites:readonly {kind:string;id:string}[],priority?:unknown){
  const liked=new Set(favorites.filter(x=>x.kind==='league'&&isLocalCompetition(x.id)).map(x=>x.id))
  return [...LOCAL_COMPETITIONS].sort((a,b)=>{
    const ap=a.code===priority?-1:liked.has(a.code)?0:1
    const bp=b.code===priority?-1:liked.has(b.code)?0:1
    return ap-bp
  })
}
export function shouldStopLoading(error:unknown){
  return error instanceof Error&&['rate_limited','gateway_disabled'].includes(error.message)
}
/** Explicitly invoked on click. Sequential requests only; never retries or polls.
 * The gateway is stricter than the upstream and may return 429 if its budget
 * was already partly consumed. Stop immediately on a quota or disabled error. */
export async function loadMatchDay(
  day:string,
  signal:AbortSignal,
  load:(day:string,signal:AbortSignal,code:LocalCompetitionCode)=>Promise<LocalFixturesResult>,
  onUpdate:(code:LocalCompetitionCode,value:LeagueResult)=>void,
  onProgress?:(done:number,total:number)=>void,
  order:readonly LocalCompetitionCode[]=LOCAL_COMPETITIONS.map(c=>c.code),
){
  if(!validDay(day))throw Error('invalid_date')
  const selected=[...new Set(order)].filter(isLocalCompetition)
  let done=0
  for(const code of selected){
    if(signal.aborted)break
    const saved=cache.get(cacheKey(day,code))
    if(saved){onUpdate(code,{result:saved});done++;onProgress?.(done,selected.length);continue}
    try{
      const result=await load(day,signal,code)
      if(signal.aborted)break
      storeMatchDayResult(day,code,result)
      onUpdate(code,{result})
    }catch(error){
      if(signal.aborted)break
      const stopping=shouldStopLoading(error)
      onUpdate(code,{error:stopping?'Gateway quota reached or disabled. Remaining leagues were not requested.':'Could not load this competition. No fictional matches were substituted.'})
      done++
      onProgress?.(done,selected.length)
      if(stopping)break
      continue
    }
    done++
    onProgress?.(done,selected.length)
  }
}
