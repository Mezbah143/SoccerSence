import {useState} from 'react'
import {Info,Scale} from 'lucide-react'
import type {StandingRow,StandingTable} from './localStandings'
import {sourceBoundComparison} from './sourceBoundComparison'

export function TableComparison({table,team}:{table:StandingTable;team:StandingRow}){
  const peers=table.rows.filter(row=>row.teamId!==team.teamId)
  const [selected,setSelected]=useState<string>(peers[0]?.teamId??'')
  const opponent=peers.find(row=>row.teamId===selected)??peers[0]
  if(!opponent)return <section className="m16-comparison" aria-label="Table comparison unavailable"><p>There is no second team in this verified table to compare.</p></section>
  const data=sourceBoundComparison(team,opponent)
  const fields=[
    {label:'Official position',values:data.positions},
    {label:'Matches played',values:data.played},
    {label:'Official points',values:data.officialPoints},
    {label:'Goals scored',values:data.goalsFor},
    {label:'Goals conceded',values:data.goalsAgainst},
    {label:'Goal difference',values:data.goalDifference},
    {label:'Goals scored / game',values:data.goalsForPerMatch},
    {label:'Goals conceded / game',values:data.goalsAgainstPerMatch},
    {label:'Win rate (%)',values:data.winRate},
  ]
  return <section className="m16-comparison" aria-label="Verified season-to-date table comparison">
    <div className="m16-heading"><Scale size={21} aria-hidden="true"/><div><p className="kicker">M16 · VERIFIED COMPARISON</p><h2>Compare table records</h2></div></div>
    <p><Info size={15} aria-hidden="true"/> Same {table.group??table.stage} table, same provider snapshot. No live form, direct head-to-head record, prediction, xG, or historical lookup is implied.</p>
    <label className="m16-picker">Compare with
      <select value={opponent.teamId} onChange={event=>setSelected(event.target.value)}>{peers.map(row=><option key={row.teamId} value={row.teamId}>{row.team}</option>)}</select>
    </label>
    <div className="m16-compare-scroll"><table>
      <caption>Official season totals and per-game averages from the loaded standings table</caption>
      <thead><tr><th scope="col">Statistic</th><th scope="col">{team.team}</th><th scope="col">{opponent.team}</th></tr></thead>
      <tbody>{fields.map(field=><tr key={field.label}><th scope="row">{field.label}</th>{field.values.map((value,index)=><td key={index}>{value===null?'Not available':value}</td>)}</tr>)}</tbody>
    </table></div>
    <p className="m16-note">Different matches played can affect raw totals. Official points may include deductions; these values are never reconstructed from wins. Comparisons are descriptive only.</p>
  </section>
}
