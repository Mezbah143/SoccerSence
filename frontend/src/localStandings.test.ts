import {afterEach,describe,expect,it,vi} from 'vitest'
import {loadLocalStandings,parseLocalStandings} from './localStandings'

const row = {
  position:1,teamId:'57',team:'Fictional North FC',played:10,won:7,
  drawn:2,lost:1,points:20,goalsFor:20,goalsAgainst:9,goalDifference:11,
}
const payload = {
  competition:'Fictional League',
  tables:[{stage:'REGULAR_SEASON',group:'Matchday',rows:[row]}],
  source:'football-data.org',freshness:'delayed',
  fetchedAt:'2026-11-17T05:45:33.593Z',
  attribution:'Football data provided by the Football-Data.org API',
}
afterEach(()=>vi.unstubAllGlobals())
describe('local standings browser client',()=>{
  it('accepts a valid table and retains official points, group and attribution',()=>{
    const result=parseLocalStandings(payload)
    expect(result.tables[0].rows[0].points).toBe(20)
    expect(result.tables[0].group).toBe('Matchday')
    expect(result.attribution).toBe('Football data provided by the Football-Data.org API')
  })
  it('retains negative goal difference and official negative points when applicable',()=>{
    const result=parseLocalStandings({...payload,tables:[{...payload.tables[0],rows:[{...row,points:-3,goalDifference:-5}]}]})
    expect(result.tables[0].rows[0].points).toBe(-3)
    expect(result.tables[0].rows[0].goalDifference).toBe(-5)
  })
  it('allows a valid empty tables result',()=>{
    expect(parseLocalStandings({...payload,tables:[]}).tables).toEqual([])
  })
  it.each([
    {...payload,source:'unknown'}, {...payload,attribution:'missing'},
    {...payload,tables:[{...payload.tables[0],rows:[{...row,position:0}]}]},
    {...payload,tables:[{...payload.tables[0],rows:[{...row,played:'10'}]}]},
    {...payload,tables:[{...payload.tables[0],rows:[row,row]}]},
    {...payload,tables:[{...payload.tables[0],rows:[{...row,team:' ' }]}]},
  ])('rejects invalid or inconsistent response',bad=>{
    expect(()=>parseLocalStandings(bad)).toThrow('invalid_response')
  })
  it('fetches via the same-origin local endpoint and never sends secrets',async()=>{
    const mock=vi.fn().mockResolvedValue({ok:true,json:async()=>payload})
    vi.stubGlobal('fetch',mock)
    const result=await loadLocalStandings()
    expect(result.competition).toBe('Fictional League')
    expect(mock).toHaveBeenCalledWith('/api/standings?competition=PL',{
      method:'GET',cache:'no-store',signal:undefined,
    })
  })
  it('fails explicitly on 429 instead of substituting demo data',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:429}))
    await expect(loadLocalStandings()).rejects.toThrow('rate_limited')
  })
  it('fails explicitly when gateway is disabled',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:503}))
    await expect(loadLocalStandings()).rejects.toThrow('gateway_disabled')
  })
})
