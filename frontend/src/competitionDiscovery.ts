import type {StandingRow,StandingTable} from './localStandings'

/** No new provider data: sort and filter only the verified, already-loaded table. */
export function findStandingRows(rows:readonly StandingRow[],query:string):StandingRow[]{
  const term=query.trim().toLocaleLowerCase()
  return term?rows.filter(row=>row.team.toLocaleLowerCase().includes(term)):rows.slice()
}
export function tableSnapshot(table:StandingTable){
  const rows=table.rows
  const scored=rows.reduce((n,row)=>n+row.goalsFor,0)
  return {clubs:rows.length,top:rows.length?rows.reduce((best,row)=>row.position<best.position?row:best):null,goalsForTotal:scored}
}
export function standingPeers(table:StandingTable,teamId:string){
  return table.rows.filter(row=>row.teamId!==teamId)
    .sort((a,b)=>Math.abs(a.position-(table.rows.find(row=>row.teamId===teamId)?.position??0))-Math.abs(b.position-(table.rows.find(row=>row.teamId===teamId)?.position??0))||a.position-b.position)
    .slice(0,4)
}
