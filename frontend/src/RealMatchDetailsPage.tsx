import {Link,useLocation,useParams} from 'react-router-dom'
import {CalendarClock,ShieldCheck,Info} from 'lucide-react'
import {utcKickoffLabel} from './localFixtures'
import {readVerifiedMatchState} from './realMatchState'

function statusLabel(status:string) {
  if(status==='FINISHED')return 'Full time'
  if(status==='TIMED'||status==='SCHEDULED')return 'Scheduled'
  if(status==='IN_PLAY'||status==='PAUSED')return 'In progress (delayed)'
  return status.replaceAll('_',' ')
}

export function RealMatchDetailsPage(){
  const {id}=useParams()
  const location=useLocation()
  const verified=import.meta.env.DEV?readVerifiedMatchState(location.state,id):null
  if(!verified) return <div className="empty">
    <Info size={36} aria-hidden="true"/>
    <h1>Match details unavailable</h1>
    <p>Open a real fixture from the local match centre. Match information is kept in the current browser navigation only; reloading this page does not fetch the provider or substitute demo data.</p>
    <Link to="/" state={{mode:'local'}}>Back to fixtures</Link>
  </div>
  const {match,result,day,competition}=verified
  return <section className="detail" aria-label="Real match details">
    <Link to="/" state={{mode:'local',day,result,competition}}>‹ Back to real fixtures</Link>
    <div className="detail-card real-detail">
      <p className="kicker">{match.competition} · LOCAL DATA EXPERIMENT</p>
      <div className="real-detail-badges"><span className="pill">{statusLabel(match.status)}</span><span className="pill">Delayed, not live</span></div>
      <div className="real-scoreboard">
        <div className="real-side"><span className="crest" aria-hidden="true">{match.home.slice(0,2).toUpperCase()}</span><h1>{match.home}</h1></div>
        <strong aria-label={match.homeScore!==null&&match.awayScore!==null?`Score ${match.homeScore} to ${match.awayScore}`:'Score unavailable'}>{match.homeScore??'–'} <span>:</span> {match.awayScore??'–'}</strong>
        <div className="real-side"><span className="crest purple" aria-hidden="true">{match.away.slice(0,2).toUpperCase()}</span><h1>{match.away}</h1></div>
      </div>
      <p className="real-kickoff"><CalendarClock size={17} aria-hidden="true"/> Kickoff {utcKickoffLabel(match.kickoffUtc)} · {match.kickoffUtc.slice(0,16).replace('T',' ')} UTC</p>
    </div>
    <div className="real-detail-info">
      <div><h2><ShieldCheck size={18} aria-hidden="true"/> Match information</h2>
        <dl>
          <dt>Match ID</dt><dd>{match.id}</dd>
          <dt>Competition</dt><dd>{match.competition}</dd>
          <dt>Status</dt><dd>{statusLabel(match.status)}</dd>
          <dt>Score source</dt><dd>{match.homeScore===null||match.awayScore===null?'Unavailable / not supplied':'Delayed provider result'}</dd>
        </dl>
      </div>
      <div><h2><Info size={18} aria-hidden="true"/> Additional statistics</h2>
        <p>Lineups, events, possession, player details and highlights are not available from this local fixture response. SoccerSense does not invent them.</p>
      </div>
    </div>
    <div className="source-panel"><strong>{result.source}</strong> · Delayed data · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST<div>{result.attribution}</div></div>
    <p className="mode-hint">Local development only. No new API request was made to open this page.</p>
    <p className="mode-hint">Selected fixture UTC day: {day}</p>
  </section>
}
