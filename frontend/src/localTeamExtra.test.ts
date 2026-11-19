import {afterEach,describe,expect,it,vi} from 'vitest'
import {loadTeamExtra,parseTeamExtra} from './localTeamExtra'
const attribution='Football data provided by the Football-Data.org API'
const meta={source:'football-data.org',freshness:'delayed',fetchedAt:'2026-11-19T00:00:00Z',attribution}
const club={id:'57',name:'Sample FC',shortName:null,venue:null,founded:null,area:null}
const game={id:'1',utcDate:'2026-11-18T00:00:00Z',homeTeamId:'57',awayTeamId:'58',home:'Sample FC',away:'Another FC',homeScore:1,awayScore:0}
afterEach(()=>vi.unstubAllGlobals())
describe('local team extra client',()=>{
  it('validates source and exact team ID',()=>{
    expect(parseTeamExtra({...meta,team:club},'team','57').team?.name).toBe('Sample FC')
    expect(()=>parseTeamExtra({...meta,team:club},'team','58')).toThrow('invalid_response')
    expect(()=>parseTeamExtra({...meta,attribution:'unknown',team:club},'team','57')).toThrow('invalid_response')
    expect(()=>parseTeamExtra({...meta,matches:[{...game,homeTeamId:'99'}]},'team-matches','57')).toThrow('invalid_response')
  })
  it('rejects malformed match scores, ids and duplicated history',()=>{
    expect(()=>parseTeamExtra({...meta,matches:[{...game,homeScore:'1'}]},'team-matches','57')).toThrow('invalid_response')
    expect(()=>parseTeamExtra({...meta,matches:[game,game]},'team-matches','57')).toThrow('invalid_response')
  })
  it('fetches only the explicit local endpoint with no credentials',async()=>{
    const request=vi.fn().mockResolvedValue({ok:true,json:async()=>({...meta,team:club})})
    vi.stubGlobal('fetch',request)
    await loadTeamExtra('PL','57','team')
    expect(request).toHaveBeenCalledWith('/api/team?competition=PL&id=57',{method:'GET',cache:'no-store',signal:undefined})
    expect(request.mock.calls[0][1]).not.toHaveProperty('headers')
  })
  it('returns explicit disabled/forbidden/rate limit errors and never retries',async()=>{
    for(const [status,error] of [[503,'team_endpoint_unavailable'],[403,'team_not_allowed'],[429,'rate_limited']] as const){
      const request=vi.fn().mockResolvedValue({ok:false,status})
      vi.stubGlobal('fetch',request)
      await expect(loadTeamExtra('PL','57','team-matches')).rejects.toThrow(error)
      expect(request).toHaveBeenCalledTimes(1)
    }
  })
  it('rejects unknown competitions or unsafe IDs without network calls',async()=>{
    const request=vi.fn()
    vi.stubGlobal('fetch',request)
    await expect(loadTeamExtra('PAID' as 'PL','57','team')).rejects.toThrow('invalid_request')
    await expect(loadTeamExtra('PL','57/../','team')).rejects.toThrow('invalid_request')
    expect(request).not.toHaveBeenCalled()
  })
})
