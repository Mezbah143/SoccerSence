import {describe,expect,it} from 'vitest'
import {readVerifiedTeamState} from './realTeamState'
const row={position:2,teamId:'57',team:'Sample FC',played:11,won:6,drawn:3,lost:2,points:21,goalsFor:18,goalsAgainst:10,goalDifference:8}
const result={competition:'Sample League',tables:[{stage:'REGULAR_SEASON',group:null,rows:[row]}],source:'football-data.org',freshness:'delayed',fetchedAt:'2026-11-18T05:00:00.000Z',attribution:'Football data provided by the Football-Data.org API'}
const state={competition:'PL',teamId:'57',tableIndex:0,result}
describe('M5 team profile from verified local standings',()=>{
  it('uses the authoritative ID, exact row, official points and source',()=>{
    const profile=readVerifiedTeamState(state,'57')
    expect(profile?.team.team).toBe('Sample FC')
    expect(profile?.team.points).toBe(21)
    expect(profile?.team.teamId).toBe('57')
    expect(profile?.result.attribution).toBe(result.attribution)
    expect(profile?.competition).toBe('PL')
  })
  it('rejects route ID mismatches and missing rows without guessing by club name',()=>{
    expect(readVerifiedTeamState(state,'58')).toBeNull()
    expect(readVerifiedTeamState({...state,teamId:'58'})).toBeNull()
    expect(readVerifiedTeamState({...state,tableIndex:2})).toBeNull()
  })
  it('rejects unsupported league, invalid identifier and malformed source',()=>{
    expect(readVerifiedTeamState({...state,competition:'PAID'})).toBeNull()
    expect(readVerifiedTeamState({...state,teamId:'57/../../'})).toBeNull()
    expect(readVerifiedTeamState({...state,result:{...result,attribution:'missing'}})).toBeNull()
    expect(readVerifiedTeamState({...state,result:{...result,tables:[{...result.tables[0],rows:[{...row,points:'21'}]}]}})).toBeNull()
  })
  it('handles missing navigation state and empty tables safely',()=>{
    expect(readVerifiedTeamState(null,'57')).toBeNull()
    expect(readVerifiedTeamState({...state,result:{...result,tables:[]}})).toBeNull()
  })
  it('preserves negative official points and a negative goal difference',()=>{
    const penalty={...row,points:-4,goalDifference:-6}
    const p=readVerifiedTeamState({...state,result:{...result,tables:[{...result.tables[0],rows:[penalty]}]}},'57')
    expect(p?.team.points).toBe(-4)
    expect(p?.team.goalDifference).toBe(-6)
  })
})
