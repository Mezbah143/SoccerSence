import {describe,it,expect,vi,afterEach} from 'vitest'
import {loadLocalFixtures,parseLocalFixtures,utcKickoffLabel} from './localFixtures'
const fixture = {
  id:'560643',home:'Example Home FC',away:'Example Away FC',
  competition:'Premier League',kickoffUtc:'2026-11-21T12:30:00.000Z',
  status:'TIMED',homeScore:null,awayScore:null,
}
const response = {
  source:'football-data.org',freshness:'delayed',
  fetchedAt:'2026-11-17T05:51:19.282Z',
  attribution:'Football data provided by the Football-Data.org API',
  matches:[fixture],
}
afterEach(()=>vi.unstubAllGlobals())
describe('local fixtures UI adapter',()=>{
  it('validates and preserves null scores and source attribution',()=>{
    const result=parseLocalFixtures(response,'2026-11-21')
    expect(result.matches).toHaveLength(1)
    expect(result.matches[0].homeScore).toBeNull()
    expect(result.freshness).toBe('delayed')
  })
  it('refuses unexpected off-day fixtures',()=>{
    expect(()=>parseLocalFixtures({...response,matches:[{...fixture,kickoffUtc:'2026-11-22T12:30:00Z'}]},'2026-11-21')).toThrow('invalid_response')
  })
  it('refuses malformed or fake score data',()=>{
    expect(()=>parseLocalFixtures({...response,matches:[{...fixture,homeScore:'2'}]},'2026-11-21')).toThrow('invalid_response')
    expect(()=>parseLocalFixtures({...response,source:'unknown'},'2026-11-21')).toThrow('invalid_response')
  })
  it('requests only a single day and sends no credentials',async()=>{
    const fetchMock=vi.fn().mockResolvedValue({ok:true,json:async()=>response})
    vi.stubGlobal('fetch',fetchMock)
    await loadLocalFixtures('2026-11-21')
    expect(fetchMock).toHaveBeenCalledWith('/api/fixtures?competition=PL&date=2026-11-21',{
      method:'GET',cache:'no-store',signal:undefined,
    })
  })
  it('shows errors instead of silently substituting fictional scores',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:429}))
    await expect(loadLocalFixtures('2026-11-21')).rejects.toThrow('rate_limited')
  })
  it('labels kickoff in Korea local time while fetching UTC day',()=>{
    expect(utcKickoffLabel('2026-11-21T12:30:00Z')).toContain('21:30')
    expect(utcKickoffLabel('2026-11-21T15:00:00Z')).toContain('Nov 22')
  })
})
