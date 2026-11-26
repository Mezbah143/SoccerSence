import type {StandingRow} from './localStandings'

/** Same-table, season-to-date comparisons only. Never infer recent form or match outcomes. */
export function sourceBoundComparison(left:StandingRow,right:StandingRow){
  const perPlayed=(value:number,played:number)=>played>0?Math.round((value/played)*100)/100:null
  return {
    names:[left.team,right.team] as const,
    positions:[left.position,right.position] as const,
    played:[left.played,right.played] as const,
    officialPoints:[left.points,right.points] as const,
    goalsFor:[left.goalsFor,right.goalsFor] as const,
    goalsAgainst:[left.goalsAgainst,right.goalsAgainst] as const,
    goalDifference:[left.goalDifference,right.goalDifference] as const,
    goalsForPerMatch:[perPlayed(left.goalsFor,left.played),perPlayed(right.goalsFor,right.played)] as const,
    goalsAgainstPerMatch:[perPlayed(left.goalsAgainst,left.played),perPlayed(right.goalsAgainst,right.played)] as const,
    winRate:[perPlayed(left.won*100,left.played),perPlayed(right.won*100,right.played)] as const,
  }
}
