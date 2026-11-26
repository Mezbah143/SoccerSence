import {useEffect,useMemo,useRef,useState} from 'react'
import {TeamLogo} from './TeamLogo'
import {Link,useLocation} from 'react-router-dom'
import {CalendarDays,ChevronLeft,ChevronRight,Clock3,Info,Star,Trophy} from 'lucide-react'
import {shiftDay,todayInKst,validDay} from './dateNavigation'
import {LOCAL_COMPETITIONS,isLocalCompetition,isInternationalCompetition} from './localCompetitions'
import {loadLocalFixtures,utcKickoffLabel} from './localFixtures'
import {presentMatch} from './matchPresentation'
import {getCachedDay,loadMatchDay,orderedCompetitions,storeMatchDayResult,type DayResults} from './multiLeagueFixtures'
import {useFavorites} from './localPreferences'
import {readVerifiedMatchState} from './realMatchState'
import {aggregateErrorMessage,autoResultsAvailable,loadAggregatedDay} from './aggregatedFixtures'

export function AllLeaguesMatchCentre(){
  const location=useLocation()
  const restored=readVerifiedMatchState(location.state)
  const shortcut=new URLSearchParams(location.search).get('competition')
  const favoriteItems=useFavorites()
  const [day,setDay]=useState(restored?.day??todayInKst)
  const [responses,setResponses]=useState<DayResults>(()=>getCachedDay(restored?.day??todayInKst()))
  const [busy,setBusy]=useState(false)
  const [autoLoading,setAutoLoading]=useState(true)
  const [autoError,setAutoError]=useState('')
  const [showLoadingInfo,setShowLoadingInfo]=useState(false)
  const [progress,setProgress]=useState<{done:number;total:number}>({done:0,total:LOCAL_COMPETITIONS.length})
  const abort=useRef<AbortController|null>(null)
  const order=useMemo(()=>orderedCompetitions(favoriteItems,isLocalCompetition(shortcut)?shortcut:undefined).sort((a,b)=>Number(isInternationalCompetition(a.code))-Number(isInternationalCompetition(b.code))),[favoriteItems,shortcut])
  useEffect(()=>{
    if(restored&&restored.zone==='KST'){
      storeMatchDayResult(restored.day,restored.competition,restored.result)
      setResponses(getCachedDay(restored.day))
    }
    // Back-navigation recovery is performed once at mount; no provider fetch.
  },[])
  useEffect(()=>()=>abort.current?.abort(),[])
  useEffect(()=>{
    const cached=getCachedDay(day)
    if(autoResultsAvailable(cached)){setAutoLoading(false);setAutoError('');return}
    const controller=new AbortController()
    setAutoLoading(true)
    setAutoError('')
    // Debounce date scrubbing; one consolidated request, not six requests.
    const timer=setTimeout(()=>{
      void loadAggregatedDay(day,controller.signal).then(result=>{
        if(!controller.signal.aborted)setResponses(current=>({...current,...result}))
      }).catch(error=>{
        if(!controller.signal.aborted)setAutoError(aggregateErrorMessage(error))
      }).finally(()=>{if(!controller.signal.aborted)setAutoLoading(false)})
    },700)
    return ()=>{clearTimeout(timer);controller.abort()}
  },[day])
  useEffect(()=>{
    if(new URLSearchParams(location.search).get('calendar')==='1')document.getElementById('all-leagues-kst-date')?.focus()
  },[location.search])
  function changeDay(next:string){
    if(!validDay(next)||next===day)return
    abort.current?.abort()
    setBusy(false)
    setAutoError('')
    setAutoLoading(true)
    setProgress({done:0,total:LOCAL_COMPETITIONS.length})
    setDay(next)
    setResponses(getCachedDay(next))
  }
  async function loadAll(){
    if(!validDay(day)||busy||autoLoading)return
    const controller=new AbortController()
    abort.current=controller
    setBusy(true)
    setProgress({done:0,total:LOCAL_COMPETITIONS.length})
    try{
      await loadMatchDay(day,controller.signal,
        (selected,signal,code)=>loadLocalFixtures(selected,signal,code,'KST'),
        (code,value)=>{if(!controller.signal.aborted)setResponses(current=>({...current,[code]:value}))},
        (done,total)=>{if(!controller.signal.aborted)setProgress({done,total})},
        order.map(c=>c.code))
    }finally{if(!controller.signal.aborted)setBusy(false)}
  }
  const ready=LOCAL_COMPETITIONS.filter(c=>responses[c.code]?.result).length
  const totalMatches=LOCAL_COMPETITIONS.reduce((count,c)=>count+(responses[c.code]?.result?.matches.length??0),0)
  const dateOptions=validDay(day)?[-2,-1,0,1,2].map(offset=>shiftDay(day,offset)):[]
  return <section className="m11-centre" aria-label="All leagues fixtures">
    <div className="m11-heading">
      <div><p className="kicker">ALL-LEAGUES MATCH CENTRE</p><h1>Matches & fixtures</h1><p>{LOCAL_COMPETITIONS.length} competitions · Korean calendar (KST) · Delayed scores</p></div>
      <span className="pill">{ready} / {LOCAL_COMPETITIONS.length} competitions loaded · {totalMatches} fixtures</span>
    </div>
    <div className="m11-date-strip" role="group" aria-label="KST fixture date">
      <button type="button" className="m11-date-arrow" disabled={!validDay(day)} onClick={()=>changeDay(shiftDay(day,-1))} aria-label="Previous Korean day"><ChevronLeft size={19}/></button>
      {dateOptions.map(value=><button type="button" key={value} aria-pressed={value===day} className={value===day?'m11-date-item selected':'m11-date-item'} onClick={()=>changeDay(value)}>
        <span>{new Intl.DateTimeFormat('en-GB',{timeZone:'UTC',weekday:'short'}).format(new Date(value+'T12:00:00Z'))}</span>
        <strong>{value.slice(-2)}</strong>
        <small>{value===todayInKst()?'Today':value.slice(5,7)+' / '+value.slice(0,4)}</small>
      </button>)}
      <button type="button" className="m11-date-arrow" disabled={!validDay(day)} onClick={()=>changeDay(shiftDay(day,1))} aria-label="Next Korean day"><ChevronRight size={19}/></button>
      <label className="m11-calendar"><CalendarDays size={18} aria-hidden="true"/><span className="sr-only">Korean date</span><input id="all-leagues-kst-date" type="date" aria-label="Korean match date" value={day} onChange={e=>changeDay(e.target.value)}/></label>
    </div>
    <div className="m11-load-bar">
      <div className="m14-load-caption"><Info size={16} aria-hidden="true"/><span>Automatic KST fixtures · delayed data · one consolidated request per date</span>
        <button type="button" className="m14-help-toggle" aria-expanded={showLoadingInfo} onClick={()=>setShowLoadingInfo(v=>!v)}>{showLoadingInfo?'Hide details':'How loading works'}</button>
      </div>
      {showLoadingInfo&&<p className="m14-load-details">Nine supported competitions share one private, quota-limited request. Previously loaded results are reused in memory. No polling or automatic retries. The manual button is a fallback.</p>}
      <button className="load-button" type="button" disabled={busy||autoLoading||!validDay(day)||ready===LOCAL_COMPETITIONS.length} onClick={loadAll}>{busy?`Loading leagues… ${progress.done}/${progress.total}`:ready===LOCAL_COMPETITIONS.length?'All leagues loaded':ready>0?'Load remaining fixtures':'Load all fixtures'}</button>
    </div>
    {autoLoading&&<p className="m11-progress" role="status">Checking nine competitions for {day} KST…</p>}
    {autoError&&<div className="m11-league-notice m11-error" role="alert"><strong>Automatic loading unavailable.</strong> {autoError} <span>Use “Load all fixtures” only if you want to spend additional gateway requests.</span></div>}
    {busy&&<p className="m11-progress" role="status">Loading {progress.done} of {progress.total} competitions. Sequential only; no retries or refresh polling.</p>}
    <div className="m11-league-sections">
      {order.map((league,index)=>{
        const item=responses[league.code]
        const result=item?.result
        const isFavorite=favoriteItems.some(f=>f.kind==='league'&&f.id===league.code)
        const international=isInternationalCompetition(league.code)
        const statusText=result?result.matches.length+' match'+(result.matches.length===1?'':'es'):item?.error?'Error':'Not loaded'
        return <div className="m13-competition-wrap" key={league.code}>
          {(index===0 || (international&&!isInternationalCompetition(order[index-1].code)))&&
            <div className="m13-group-heading"><h2>{international?'International tournaments':'Club competitions'}</h2><p>{international?'National teams · World Cup and European Championship':'Domestic leagues and UEFA Champions League'}</p></div>}
          <section className="m11-league" aria-label={league.name+' fixtures'}>
          <div className="m11-league-heading">
            <div><Trophy size={21} aria-hidden="true"/><h2>{league.name}</h2>{isFavorite&&<Star size={15} aria-label="Saved league" className="m11-saved-star"/>}<span className="m14-league-count">{statusText}</span></div>
            <Link to={'/standings?competition='+league.code} aria-label={'View '+league.name+' standings'}>Standings <ChevronRight size={16} aria-hidden="true"/></Link>
          </div>
          {item?.error&&<div className="m11-league-notice m11-error" role="alert">{item.error}</div>}
          {!item?.error&&!result&&<div className="m11-league-notice">{autoLoading?'Checking fixtures…':'Not loaded. You can use the manual fallback.'}</div>}
          {result&&<div className="m11-league-source">Delayed · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST · {result.attribution}</div>}
          {result&&result.matches.length===0&&<div className="m11-league-notice">No matches returned for {day} KST.</div>}
          {result&&result.matches.length>0&&<div className="m11-matches">
            {result.matches.map(match=><Link className="m11-fixture-card" to={'/real-match/'+match.id} key={match.id} state={{mode:'local',day,result,competition:league.code,zone:'KST'}}>
              <span className="m11-fixture-time"><Clock3 size={14} aria-hidden="true"/> {utcKickoffLabel(match.kickoffUtc)}</span>
              <div className="m11-fixture-clubs">
                <div><TeamLogo teamId={match.homeTeamId} teamName={match.home} size={36}/><strong>{match.home}</strong><b>{match.homeScore??'–'}</b></div>
                <div><TeamLogo teamId={match.awayTeamId} teamName={match.away} size={36}/><strong>{match.away}</strong><b>{match.awayScore??'–'}</b></div>
              </div>
              <span className={'m11-fixture-status m6-status-'+presentMatch(match).tone}>{presentMatch(match).label}</span>
            </Link>)}
          </div>}
        </section></div>
      })}
    </div>
    <p className="page-note">Source: football-data.org when loaded. All scores are delayed, not live. Results are stored only in temporary browser memory for local development, not published or persisted.</p>
  </section>
}
