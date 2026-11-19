import {beforeEach,describe,expect,it,vi} from 'vitest'
import {clearMatchDayCache,getCachedDay,loadMatchDay,orderedCompetitions} from './multiLeagueFixtures'
import {LOCAL_COMPETITIONS} from './localCompetitions'
import {parseLocalFixtures} from './localFixtures'

const day='2026-11-21'
const demoResult=parseLocalFixtures({
  source:'football-data.org',
  freshness:'delayed',
  fetchedAt:'2026-11-19T04:30:00Z',
  attribution:'Football data provided by the Football-Data.org API',
  matches:[{
    id:'900',competition:'Example League',home:'Fictional A',away:'Fictional B',
    kickoffUtc:'2026-11-21T12:00:00Z',status:'TIMED',homeScore:null,awayScore:null,
  }],
},day,'KST')
beforeEach(()=>clearMatchDayCache())
describe('M11 multi-competition match loading',()=>{
  it('only issues all sequential calls when explicitly invoked, and saves verified day results',async()=>{
    const active={count:0,max:0}
    const loader=vi.fn(async()=>{
      active.count++;active.max=Math.max(active.max,active.count)
      await Promise.resolve()
      active.count--
      return demoResult
    })
    const updates:string[]=[]
    expect(loader).not.toHaveBeenCalled()
    await loadMatchDay(day,new AbortController().signal,loader,(code)=>updates.push(code))
    expect(loader).toHaveBeenCalledTimes(LOCAL_COMPETITIONS.length)
    expect(active.max).toBe(1)
    expect(updates).toEqual(LOCAL_COMPETITIONS.map(x=>x.code))
    expect(Object.keys(getCachedDay(day))).toHaveLength(LOCAL_COMPETITIONS.length)
    await loadMatchDay(day,new AbortController().signal,loader,()=>{})
    expect(loader).toHaveBeenCalledTimes(LOCAL_COMPETITIONS.length)
  })
  it('stops on quota rejection and leaves remaining leagues as not requested',async()=>{
    const loader=vi.fn().mockResolvedValueOnce(demoResult).mockRejectedValueOnce(new Error('rate_limited'))
    const status:Record<string,string>={}
    await loadMatchDay(day,new AbortController().signal,loader,(code,value)=>{status[code]=value.error??'ok'})
    expect(loader).toHaveBeenCalledTimes(2)
    expect(status.PL).toBe('ok')
    expect(status.PD).toMatch(/quota/i)
    expect(status.BL1).toBeUndefined()
  })
  it('does not retry gateway unavailable errors or duplicate successful caches',async()=>{
    const loader=vi.fn().mockRejectedValueOnce(new Error('gateway_unavailable')).mockResolvedValue(demoResult)
    const updated:string[]=[]
    await loadMatchDay(day,new AbortController().signal,loader,code=>updated.push(code))
    expect(loader).toHaveBeenCalledTimes(LOCAL_COMPETITIONS.length)
    expect(updated).toHaveLength(LOCAL_COMPETITIONS.length)
    expect(Object.keys(getCachedDay(day))).toHaveLength(LOCAL_COMPETITIONS.length-1)
    await loadMatchDay(day,new AbortController().signal,loader,()=>{})
    expect(loader).toHaveBeenCalledTimes(LOCAL_COMPETITIONS.length+1)
  })
  it('cancels requests and does not publish stale results after date changes',async()=>{
    const controller=new AbortController()
    const loader=vi.fn(async()=>{
      controller.abort()
      return demoResult
    })
    const update=vi.fn()
    await loadMatchDay(day,controller.signal,loader,update)
    expect(loader).toHaveBeenCalledTimes(1)
    expect(update).not.toHaveBeenCalled()
    expect(getCachedDay(day)).toEqual({})
  })
  it('puts favorite leagues first and respects a safe explicit priority',()=>{
    const saved=[{kind:'league',id:'PD'},{kind:'team',id:'57'},{kind:'league',id:'SA'},{kind:'league',id:'UNSAFE'}]
    expect(orderedCompetitions(saved).slice(0,2).map(x=>x.code)).toEqual(['PD','SA'])
    expect(orderedCompetitions(saved,'BL1')[0].code).toBe('BL1')
    expect(orderedCompetitions(saved,'UNSAFE')[0].code).toBe('PD')
  })
  it('never loads malformed dates',async()=>{
    const loader=vi.fn()
    await expect(loadMatchDay('2026-11-99',new AbortController().signal,loader,()=>{})).rejects.toThrow('invalid_date')
    expect(loader).not.toHaveBeenCalled()
  })
})
