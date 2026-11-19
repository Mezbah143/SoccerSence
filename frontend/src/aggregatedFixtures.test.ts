import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {clearAggregateRequestCache,loadAggregatedDay,parseAggregatedDay,aggregateErrorMessage} from './aggregatedFixtures'
import {clearMatchDayCache,getCachedDay} from './multiLeagueFixtures'
import {LOCAL_COMPETITIONS} from './localCompetitions'
const day='2026-11-21'
const fixture={id:'1',competition:'Sample League',home:'Sample Home',away:'Sample Away',
  kickoffUtc:'2026-11-21T14:00:00.000Z',status:'TIMED',homeScore:null,awayScore:null}
const body={source:'football-data.org',freshness:'delayed',fetchedAt:'2026-11-19T03:00:00.000Z',
  attribution:'Football data provided by the Football-Data.org API',
  leagues:Object.fromEntries(LOCAL_COMPETITIONS.map(c=>[c.code,c.code==='PL'?[fixture]:[]]))}
beforeEach(()=>{clearAggregateRequestCache();clearMatchDayCache()})
afterEach(()=>vi.unstubAllGlobals())
describe('M12 consolidated automatic fixtures',()=>{
  it('validates all six groups with exact KST dates',()=>{
    const result=parseAggregatedDay(body,day)
    expect(result.PL?.result?.matches[0].id).toBe('1')
    expect(result.PD?.result?.matches).toEqual([])
  })
  it('rejects missing or unapproved league groups and impossible dates',()=>{
    expect(()=>parseAggregatedDay({...body,leagues:{PL:[]}},day)).toThrow()
    expect(()=>parseAggregatedDay({...body,leagues:{...body.leagues,UNKNOWN:[]}},day)).toThrow()
    expect(()=>parseAggregatedDay(body,'2026-11-99')).toThrow()
    expect(()=>parseAggregatedDay({...body,leagues:{...body.leagues,PL:[{...fixture,kickoffUtc:'2026-11-22T14:00:00Z'}]}},day)).toThrow()
  })
  it('deduplicates concurrent attempts and fills the existing memory cache with one fetch',async()=>{
    const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>body})
    vi.stubGlobal('fetch',fetcher)
    const signal=new AbortController().signal
    const [a,b]=await Promise.all([loadAggregatedDay(day,signal),loadAggregatedDay(day,signal)])
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher).toHaveBeenCalledWith('/api/all-fixtures?date='+day+'&tz=KST',{method:'GET',cache:'no-store'})
    expect(a.PL?.result).toEqual(b.PL?.result)
    expect(Object.keys(getCachedDay(day))).toHaveLength(6)
    await loadAggregatedDay(day,signal)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('explains sanitized gateway errors without retrying or exposing provider payloads',async()=>{
    const scenarios=[
      {status:422,body:{error:'aggregate_filter_rejected'},expected:'aggregate_filter_rejected'},
      {status:502,body:{error:'invalid_provider_response'},expected:'aggregate_invalid_provider_response'},
      {status:502,body:{error:'aggregate_response_unavailable'},expected:'aggregate_response_unavailable'},
      {status:503,body:{error:'provider_disabled'},expected:'gateway_disabled'},
    ]
    for(const scenario of scenarios){
      clearAggregateRequestCache()
      const fetcher=vi.fn().mockResolvedValue({ok:false,status:scenario.status,json:async()=>scenario.body})
      vi.stubGlobal('fetch',fetcher)
      await expect(loadAggregatedDay(day,new AbortController().signal)).rejects.toThrow(scenario.expected)
      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(aggregateErrorMessage(new Error(scenario.expected))).not.toContain('Automatic league fixtures could not be verified')
    }
  })
  it('fails visibly without retrying a 503 or 429',async()=>{
    for(const status of [503,429]){
      clearAggregateRequestCache()
      const fetcher=vi.fn().mockResolvedValue({ok:false,status})
      vi.stubGlobal('fetch',fetcher)
      const task=loadAggregatedDay(day,new AbortController().signal)
      await expect(task).rejects.toThrow(status===503?'aggregate_unavailable':'rate_limited')
      await expect(loadAggregatedDay(day,new AbortController().signal)).rejects.toThrow()
      expect(fetcher).toHaveBeenCalledTimes(1)
    }
    expect(aggregateErrorMessage(new Error('aggregate_unavailable'))).toContain('manual')
  })
})
