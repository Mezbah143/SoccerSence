import {useEffect,useRef,useState} from 'react'
import {Info,Trophy} from 'lucide-react'
import {loadLocalStandings,type LocalStandingsResult} from './localStandings'
import {LOCAL_COMPETITIONS,type LocalCompetitionCode,localCompetitionName} from './localCompetitions'

export function LocalStandings() {
  const [competition,setCompetition]=useState<LocalCompetitionCode>('PL')
  const [result,setResult]=useState<LocalStandingsResult|null>(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const controller=useRef<AbortController|null>(null)
  useEffect(()=>()=>controller.current?.abort(),[])
  const updateCompetition=(next:LocalCompetitionCode)=>{
    controller.current?.abort()
    setCompetition(next)
    setResult(null)
    setError('')
    setLoading(false)
  }
  const request=async()=>{
    controller.current?.abort()
    const next=new AbortController()
    controller.current=next
    setResult(null)
    setError('')
    setLoading(true)
    try {
      const data=await loadLocalStandings(next.signal,competition)
      if (!next.signal.aborted) setResult(data)
    } catch(cause) {
      if (!next.signal.aborted) {
        setError(cause instanceof Error && cause.message==='rate_limited'
          ? 'Local API rate limit reached. Wait before trying again; no automatic retries are made.'
          : cause instanceof Error && cause.message==='gateway_disabled'
            ? 'The local gateway is disabled or blocked. Check your private server configuration.'
            : 'Could not load verified standings. Check that the local gateway is running.')
      }
    } finally {
      if (!next.signal.aborted) setLoading(false)
    }
  }
  return <section aria-label="Local Premier League standings">
    <div className="section-title">
      <div><p className="kicker">LOCAL DATA EXPERIMENT</p><h2>{localCompetitionName(competition)} standings</h2></div>
      <span className="pill">Delayed standings</span>
    </div>
    <p className="mode-hint"><Info size={16} aria-hidden="true"/><span>Local testing only. Tables retain the provider’s positions and points, including deductions. No automatic polling.</span></p>
    <div className="standings-actions"><label className="competition-picker">Competition <select aria-label="Standings competition" value={competition} onChange={event=>updateCompetition(event.target.value as LocalCompetitionCode)}>{LOCAL_COMPETITIONS.map(item=><option key={item.code} value={item.code}>{item.name}</option>)}</select></label><button type="button" className="load-button" disabled={loading} onClick={request}>{loading?'Loading…':'Load real standings'}</button></div>
    {loading&&<div className="empty" role="status">Loading delayed competition standings…</div>}
    {error&&<div className="empty" role="alert"><h3>Standings unavailable</h3><p>{error}</p><p>No invented table has been substituted.</p></div>}
    {result&&<div className="source-panel" role="status">
      <strong>{result.competition}</strong> · {result.source} · Delayed data · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST
      <div>{result.attribution}</div>
    </div>}
    {result&&result.tables.length===0&&<div className="empty"><Trophy size={38} aria-hidden="true"/><h3>No standings available</h3><p>The provider returned no league tables for this competition. No demo table is shown.</p></div>}
    {result&&result.tables.map((table,index)=><section key={table.stage+'-'+(table.group??'')+'-'+index} aria-label={table.group??table.stage} className="standings-section">
      {result.tables.length>1&&<h3>{table.group??table.stage}</h3>}
      <div className="standings-scroll">
        <table className="standings-table">
          <caption>{result.competition} · {table.group??table.stage} · delayed standings</caption>
          <thead><tr>
            <th scope="col">#</th><th scope="col">Club</th><th scope="col" title="Played">P</th>
            <th scope="col" title="Won">W</th><th scope="col" title="Drawn">D</th>
            <th scope="col" title="Lost">L</th><th scope="col" title="Goals for">GF</th>
            <th scope="col" title="Goals against">GA</th><th scope="col" title="Goal difference">GD</th>
            <th scope="col" title="Points">Pts</th>
          </tr></thead>
          <tbody>{table.rows.map(row=><tr key={row.teamId}>
            <td>{row.position}</td><th scope="row">{row.team}</th><td>{row.played}</td>
            <td>{row.won}</td><td>{row.drawn}</td><td>{row.lost}</td>
            <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td>
            <td>{row.goalDifference>0?'+'+row.goalDifference:row.goalDifference}</td>
            <td className="standings-points">{row.points}</td>
          </tr>)}</tbody>
        </table>
      </div>
      {table.rows.length===0&&<p className="mode-hint">No rows in this table.</p>}
    </section>)}
  </section>
}
