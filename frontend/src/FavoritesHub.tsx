import {useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import {ArrowDown,ArrowUp,Heart,Search,Star,Trophy,Trash2} from 'lucide-react'
import {LOCAL_COMPETITIONS,localCompetitionName} from './localCompetitions'
import {clearFavorites,favoriteKey,moveFavorite,toggleFavorite,useFavorites,type Favorite} from './localPreferences'

type Scope='all'|'league'|'team'
export function favoriteMatches(item:Favorite,scope:Scope,query:string){
  if(scope!=='all'&&item.kind!==scope)return false
  const text=query.trim().toLocaleLowerCase()
  return text.length===0||item.name.toLocaleLowerCase().includes(text)||
    (item.kind==='league'?item.id:item.competition).toLocaleLowerCase().includes(text)||
    (item.kind==='team'&&localCompetitionName(item.competition).toLocaleLowerCase().includes(text))
}

export function FavoritesHub(){
  const saved=useFavorites()
  const [scope,setScope]=useState<Scope>('all')
  const [search,setSearch]=useState('')
  const [confirmClear,setConfirmClear]=useState(false)
  const counts={all:saved.length,league:saved.filter(x=>x.kind==='league').length,team:saved.filter(x=>x.kind==='team').length}
  const filtered=useMemo(()=>saved.filter(x=>favoriteMatches(x,scope,search)),[saved,scope,search])
  const canReorder=scope==='all'&&search.trim()===''
  const names:{scope:Scope;label:string}[]=[{scope:'all',label:'All'},{scope:'league',label:'Leagues'},{scope:'team',label:'Clubs'}]
  return <section aria-label="Your favorite football">
    <div className="app-page-heading">
      <p className="kicker">PERSONAL MATCHDAY</p>
      <h1>Your favorites</h1>
      <p>Keep your leagues and clubs in one place. Everything is stored in this browser—no account, tracking, or football API calls.</p>
    </div>
    <div className="m8-overview" aria-label="Saved favorites summary">
      <div><Heart size={20} aria-hidden="true"/><strong>{counts.all}</strong><span>Saved total</span></div>
      <div><Trophy size={20} aria-hidden="true"/><strong>{counts.league}</strong><span>Leagues</span></div>
      <div><Star size={20} aria-hidden="true"/><strong>{counts.team}</strong><span>Clubs</span></div>
    </div>
    {saved.length===0?<div className="empty"><Heart size={34} aria-hidden="true"/><h3>Your matchday starts here</h3><p>Choose leagues to follow, then save clubs from verified local standings. Your shortlist stays on this device.</p><Link to="/leagues">Explore competitions</Link></div>:
      <>
        <div className="m8-toolbar">
          <div className="m8-tabs" role="group" aria-label="Favorite type">
            {names.map(item=><button type="button" key={item.scope} aria-pressed={scope===item.scope}
              className={scope===item.scope?'selected':''} onClick={()=>{setScope(item.scope);setConfirmClear(false)}}>{item.label} <span>{counts[item.scope]}</span></button>)}
          </div>
          <label className="m8-search"><Search size={17} aria-hidden="true"/><span className="sr-only">Filter favorites</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} type="search" maxLength={80} placeholder="Filter saved items…"/></label>
        </div>
        {filtered.length===0?<div className="m8-no-results" role="status">No saved items match this filter. <button type="button" onClick={()=>{setSearch('');setScope('all')}}>Show all favorites</button></div>:
          <div className="m8-favorites-list">
            {filtered.map(item=>{
              const index=saved.findIndex(entry=>favoriteKey(entry)===favoriteKey(item))
              const label=item.kind==='league'?localCompetitionName(item.id):localCompetitionName(item.competition)
              const competition=item.kind==='league'?item.id:item.competition
              return <article className="m8-favorite-card" key={favoriteKey(item)}>
                <span className="league-symbol" aria-hidden="true">{item.kind==='league'?<Trophy size={20}/>:<Star size={20}/>}</span>
                <div className="m8-favorite-main"><span className="tile-overline">{item.kind==='league'?'SAVED LEAGUE':'SAVED CLUB · '+label}</span><h2>{item.name}</h2>
                  {item.kind==='team'&&<p>Club profiles require loading a verified standings table; no unverified direct links are used.</p>}
                </div>
                <div className="m8-favorite-actions">
                  {item.kind==='league'&&<Link className="tile-link" to={'/?competition='+item.id}>Matches</Link>}
                  <Link className="tile-link" to={'/standings?competition='+competition}>{item.kind==='league'?'Standings':'Find in standings'}</Link>
                  <button type="button" className="favorite-remove" onClick={()=>toggleFavorite(item)} aria-label={'Remove '+item.name+' from favorites'}><Trash2 size={15} aria-hidden="true"/> Remove</button>
                </div>
                {canReorder&&<div className="m8-order-actions" aria-label={'Reorder '+item.name}>
                  <button type="button" aria-label={'Move '+item.name+' up'} title="Move up" disabled={index===0} onClick={()=>moveFavorite(item,-1)}><ArrowUp size={17}/></button>
                  <button type="button" aria-label={'Move '+item.name+' down'} title="Move down" disabled={index===saved.length-1} onClick={()=>moveFavorite(item,1)}><ArrowDown size={17}/></button>
                </div>}
              </article>
            })}
          </div>}
        <div className="m8-footer-actions">
          {confirmClear?<div className="m8-confirm" role="group" aria-label="Confirm clearing favorites"><strong>Remove all {saved.length} saved favorites?</strong>
            <button type="button" className="favorite-remove" onClick={()=>{clearFavorites();setConfirmClear(false);setScope('all');setSearch('')}}>Yes, clear all</button>
            <button type="button" className="subtle-button" onClick={()=>setConfirmClear(false)}>Cancel</button>
          </div>:<button type="button" className="subtle-button" onClick={()=>setConfirmClear(true)}>Clear all favorites</button>}
          <Link className="tile-link" to="/leagues">Explore leagues</Link>
        </div>
      </>
    }
    <p className="page-note">This page saves only allowlisted competition codes, club IDs, and names (up to 30 entries). It does not store verified provider responses, synchronize devices, or automatically retrieve scores. Saved club links return to the relevant league's standings.</p>
    <div className="m8-available-leagues"><h2>Quick competition shortcuts</h2><div>{LOCAL_COMPETITIONS.map(l=><Link key={l.code} to={'/standings?competition='+l.code}>{l.name}</Link>)}</div></div>
  </section>
}
