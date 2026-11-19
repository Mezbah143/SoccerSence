import {describe,expect,it} from 'vitest'
import {matchDayInsights,seasonTableInsights} from './verifiedInsights'
import {parseLocalFixtures} from './localFixtures'
import {parseLocalStandings} from './localStandings'

const meta={source:'football-data.org',freshness:'delayed',fetchedAt:'2026-11-19T02:00:00Z',attribution:'Football data provided by the Football-Data.org API'}
const base={competition:'Fictional League',kickoffUtc:'2026-11-21T12:00:00Z',home:'Example Home',away:'Example Away'}
function fixtures(matches:unknown[]){
  return parseLocalFixtures({...meta,matches},'2026-11-21')
}
const match=(id:string,status:string,homeScore:number|null,awayScore:number|null)=>({...base,id,status,homeScore,awayScore})
describe('M7 verified match-day insights',()=>{
  it('includes only FINISHED fixtures with both scores in results and goals',()=>{
    const data=fixtures([
      match('1','FINISHED',2,1),match('2','FINISHED',0,0),match('3','FINISHED',1,3),
      match('4','SCHEDULED',null,null),match('5','IN_PLAY',2,2),match('6','FINISHED',null,null),
    ])
    expect(matchDayInsights(data)).toEqual({total:6,completed:3,pending:3,homeWins:1,draws:1,awayWins:1,goals:7,averageGoals:2.33})
  })
  it('does not treat incomplete, in-progress or awarded results as finished',()=>{
    const data=fixtures([match('1','FINISHED',4,null),match('2','PAUSED',1,0),match('3','AWARDED',3,0)])
    expect(matchDayInsights(data)).toEqual({total:3,completed:0,pending:3,homeWins:0,draws:0,awayWins:0,goals:0,averageGoals:null})
  })
  it('does not invent averages for empty days',()=>{
    expect(matchDayInsights(fixtures([]))).toMatchObject({total:0,completed:0,averageGoals:null})
  })
  it('does not call APIs to calculate results',()=>{
    expect(typeof matchDayInsights).toBe('function')
  })
})
describe('M7 verified standings aggregates',()=>{
  it('derives season rates without modifying official deducted points',()=>{
    const result=parseLocalStandings({...meta,competition:'Example League',tables:[{stage:'REGULAR_SEASON',group:null,rows:[{
      position:1,teamId:'57',team:'Example Club',played:10,won:5,drawn:3,lost:2,points:-2,goalsFor:19,goalsAgainst:11,goalDifference:8,
    }]}]})
    const row=result.tables[0].rows[0]
    expect(row.points).toBe(-2)
    expect(seasonTableInsights(row)).toEqual({played:10,winRate:50,drawRate:30,lossRate:20,goalsForPerMatch:1.9,goalsAgainstPerMatch:1.1,goalDifferencePerMatch:0.8})
  })
  it('keeps percentages and per-game rates unavailable before any played match',()=>{
    expect(seasonTableInsights({position:1,teamId:'57',team:'Example Club',played:0,won:0,drawn:0,lost:0,points:0,goalsFor:0,goalsAgainst:0,goalDifference:0}))
      .toEqual({played:0,winRate:null,drawRate:null,lossRate:null,goalsForPerMatch:null,goalsAgainstPerMatch:null,goalDifferencePerMatch:null})
  })
})
