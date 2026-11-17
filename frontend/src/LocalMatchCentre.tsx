import {useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {CalendarDays,Clock3,Info} from 'lucide-react'
import {loadLocalFixtures,utcKickoffLabel,type LocalFixturesResult} from './localFixtures'

const utcToday = () => new Date().toISOString().slice(0,10)
export function LocalMatchCentre({initialDate,initialResult}:{initialDate?:string;initialResult?:LocalFixturesResult|null}) {
  const [date,setDate]=useState(initialDate??utcToday)
  const [result,setResult]=useState<LocalFixturesResult|null>(initialResult??null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const controller=useRef<AbortController|null>(null)
  useEffect(()=>()=>controller.current?.abort(),[])
  const updateDate=(next:string)=>{
    controller.current?.abort()
    setDate(next)
    setResult(null)
    setError('')
    setLoading(false)
  }
  const request = async()=>{
    controller.current?.abort()
    const abort=new AbortController()
    controller.current=abort
    setResult(null)
    setError('')
    setLoading(true)
    try{
      const data=await loadLocalFixtures(date,abort.signal)
      if(!abort.signal.aborted)setResult(data)
    }catch(cause){
      if(!abort.signal.aborted)setError(cause instanceof Error&&cause.message==='rate_limited'
        ?'The local gateway has reached its request limit. Try again later; no automatic retries will be made.'
        :cause instanceof Error&&cause.message==='gateway_disabled'
          ?'The local gateway is disabled or blocked. Check the private server configuration.'
          :'Could not load verified fixtures. Check that the gateway is running and your local account is enabled.')
    }finally{
      if(!abort.signal.aborted)setLoading(false)
    }
  }
  return <section aria-label="Local real fixtures">
    <div className="section-title"><div><p className="kicker">LOCAL DATA EXPERIMENT</p><h2>Premier League fixtures</h2></div><span className="pill">Delayed scores</span></div>
    <p className="mode-hint"><Info size={16} aria-hidden="true"/> Local development only. Dates filter by <strong>UTC day</strong>; kickoff times show in Korea time (KST). Real data is fetched only when you press the button.</p>
    <div className="filters">
      <label>UTC date <input aria-label="UTC fixture date" type="date" value={date} onChange={event=>updateDate(event.target.value)}/></label>
      <button className="load-button" type="button" disabled={loading||!date} onClick={request}>{loading?'Loading…':'Load real fixtures'}</button>
    </div>
    {loading&&<div className="empty" role="status">Loading delayed fixtures from your local gateway…</div>}
    {error&&<div className="empty" role="alert"><h3>Fixtures unavailable</h3><p>{error}</p><p>No demo results have been substituted.</p></div>}
    {result&&<div role="status" className="source-panel">
      <strong>{result.source}</strong> · Delayed data · Retrieved {new Date(result.fetchedAt).toLocaleString('en-GB',{timeZone:'Asia/Seoul'})} KST
      <div>{result.attribution}</div>
    </div>}
    {result&&result.matches.length===0&&<div className="empty"><CalendarDays size={32} aria-hidden="true"/><h3>No fixtures for this UTC date</h3><p>Try another day. No fictional matches are displayed in this mode.</p></div>}
    {result&&result.matches.length>0&&<div className="match-grid">
      {result.matches.map(match=><Link to={'/real-match/'+match.id} state={{day:date,result}} className="match-card" key={match.id} aria-label={'Match details: '+match.home+' versus '+match.away}>
        <div className="match-meta"><span>● {match.competition}</span><span className="pill">{match.status==='FINISHED'?'Full time':match.status==='TIMED'?'Scheduled':match.status}</span></div>
        <div className="team"><span><b className="crest" aria-hidden="true">{match.home.slice(0,2).toUpperCase()}</b>{match.home}</span><strong>{match.homeScore??'–'}</strong></div>
        <div className="team"><span><b className="crest purple" aria-hidden="true">{match.away.slice(0,2).toUpperCase()}</b>{match.away}</span><strong>{match.awayScore??'–'}</strong></div>
        <div className="match-bottom"><Clock3 size={14} aria-hidden="true"/>{utcKickoffLabel(match.kickoffUtc)}<span>View details ›</span></div>
      </Link>)}
    </div>}
  </section>
}
