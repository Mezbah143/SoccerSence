import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import {parseLocalStandings,type LocalStandingsResult,type StandingRow,type StandingTable} from './localStandings'

/** Routing state is untrusted. Team pages show only a verified, already-loaded standings row. */
export type VerifiedTeamState = {
  competition:LocalCompetitionCode
  result:LocalStandingsResult
  teamId:string
  tableIndex:number
  team:StandingRow
  table:StandingTable
}

export function readVerifiedTeamState(state:unknown,expectedTeamId?:string):VerifiedTeamState|null {
  if (!state || typeof state!=='object' || Array.isArray(state)) return null
  const data=state as Record<string,unknown>
  if(!isLocalCompetition(data.competition) ||
     typeof data.teamId!=='string' || !/^[1-9]\d*$/.test(data.teamId) ||
     !Number.isSafeInteger(data.tableIndex) || (data.tableIndex as number)<0) return null
  if(expectedTeamId!==undefined && data.teamId!==expectedTeamId) return null
  try {
    const result=parseLocalStandings(data.result)
    const table=result.tables[data.tableIndex as number]
    if(!table)return null
    const team=table.rows.find(row=>row.teamId===data.teamId)
    if(!team)return null
    return {competition:data.competition,result,tableIndex:data.tableIndex as number,teamId:data.teamId,team,table}
  }catch{
    return null
  }
}
