import type {LocalFixturesResult} from './localFixtures'
import type {StandingRow} from './localStandings'

/** Derived analysis of one already-loaded verified calendar day's fixtures.
 * Not season form, head-to-head, live metrics or a prediction. No network access. */
export function matchDayInsights(result:LocalFixturesResult){
  const total=result.matches.length
  const finished=result.matches.filter(m=>m.status==='FINISHED'&&m.homeScore!==null&&m.awayScore!==null)
  const completed=finished.length
  const homeWins=finished.filter(m=>m.homeScore!>m.awayScore!).length
  const awayWins=finished.filter(m=>m.homeScore!<m.awayScore!).length
  const draws=finished.filter(m=>m.homeScore===m.awayScore).length
  const goals=finished.reduce((sum,m)=>sum+m.homeScore!+m.awayScore!,0)
  return {total,completed,pending:total-completed,homeWins,awayWins,draws,goals,
    averageGoals:completed>0?Number((goals/completed).toFixed(2)):null}
}

/** Season-to-date aggregate statistics only. No claims about recent form.
 * Undefined metrics are represented as null rather than 0 or N/A results. */
export function seasonTableInsights(row:StandingRow){
  const played=row.played
  const pct=(value:number)=>played>0?Number((value/played*100).toFixed(1)):null
  const perGame=(value:number)=>played>0?Number((value/played).toFixed(2)):null
  return {played,winRate:pct(row.won),drawRate:pct(row.drawn),lossRate:pct(row.lost),
    goalsForPerMatch:perGame(row.goalsFor),goalsAgainstPerMatch:perGame(row.goalsAgainst),
    goalDifferencePerMatch:perGame(row.goalDifference)}
}
