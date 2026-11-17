import {describe,expect,it} from 'vitest'
import {readVerifiedMatchState} from './realMatchState'

const match={
  id:'560643',competition:'Premier League',home:'Fictional Home FC',away:'Fictional Away FC',
  kickoffUtc:'2026-11-21T12:30:00.000Z',status:'TIMED',homeScore:null,awayScore:null,
}
const result={
  source:'football-data.org',freshness:'delayed',
  fetchedAt:'2026-11-17T05:51:19.282Z',
  attribution:'Football data provided by the Football-Data.org API',
  matches:[match],
}
describe('real match details navigation',()=>{
  it('finds the requested fixture from already-loaded verified response',()=>{
    const data=readVerifiedMatchState({day:'2026-11-21',result},'560643')
    expect(data?.match.home).toBe('Fictional Home FC')
    expect(data?.match.homeScore).toBeNull()
    expect(data?.result.attribution).toBe(result.attribution)
  })
  it('can restore the selected fixture day and list without refetching',()=>{
    const data=readVerifiedMatchState({day:'2026-11-21',result})
    expect(data?.day).toBe('2026-11-21')
    expect(data?.result.matches).toHaveLength(1)
  })
  it('rejects a missing ID or invalid navigation payload',()=>{
    expect(readVerifiedMatchState({day:'2026-11-21',result},'fictional-id')).toBeNull()
    expect(readVerifiedMatchState(null,'560643')).toBeNull()
    expect(readVerifiedMatchState({day:'invalid',result},'560643')).toBeNull()
  })
  it('rejects an off-date, malformed or unattributed match rather than showing invented data',()=>{
    expect(readVerifiedMatchState({day:'2026-11-20',result},'560643')).toBeNull()
    expect(readVerifiedMatchState({day:'2026-11-21',result:{...result,attribution:'unknown'}},'560643')).toBeNull()
    expect(readVerifiedMatchState({day:'2026-11-21',result:{...result,matches:[{...match,homeScore:'2'}]}},'560643')).toBeNull()
  })
})
