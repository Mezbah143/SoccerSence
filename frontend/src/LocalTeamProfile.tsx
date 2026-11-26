import {Link,useLocation,useParams} from 'react-router-dom'
import {TeamLogo} from './TeamLogo'
import {Info,ShieldCheck,Trophy} from 'lucide-react'
import {readVerifiedTeamState} from './realTeamState'
import {localCompetitionName} from './localCompetitions'
import {TeamExtraPanel} from './TeamExtraPanel'
import {FavoriteButton} from './SiteSections'
import {seasonTableInsights} from './verifiedInsights'

export function LocalTeamProfile(){
  const {id}=useParams()
  const location=useLocation()
  const verified=import.meta.env.DEV?readVerifiedTeamState(location.state,id):null
  if(!verified)return <div className="empty" role="status">
    <Info size={34} aria-hidden="true"/>
    <h1>Team profile unavailable</h1>
    <p>Open a club from a verified local standings table. Team profiles use existing browser navigation data only: refreshing this page does not fetch the provider or display invented statistics.</p>
    <Link to="/standings">Back to standings</Link>
  </div>
  const {team,table,result,competition,teamId,tableIndex}=verified
  const insights=seasonTableInsights(team)
  return <section className="detail team-profile" aria-label="Local team profile">
    <Link to="/standings" state={{competition,result,teamId,tableIndex}}>‹ Back to {localCompetitionName(competition)} standings</Link>
    <div className="team-profile-header">
      <TeamLogo teamId={teamId} teamName={team.team} size={66}/>
      <div>
        <p className="kicker">LOCAL TEAM PROFILE · DELAYED</p>
        <h1>{team.team}</h1>
        <p>{result.competition} · {table.group??table.stage}</p>
      </div>
      <span className="pill">#{team.position} in table</span>
      <FavoriteButton kind="team" id={teamId} name={team.team} competition={competition}/>
    </div>
    <div className="team-profile-stats" aria-label="Verified league table statistics">
      <div><strong>{team.points}</strong><span>Official points</span></div>
      <div><strong>{team.played}</strong><span>Matches played</span></div>
      <div><strong>{team.won}</strong><span>Wins</span></div>
      <div><strong>{team.drawn}</strong><span>Draws</span></div>
      <div><strong>{team.lost}</strong><span>Losses</span></div>
      <div><strong>{team.goalDifference>0?'+':''}{team.goalDifference}</strong><span>Goal difference</span></div>
    </div>
    <div className="real-detail-info">
      <div><h2><Trophy size={18} aria-hidden="true"/> League record</h2>
        <dl><dt>Goals scored</dt><dd>{team.goalsFor}</dd><dt>Goals conceded</dt><dd>{team.goalsAgainst}</dd><dt>Competition</dt><dd>{result.competition}</dd><dt>Table</dt><dd>{table.group??table.stage}</dd></dl>
      </div>
      <div><h2><Info size={18} aria-hidden="true"/> Available data</h2>
        <p>This profile displays official table values from the standings response you opened. Club details and recent finished matches can be checked separately if your Free account allows them. Squad and club history are not included in this table, so no values are guessed.</p>
        <p>No additional provider request was made to open this page.</p>
      </div>
    </div>
    <section className="m7-insights" aria-label="Season-to-date club insights">
      <div className="m7-insights-heading"><div><p className="kicker">M7 · TABLE-BASED INSIGHTS</p><h2>Season-to-date performance</h2></div><span className="pill">Verified standings</span></div>
      <p className="mode-hint"><Info size={16} aria-hidden="true"/><span>Calculated from the current official league table only, not a recent-five-match form guide. Values may include official point deductions.</span></p>
      {insights.played>0?<div className="m7-insight-grid">
        <div><strong>{insights.winRate}%</strong><span>Win rate</span></div>
        <div><strong>{insights.drawRate}%</strong><span>Draw rate</span></div>
        <div><strong>{insights.goalsForPerMatch}</strong><span>Goals scored / game</span></div>
        <div><strong>{insights.goalsAgainstPerMatch}</strong><span>Goals conceded / game</span></div>
      </div>:<p className="m7-empty-note">This club has no recorded matches in the selected table, so percentages and per-game averages are unavailable.</p>}
      <p className="m7-insights-footnote">Based on {team.played} played match{team.played===1?'':'es'}. These aggregates do not indicate upcoming match outcomes and require no additional provider request.</p>
    </section>
    <TeamExtraPanel competition={competition} teamId={teamId}/>
    <div className="source-panel"><ShieldCheck size={16} aria-hidden="true"/> <strong>{result.source}</strong> · Delayed data · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST<div>{result.attribution}</div></div>
    <p className="mode-hint">Local development only · No external crests, photos or premium team data.</p>
  </section>
}
