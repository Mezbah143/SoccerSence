import {describe,expect,it} from 'vitest'
import {nearbyMatches,presentMatch} from './matchPresentation'
import {parseLocalFixtures} from './localFixtures'

const source={source:'football-data.org',freshness:'delayed',attribution:'Football data provided by the Football-Data.org API',fetchedAt:'2026-11-18T11:00:00Z'}
const games=[
  {id:'101',competition:'Sample League',home:'Home 1',away:'Away 1',kickoffUtc:'2026-11-21T12:00:00Z',status:'TIMED',homeScore:null,awayScore:null},
  {id:'102',competition:'Sample League',home:'Home 2',away:'Away 2',kickoffUtc:'2026-11-21T13:00:00Z',status:'FINISHED',homeScore:2,awayScore:0},
  {id:'103',competition:'Sample League',home:'Home 3',away:'Away 3',kickoffUtc:'2026-11-21T14:00:00Z',status:'IN_PLAY',homeScore:1,awayScore:1},
]
const result=parseLocalFixtures({...source,matches:games},'2026-11-21')
describe('M6 match presentation',()=>{
  it('shows explicit scheduled state and no invented score',()=>{
    expect(presentMatch(result.matches[0])).toEqual({label:'Scheduled',tone:'scheduled',scoreLabel:'Score not available',hasScore:false})
  })
  it('treats incomplete pair as unavailable, not a guessed result',()=>{
    expect(presentMatch({status:'FINISHED',homeScore:2,awayScore:null}).hasScore).toBe(false)
  })
  it('labels in-progress results delayed, never live',()=>{
    expect(presentMatch(result.matches[2])).toEqual({label:'In progress · delayed',tone:'delayed',scoreLabel:'1 : 1',hasScore:true})
  })
  it('handles unknown status conservatively and finished scores precisely',()=>{
    expect(presentMatch({status:'UNRECOGNIZED',homeScore:null,awayScore:null}).label).toBe('Status unavailable')
    expect(presentMatch(result.matches[1])).toMatchObject({label:'Full time',scoreLabel:'2 : 0',hasScore:true})
  })
  it('finds adjacent matches from the existing verified result without sorting or fetching',()=>{
    const first=nearbyMatches(result,'101')
    expect(first.previous).toBeNull()
    expect(first.next?.id).toBe('102')
    expect(first.index).toBe(1)
    const middle=nearbyMatches(result,'102')
    expect(middle.previous?.id).toBe('101')
    expect(middle.next?.id).toBe('103')
    expect(middle.total).toBe(3)
    expect(nearbyMatches(result,'103').next).toBeNull()
    expect(nearbyMatches(result,'unknown')).toMatchObject({previous:null,next:null,index:0,total:3})
  })
})
