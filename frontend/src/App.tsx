import {useEffect,useState} from 'react'
import {Link,Routes,Route,useParams,useLocation} from 'react-router-dom'
import {Goal,CalendarDays,ChevronLeft,ChevronRight,Trophy,Info,Clock3} from 'lucide-react'
import {fixtures,leagues,matchesOn} from './data'
import {AllLeaguesMatchCentre} from './AllLeaguesMatchCentre'
import {RealMatchDetailsPage} from './RealMatchDetailsPage'
import {LocalStandings} from './PremierLeagueStandingsPage'
import {LocalTeamProfile} from './LocalTeamProfile'
import {initialFixtureMode} from './fixtureMode'
import {AppHeader,LeaguesPage,NewsPage,FavoritesPage,SearchPage,MorePage,SettingsPage,PreferencesBridge,ScrollToTop} from './SiteSections'
function dateShift(value:string,days:number){const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)}
function DemoHome(){const location=useLocation();useEffect(()=>{if(new URLSearchParams(location.search).get('calendar')==='1')document.getElementById('demo-calendar-previous')?.focus()},[location.search]);const [date,setDate]=useState('2026-11-14');const [league,setLeague]=useState('All competitions');const matches=matchesOn(date,league);return <><section className="hero"><p className="kicker">THE BEAUTIFUL GAME, SIMPLIFIED</p><h1>Football, <em>in focus.</em></h1><p>Fixtures, scores and the details that matter. Built for fans.</p><Goal size={90} className="hero-ball" aria-hidden="true"/></section><div className="section-title"><div><p className="kicker">MATCH CENTRE</p><h2>Matches & fixtures</h2></div><span className="pill">{matches.length} matches</span></div><div className="filters"><div className="date-picker"><button id="demo-calendar-previous" aria-label="Previous day" onClick={()=>setDate(dateShift(date,-1))}><ChevronLeft size={18}/></button><span><CalendarDays size={16}/>{date}</span><button aria-label="Next day" onClick={()=>setDate(dateShift(date,1))}><ChevronRight size={18}/></button></div><label>Competition <select value={league} onChange={e=>setLeague(e.target.value)}>{leagues.map(item=><option key={item}>{item}</option>)}</select></label></div>{matches.length?<div className="match-grid">{matches.map(m=><Link to={'/match/'+m.id} className="match-card" key={m.id}><div className="match-meta"><span>● {m.competition}</span><span className="pill">{m.status==='finished'?'Full time':'Scheduled'}</span></div><div className="team"><span><b className="crest">{m.home.slice(0,2).toUpperCase()}</b>{m.home}</span><strong>{m.score?m.score[0]:'–'}</strong></div><div className="team"><span><b className="crest purple">{m.away.slice(0,2).toUpperCase()}</b>{m.away}</span><strong>{m.score?m.score[1]:'–'}</strong></div><div className="match-bottom"><Clock3 size={14}/>{m.time}<span>Match details ›</span></div></Link>)}</div>:<div className="empty"><CalendarDays size={32}/><h3>No demo matches for this date</h3><p>Try November 14 or 15, 2026. No real football feed is connected.</p><button onClick={()=>{setDate('2026-11-14');setLeague('All competitions')}}>Show demo fixtures</button></div>}</>}
function Home(){
  const location=useLocation()
  const requestedMode=(location.state as {mode?:unknown}|null)?.mode
  const [mode,setMode]=useState<'demo'|'local'>(()=>initialFixtureMode(import.meta.env.DEV,requestedMode))
  return <>
    <div className="mode-switch" role="group" aria-label="Fixture data mode">
      <button type="button" className={mode==='demo'?'selected':''} onClick={()=>setMode('demo')} aria-pressed={mode==='demo'}>Fictional demo</button>
      {import.meta.env.DEV&&<button type="button" className={mode==='local'?'selected':''} onClick={()=>setMode('local')} aria-pressed={mode==='local'}>Local real fixtures</button>}
    </div>
    {mode==='local'&&import.meta.env.DEV?<AllLeaguesMatchCentre/>:<DemoHome/>}
  </>
}
function Detail(){const {id}=useParams();const m=fixtures.find(x=>x.id===id);return <div className="detail"><Link to="/">‹ Back to fixtures</Link>{m?<div className="detail-card"><p className="kicker">{m.competition} · FICTIONAL DEMO</p><h1>{m.home} <span>{m.score?m.score.join(' : '):'vs'}</span> {m.away}</h1><p>{m.status==='finished'?'Full time':'Scheduled'} · {m.time}</p><p>No match statistics are provided in demo mode.</p></div>:<h1>Match not found</h1>}</div>}
function Standings(){return import.meta.env.DEV?<LocalStandings/>:<div className="empty"><Trophy size={38}/><h1>League standings</h1><p>Standings are not available in the public preview. Local development uses a separately verified data gateway.</p><Link to="/">Back to fixtures</Link></div>}
function About(){return <div className="empty"><Info size={38}/><h1>About SoccerSense</h1><p>An independent football application being built with a strict $0 budget. All current matches and clubs are fictional.</p><a href="https://github.com/Mezbah143/SoccerSence">Explore GitHub documentation</a></div>}
export function App(){return <div className="app"><PreferencesBridge/><ScrollToTop/><a className="skip-to-content" href="#main-content">Skip to main content</a><AppHeader/><main id="main-content" tabIndex={-1}>
  <div className="banner" role="status"><Info size={18}/><span><strong>Development preview.</strong> Demo fixtures are fictional. Local real fixtures are available only in development mode through your private gateway and are delayed, not live.</span></div>
  <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/match/:id" element={<Detail/>}/>
    <Route path="/real-match/:id" element={<RealMatchDetailsPage/>}/>
    <Route path="/leagues" element={<LeaguesPage/>}/>
    <Route path="/standings" element={<Standings/>}/>
    <Route path="/news" element={<NewsPage/>}/>
    <Route path="/favorites" element={<FavoritesPage/>}/>
    <Route path="/more" element={<MorePage/>}/>
    <Route path="/search" element={<SearchPage/>}/>
    <Route path="/settings" element={<SettingsPage/>}/>
    <Route path="/team/:id" element={import.meta.env.DEV?<LocalTeamProfile/>:<div className="empty"><h1>Team profiles unavailable</h1><p>Local provider team profiles are not part of the public preview.</p><Link to="/leagues">Explore leagues</Link></div>}/>
    <Route path="/about" element={<About/>}/>
    <Route path="*" element={<div className="empty" role="status"><h1>Page not found</h1><p>This route does not exist in the SoccerSense preview.</p><Link to="/">Back to Matches</Link></div>}/>
  </Routes></main><footer>© SoccerSense · Development preview <span>Made for the beautiful game.</span></footer></div>}
