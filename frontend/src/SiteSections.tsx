import {useEffect,useState} from 'react'
import {Link,NavLink,useLocation} from 'react-router-dom'
import {CalendarDays,Goal,Heart,Menu,Newspaper,Search,Settings2,Trophy} from 'lucide-react'
import {LOCAL_COMPETITIONS,localCompetitionName} from './localCompetitions'
import {clearFavorites,DEFAULT_PREFERENCES,favoriteKey,getFavorites,savePreferences,toggleFavorite,useFavorites,usePreferences} from './localPreferences'

const sections=[
  {to:'/',label:'Matches',Icon:CalendarDays},
  {to:'/news',label:'News',Icon:Newspaper},
  {to:'/leagues',label:'Leagues',Icon:Trophy},
  {to:'/favorites',label:'Favorites',Icon:Heart},
  {to:'/more',label:'More',Icon:Menu},
]
export function AppHeader(){
  return <>
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="logo" aria-label="SoccerSense Matches home"><span className="logo-mark"><Goal size={22} aria-hidden="true"/></span>Soccer<span>Sense</span><sup>ALPHA</sup></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {sections.map(({to,label,Icon})=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={17} aria-hidden="true"/>{label}</NavLink>)}
        </nav>
        <div className="header-actions" aria-label="Quick actions">
          <NavLink to="/search" className="icon-action" aria-label="Search clubs and leagues" title="Search"><Search size={19}/></NavLink>
          <Link to="/?calendar=1" className="icon-action" aria-label="Open match calendar" title="Match calendar"><CalendarDays size={19}/></Link>
          <NavLink to="/settings" className="icon-action" aria-label="Settings" title="Settings"><Settings2 size={19}/></NavLink>
        </div>
      </div>
    </header>
    <nav className="mobile-bottom-nav" aria-label="Mobile primary navigation">
      {sections.map(({to,label,Icon})=><NavLink key={to} to={to} end={to==='/'} className={({isActive})=>isActive?'active':''}><Icon size={20} aria-hidden="true"/><span>{label}</span></NavLink>)}
    </nav>
  </>
}
function PageHeading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){
  return <div className="app-page-heading"><p className="kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
}
function FavoriteButton({kind,id,name,competition}:{kind:'league'|'team';id:string;name:string;competition?:typeof LOCAL_COMPETITIONS[number]['code']}){
  const items=useFavorites()
  const target=kind==='league'?{kind:'league' as const,id:id as typeof LOCAL_COMPETITIONS[number]['code'],name}:{kind:'team' as const,id,name,competition:competition!}
  const isSaved=items.some(item=>favoriteKey(item)===favoriteKey(target))
  return <button type="button" className={isSaved?'favorite-toggle saved':'favorite-toggle'}
    aria-pressed={isSaved} aria-label={(isSaved?'Remove ':'Save ')+name+' '+kind}
    onClick={()=>toggleFavorite(target)}><Heart size={16} fill={isSaved?'currentColor':'none'} aria-hidden="true"/>{isSaved?'Saved':'Save'}</button>
}
export {FavoriteButton}
export function LeaguesPage(){
  return <section aria-label="Leagues">
    <PageHeading eyebrow="DISCOVER FOOTBALL" title="Leagues" description="Choose a competition to explore its standings and clubs. Real tables load only when you request them locally."/>
    <div className="app-tile-grid">{LOCAL_COMPETITIONS.map((league,i)=><article className="app-tile" key={league.code}>
      <div className="league-symbol" aria-hidden="true">{String(i+1).padStart(2,'0')}</div>
      <div className="tile-body"><span className="tile-overline">COMPETITION</span><h2>{league.name}</h2><p>{import.meta.env.DEV?'Standings & club profiles':'Public preview: local data unavailable'}</p></div>
      <div className="tile-actions"><Link className="tile-link" to={'/standings?competition='+league.code}>View standings <span aria-hidden="true">›</span></Link><FavoriteButton kind="league" id={league.code} name={league.name}/></div>
    </article>)}</div>
  </section>
}
export function NewsPage(){
  const sources=[
    {name:'FIFA News',description:'International football and tournament coverage',url:'https://www.fifa.com/en/news'},
    {name:'UEFA News',description:'European competitions and football updates',url:'https://www.uefa.com/news-media/news/'},
    {name:'Premier League News',description:'Official English top-flight updates',url:'https://www.premierleague.com/en/news'},
  ]
  return <section aria-label="Football news">
    <PageHeading eyebrow="FOOTBALL STORIES" title="News" description="Explore official publishers. SoccerSense currently links to their websites rather than copying articles or claiming an automatically updated news feed."/>
    <div className="app-tile-grid">{sources.map(source=><article className="app-tile" key={source.url}>
      <div className="league-symbol"><Newspaper size={22} aria-hidden="true"/></div>
      <div className="tile-body"><span className="tile-overline">OFFICIAL SOURCE</span><h2>{source.name}</h2><p>{source.description}</p></div>
      <a className="tile-link" href={source.url} target="_blank" rel="noopener noreferrer">Read at source <span aria-hidden="true">↗</span></a>
    </article>)}</div>
    <p className="page-note">External links open their publishers' websites. No articles, images or headlines are reproduced here; availability and publication dates belong to the sources.</p>
  </section>
}
export function FavoritesPage(){
  const favorites=useFavorites()
  return <section aria-label="Favorites">
    <PageHeading eyebrow="YOUR FOOTBALL" title="Favorites" description="Save your favorite clubs and leagues on this device. No account, cloud sync or subscription required."/>
    {favorites.length===0?<div className="empty"><Heart size={34} aria-hidden="true"/><h3>Build your personal shortlist</h3><p>Save leagues from Leagues, or open a club through local standings and tap Save.</p><Link to="/leagues">Explore leagues</Link></div>:
    <><div className="favorites-list">{favorites.map(item=><div className="favorite-row" key={favoriteKey(item)}>
      <span className="league-symbol" aria-hidden="true">{item.kind==='league'?<Trophy size={18}/>:<Heart size={18}/>}</span>
      <div><strong>{item.name}</strong><span>{item.kind==='league'?'League':'Club · '+localCompetitionName(item.competition)}</span></div>
      <Link className="tile-link" to={'/standings?competition='+(item.kind==='league'?item.id:item.competition)}>{item.kind==='league'?'Standings':'Find in standings'}</Link>
      <button className="favorite-remove" type="button" onClick={()=>toggleFavorite(item)} aria-label={'Remove '+item.name+' from favorites'}>Remove</button>
    </div>)}</div><button type="button" className="subtle-button" onClick={()=>clearFavorites()}>Clear saved favorites</button></>}
    <p className="page-note">Favorite club profiles require a freshly loaded, verified standings table. Favorites remember club IDs and names only—not provider results or authentication data.</p>
  </section>
}
export function SearchPage(){
  const [query,setQuery]=useState('')
  const favorites=useFavorites()
  const normalized=query.trim().toLocaleLowerCase()
  const leagues=LOCAL_COMPETITIONS.filter(item=>item.name.toLocaleLowerCase().includes(normalized)||item.code.toLowerCase().includes(normalized))
  const clubs=favorites.filter(item=>item.kind==='team'&&item.name.toLocaleLowerCase().includes(normalized))
  return <section aria-label="Local search">
    <PageHeading eyebrow="QUICK DISCOVERY" title="Search" description="Find supported leagues and clubs you've saved locally. Search never contacts football-data.org or triggers a paid API."/>
    <label className="search-field"><Search size={20} aria-hidden="true"/><span className="sr-only">Search leagues and favorites</span><input autoFocus type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search leagues or saved clubs…" maxLength={80}/></label>
    <h2 className="results-heading">Leagues</h2>
    <div className="search-result-list">{leagues.map(l=><Link to={'/standings?competition='+l.code} key={l.code}><Trophy size={17} aria-hidden="true"/><span>{l.name}</span><span aria-hidden="true">›</span></Link>)}{leagues.length===0&&<p>No matching supported leagues.</p>}</div>
    <h2 className="results-heading">Saved clubs</h2>
    <div className="search-result-list">{clubs.map(item=><Link to={'/standings?competition='+item.competition} key={favoriteKey(item)}><Heart size={17} aria-hidden="true"/><span>{item.name} · {localCompetitionName(item.competition)}</span><span aria-hidden="true">›</span></Link>)}{clubs.length===0&&<p>No saved club matches. Club search requires a previously saved favorite.</p>}</div>
  </section>
}
export function MorePage(){
  return <section aria-label="More">
    <PageHeading eyebrow="SOCCERSENSE" title="More" description="Everything else you need, in one place."/>
    <div className="menu-list">
      <Link to="/settings"><Settings2 size={20} aria-hidden="true"/><span><strong>Settings</strong><small>Appearance, motion and privacy</small></span><span aria-hidden="true">›</span></Link>
      <Link to="/about"><Goal size={20} aria-hidden="true"/><span><strong>About SoccerSense</strong><small>Our project and data limitations</small></span><span aria-hidden="true">›</span></Link>
      <Link to="/search"><Search size={20} aria-hidden="true"/><span><strong>Search</strong><small>Leagues and saved clubs</small></span><span aria-hidden="true">›</span></Link>
    </div>
  </section>
}
export function SettingsPage(){
  const preferences=usePreferences()
  useEffect(()=>{
    document.documentElement.dataset.density=preferences.compactCards?'compact':'comfortable'
    document.documentElement.dataset.reduceMotion=preferences.reduceMotion?'true':'false'
  },[preferences])
  return <section aria-label="Settings">
    <PageHeading eyebrow="MAKE IT YOURS" title="Settings" description="Simple local preferences. No account is required and nothing is sent to our servers."/>
    <div className="settings-list">
      <label><span><strong>Compact match cards</strong><small>Show a denser match-card layout on desktop</small></span><input type="checkbox" checked={preferences.compactCards} onChange={e=>savePreferences({...preferences,compactCards:e.target.checked})}/></label>
      <label><span><strong>Reduce animations</strong><small>Turn off hover movement and interface transitions</small></span><input type="checkbox" checked={preferences.reduceMotion} onChange={e=>savePreferences({...preferences,reduceMotion:e.target.checked})}/></label>
    </div>
    <div className="settings-info"><h2>Time and data</h2><p><strong>Match dates:</strong> Korea Standard Time (KST) for the local match centre, including fixtures around UTC midnight.</p><p><strong>Data:</strong> Delayed provider information is displayed only in local development, after a manual Load action. No live score claims.</p><p><strong>Favorites:</strong> Stored in this browser. Clear them from Favorites, or remove site data in your browser settings.</p></div>
    <button type="button" className="subtle-button" onClick={()=>savePreferences(DEFAULT_PREFERENCES)}>Reset appearance preferences</button>
  </section>
}
export function ScrollToTop(){
  const location=useLocation()
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'})},[location.pathname])
  return null
}
