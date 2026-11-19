import {useEffect,useRef,useState} from 'react'
import {Info,Clock3} from 'lucide-react'
import {loadTeamExtra,type TeamExtraEnvelope} from './localTeamExtra'
import type {TeamDetails,TeamResult} from './providers/team'
import type {LocalCompetitionCode} from './localCompetitions'
type Extra={kind:'team'|'team-matches';meta:TeamExtraEnvelope;team?:TeamDetails;matches?:TeamResult[]}
function errorLabel(cause:unknown){
  const code=cause instanceof Error?cause.message:''
  if(code==='team_endpoint_unavailable')return 'This endpoint has not been confirmed for your local Free account, or access was denied. It is disabled by default. Check the private gateway settings; no fabricated data is shown.'
  if(code==='rate_limited')return 'The shared local provider quota is exhausted. No automatic retries will be made.'
  if(code==='team_not_allowed')return 'Load standings first, then open this team from that verified league table.'
  if(code==='team_data_unavailable')return 'The provider has no available data for this club under the current access level.'
  return 'Unable to verify team data from the private gateway. Nothing has been substituted.'
}
export function TeamExtraPanel({competition,teamId}:{competition:LocalCompetitionCode;teamId:string}){
  const [details,setDetails]=useState<Extra|null>(null)
  const [history,setHistory]=useState<Extra|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState<'team'|'team-matches'|null>(null)
  const controller=useRef<AbortController|null>(null)
  useEffect(()=>()=>controller.current?.abort(),[])
  const request=async(kind:'team'|'team-matches')=>{
    controller.current?.abort()
    const abort=new AbortController()
    controller.current=abort
    setError('')
    setLoading(kind)
    if(kind==='team')setDetails(null)
    else setHistory(null)
    try{
      const result=await loadTeamExtra(competition,teamId,kind,abort.signal)
      if(!abort.signal.aborted){
        const value={kind,meta:result,team:result.team,matches:result.matches}
        if(kind==='team')setDetails(value)
        else setHistory(value)
      }
    }catch(cause){if(!abort.signal.aborted)setError(errorLabel(cause))}
    finally{if(!abort.signal.aborted)setLoading(null)}
  }
  return <section className="team-extra-panel" aria-label="Optional club information and recent results">
    <h2>Club information and recent results</h2>
    <p className="mode-hint"><Info size={16} aria-hidden="true"/><span>Experimental Free-plan lookups. Both endpoints are disabled by default until you confirm your account permits them. Each click is one quota-counted provider request. No background polling.</span></p>
    <div className="team-extra-actions">
      <button type="button" className="load-button" disabled={loading!==null} onClick={()=>request('team')}>{loading==='team'?'Loading club…':'Load club details'}</button>
      <button type="button" className="load-button" disabled={loading!==null} onClick={()=>request('team-matches')}>{loading==='team-matches'?'Loading results…':'Load recent results'}</button>
    </div>
    {loading&&<div role="status" className="team-extra-status">Checking permitted provider data…</div>}
    {error&&<div role="alert" className="team-extra-status">{error}</div>}
    {details?.team&&<div className="team-extra-card">
      <h3>Provider club information</h3>
      <dl><dt>Official name</dt><dd>{details.team.name}</dd><dt>Short name</dt><dd>{details.team.shortName??'Not supplied'}</dd><dt>Location</dt><dd>{details.team.area??'Not supplied'}</dd><dt>Venue</dt><dd>{details.team.venue??'Not supplied'}</dd><dt>Founded</dt><dd>{details.team.founded??'Not supplied'}</dd></dl>
      <p className="team-extra-source">Delayed · Retrieved {new Date(details.meta.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST · {details.meta.attribution}</p>
    </div>}
    {history?.matches&&<div className="team-extra-card">
      <h3>Recent finished matches</h3>
      {history.matches.length===0?<p>No finished matches were returned for this account.</p>:
      <ul className="team-results-list">{history.matches.map(match=><li key={match.id}>
        <span><Clock3 size={14} aria-hidden="true"/>{new Date(match.utcDate).toLocaleString('en-GB',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'})} KST</span>
        <strong>{match.home} {match.homeScore} : {match.awayScore} {match.away}</strong>
      </li>)}</ul>}
      <p className="team-extra-source">Delayed · Retrieved {new Date(history.meta.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST · {history.meta.attribution}</p>
    </div>}
  </section>
}
