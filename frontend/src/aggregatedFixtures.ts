import {LOCAL_COMPETITIONS,type LocalCompetitionCode} from './localCompetitions'
import {validDay} from './dateNavigation'
import {parseLocalFixtures,type LocalFixturesResult} from './localFixtures'
import {storeMatchDayResult,type DayResults} from './multiLeagueFixtures'

const attempts=new Map<string,Promise<DayResults>>()
const MAX_ATTEMPTS=12
let lastStart=0
const MIN_START_INTERVAL=10_500

export function clearAggregateRequestCache(){attempts.clear();lastStart=0}
export function parseAggregatedDay(value:unknown,day:string):DayResults{
  if(!validDay(day)||!value||typeof value!=='object'||Array.isArray(value))throw Error('invalid_response')
  const payload=value as Record<string,unknown>
  const leagues=payload.leagues
  if(!leagues||typeof leagues!=='object'||Array.isArray(leagues))throw Error('invalid_response')
  const groups=leagues as Record<string,unknown>
  if(Object.keys(groups).length!==LOCAL_COMPETITIONS.length||Object.keys(groups).some(code=>!LOCAL_COMPETITIONS.some(l=>l.code===code)))throw Error('invalid_response')
  const results:DayResults={}
  for(const {code} of LOCAL_COMPETITIONS){
    if(!Array.isArray(groups[code]))throw Error('invalid_response')
    const result=parseLocalFixtures({...payload,matches:groups[code]},day,'KST')
    results[code]={result}
  }
  return results
}
function delay(ms:number,signal:AbortSignal){
  return new Promise<void>((resolve,reject)=>{
    if(signal.aborted){reject(Error('aborted'));return}
    const timer=setTimeout(()=>{signal.removeEventListener('abort',cancel);resolve()},ms)
    const cancel=()=>{clearTimeout(timer);reject(Error('aborted'))}
    signal.addEventListener('abort',cancel,{once:true})
  })
}
/** One aggregated call, with single-flight per date and no automatic retry.
 * A small inter-date pacing interval avoids bursts on rapid date changes.
 * This is only called from the development-only Match Centre. */
export function loadAggregatedDay(day:string,signal:AbortSignal):Promise<DayResults>{
  if(!validDay(day))return Promise.reject(Error('invalid_date'))
  const existing=attempts.get(day)
  if(existing)return existing
  const task=(async()=>{
    const wait=Math.max(0,lastStart+MIN_START_INTERVAL-Date.now())
    if(wait>0)await delay(wait,signal)
    if(signal.aborted)throw Error('aborted')
    lastStart=Date.now()
    const response=await fetch('/api/all-fixtures?date='+encodeURIComponent(day)+'&tz=KST',{method:'GET',cache:'no-store'})
    if(!response.ok){
      const code=await response.json().then((body:unknown)=>{
        if(body&&typeof body==='object'&&!Array.isArray(body)&&'error' in body&&typeof body.error==='string')return body.error
        return ''
      }).catch(()=>'')
      if(response.status===429)throw Error('rate_limited')
      if(code==='aggregate_filter_rejected')throw Error('aggregate_filter_rejected')
      if(code==='aggregate_unavailable')throw Error('aggregate_unavailable')
      if(code==='invalid_provider_response')throw Error('aggregate_invalid_provider_response')
      if(code==='aggregate_response_unavailable')throw Error('aggregate_response_unavailable')
      if(code==='provider_disabled'||code==='provider_access_blocked')throw Error('gateway_disabled')
      if(response.status===503)throw Error('aggregate_unavailable')
      throw Error('gateway_unavailable')
    }
    const results=parseAggregatedDay(await response.json(),day)
    for(const {code} of LOCAL_COMPETITIONS){
      const result=results[code]?.result
      if(result)storeMatchDayResult(day,code,result)
    }
    return results
  })()
  attempts.set(day,task)
  while(attempts.size>MAX_ATTEMPTS)attempts.delete(attempts.keys().next().value!)
  return task
}
export function aggregateErrorMessage(error:unknown){
  if(error instanceof Error&&error.message==='rate_limited')return 'The local gateway quota is exhausted. No automatic retry will occur; use your existing manual loading option when the quota resets.'
  if(error instanceof Error&&error.message==='aggregate_unavailable')return 'The provider denied the multi-competition endpoint for this account (or the local endpoint is disabled). Existing manual league loading remains available.'
  if(error instanceof Error&&error.message==='aggregate_filter_rejected')return 'The provider rejected the consolidated date/competition filters. Try manual league loading; no automatic retries will occur.'
  if(error instanceof Error&&error.message==='aggregate_invalid_provider_response')return 'The provider returned match data the app could not safely validate. No unverified matches are shown.'
  if(error instanceof Error&&error.message==='aggregate_response_unavailable')return 'The provider response could not be read or validated. Manual league loading remains available.'
  if(error instanceof Error&&error.message==='gateway_disabled')return 'The local football gateway is disabled or provider access has been blocked. Check the gateway terminal.'
  if(error instanceof Error&&error.message==='aborted')return ''
  return 'Automatic league fixtures could not be verified. No fictional results have been substituted; manual loading is still available.'
}
export function autoResultsAvailable(result:DayResults){
  return LOCAL_COMPETITIONS.every(({code})=>!!result[code]?.result)
}
export function orderedAggregateEntries(results:DayResults):[LocalCompetitionCode,LocalFixturesResult][]{
  return LOCAL_COMPETITIONS.flatMap(({code})=>results[code]?.result?[[code,results[code].result]] as [LocalCompetitionCode,LocalFixturesResult][]:[])
}
