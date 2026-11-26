import {Link,useLocation,useParams} from 'react-router-dom'
import {TeamLogo} from './TeamLogo'
import {ArrowLeft,ArrowRight,CalendarClock,ChevronLeft,ChevronRight,Clock3,Info,ShieldCheck,Trophy} from 'lucide-react'
import {utcKickoffLabel} from './localFixtures'
import {readVerifiedMatchState} from './realMatchState'
import {nearbyMatches,presentMatch} from './matchPresentation'
import {matchDayInsights} from './verifiedInsights'
import {localCompetitionName} from './localCompetitions'

export function RealMatchDetailsPage(){
  const {id}=useParams()
  const location=useLocation()
  const verified=import.meta.env.DEV?readVerifiedMatchState(location.state,id):null
  if(!verified)return <section className="empty" role="status">
    <Info size={36} aria-hidden="true"/>
    <h1>Match details unavailable</h1>
    <p>Open a real fixture from the local match centre. Details are held in the current navigation session; reloading this page never fetches provider data or substitutes fictional results.</p>
    <Link to="/" state={{mode:'local'}}>Back to matches</Link>
  </section>
  const {match,result,day,competition,zone}=verified
  const presentation=presentMatch(match)
  const neighbors=nearbyMatches(result,match.id)
  const insights=matchDayInsights(result)
  const state={day,result,competition,zone}
  const navigationState={mode:'local',...state}
  return <section className="detail match-centre-v2" aria-label="Real match details">
    <nav className="match-breadcrumbs" aria-label="Match context">
      <Link to="/" state={navigationState}><ArrowLeft size={17} aria-hidden="true"/> Matches</Link>
      <span aria-hidden="true">/</span>
      <Link to={'/standings?competition='+competition}>{localCompetitionName(competition)}</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page">Match details</span>
    </nav>
    <div className="detail-card real-detail m6-score-card">
      <div className="m6-score-eyebrow">
        <span className="kicker">{match.competition} · LOCAL DATA EXPERIMENT</span>
        <span className={'m6-status m6-status-'+presentation.tone}>{presentation.label}</span>
      </div>
      <div className="real-scoreboard">
        <div className="real-side"><TeamLogo teamId={match.homeTeamId} teamName={match.home} size={66}/><h1>{match.home}</h1><span className="m6-side-caption">Home</span></div>
        <div className="m6-score-middle">
          <strong className="m6-score-value" aria-label={presentation.scoreLabel}>{presentation.hasScore?<>{match.homeScore} <span>:</span> {match.awayScore}</>:'VS'}</strong>
          <span className="m6-score-freshness">Delayed data · Not live</span>
        </div>
        <div className="real-side"><TeamLogo teamId={match.awayTeamId} teamName={match.away} size={66}/><h1>{match.away}</h1><span className="m6-side-caption">Away</span></div>
      </div>
      {!presentation.hasScore&&<p className="m6-score-note">No final score is available. The match status and kickoff are shown without predicting a result.</p>}
      <p className="real-kickoff"><CalendarClock size={17} aria-hidden="true"/> Kickoff {utcKickoffLabel(match.kickoffUtc)}</p>
    </div>
    <div className="m6-match-context">
      <div><Clock3 size={18} aria-hidden="true"/><span>Selected match day</span><strong>{day} {zone}</strong></div>
      <div><Trophy size={18} aria-hidden="true"/><span>Competition</span><strong>{localCompetitionName(competition)}</strong></div>
      <div><ShieldCheck size={18} aria-hidden="true"/><span>Provider status</span><strong>{presentation.label}</strong></div>
    </div>
    <div className="real-detail-info">
      <div><h2><Info size={18} aria-hidden="true"/> Verified match information</h2>
        <dl>
          <dt>Match ID</dt><dd>{match.id}</dd>
          <dt>UTC kickoff</dt><dd>{match.kickoffUtc.slice(0,16).replace('T',' ')} UTC</dd>
          <dt>Score source</dt><dd>{presentation.hasScore?'Delayed provider result':'Unavailable / not supplied'}</dd>
          <dt>Data type</dt><dd>Verified fixture response</dd>
        </dl>
      </div>
      <div><h2><Trophy size={18} aria-hidden="true"/> About this match</h2>
        <p>SoccerSense displays only data included in the verified fixture response. Lineups, live events, player statistics, possession and highlights are unavailable here. We do not invent them.</p>
        <Link className="m6-inline-link" to={'/standings?competition='+competition}>View {localCompetitionName(competition)} standings <ArrowRight size={15} aria-hidden="true"/></Link>
        <p className="m6-navigation-hint">Club profiles are accessible from verified standings tables; the current fixture response does not include reliable team IDs.</p>
      </div>
    </div>
    <section className="m7-insights" aria-label="Verified match-day insights">
      <div className="m7-insights-heading"><div><p className="kicker">M7 · VERIFIED INSIGHTS</p><h2>Match-day snapshot</h2></div><span className="pill">Selected {zone} day only</span></div>
      <p className="mode-hint"><Info size={16} aria-hidden="true"/><span>These figures summarize only fixtures already loaded for {day} in {localCompetitionName(competition)}. They are not recent team form, predictions, or live statistics.</span></p>
      <div className="m7-insight-grid">
        <div><strong>{insights.total}</strong><span>Fixtures returned</span></div>
        <div><strong>{insights.completed}</strong><span>Finished with scores</span></div>
        <div><strong>{insights.pending}</strong><span>Other / no final score</span></div>
        <div><strong>{insights.goals}</strong><span>Goals in finished matches</span></div>
      </div>
      {insights.completed>0?<div className="m7-breakdown">
        <h3>Results among finished matches on this date</h3>
        <div className="m7-breakdown-row"><span>Home wins</span><strong>{insights.homeWins}</strong></div>
        <div className="m7-breakdown-row"><span>Draws</span><strong>{insights.draws}</strong></div>
        <div className="m7-breakdown-row"><span>Away wins</span><strong>{insights.awayWins}</strong></div>
        <p>Average goals per finished match: <strong>{insights.averageGoals}</strong></p>
      </div>:<p className="m7-empty-note">No finished matches with final scores are available for this selected day. Result breakdowns and averages are not calculated.</p>}
    </section>
    <div className="m6-fixture-navigation" aria-label="Same-day fixture navigation">
      {neighbors.previous?<Link to={'/real-match/'+neighbors.previous.id} state={state}><ChevronLeft size={18} aria-hidden="true"/><span><small>Previous match</small><strong>{neighbors.previous.home} vs {neighbors.previous.away}</strong></span></Link>:<span className="m6-neighbor-disabled">First match of this day</span>}
      <span className="m6-match-count">Match {neighbors.index} of {neighbors.total}</span>
      {neighbors.next?<Link to={'/real-match/'+neighbors.next.id} state={state}><span><small>Next match</small><strong>{neighbors.next.home} vs {neighbors.next.away}</strong></span><ChevronRight size={18} aria-hidden="true"/></Link>:<span className="m6-neighbor-disabled">Last match of this day</span>}
    </div>
    <div className="source-panel" role="note"><strong>{result.source}</strong> · Delayed data · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST<div>{result.attribution}</div></div>
    <p className="mode-hint"><Info size={16} aria-hidden="true"/><span>Local development only. Opening this match or switching between already-loaded fixtures makes no additional API request.</span></p>
    <Link className="m6-back-link" to="/" state={navigationState}><ArrowLeft size={16} aria-hidden="true"/> Back to {day} matches</Link>
  </section>
}
