import {useEffect,useRef,useState} from 'react'
import {loadArsenalArtwork,type SportsDbArtwork} from './sportsDbPreview'

/** Free-plan manual experiment, only rendered in local Vite development Settings. */
export function SportsDbArtworkPreview(){
  const [result,setResult]=useState<SportsDbArtwork|null>(null)
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const abort=useRef<AbortController|null>(null)
  useEffect(()=>()=>abort.current?.abort(),[])
  if(!import.meta.env.DEV)return null
  async function tryPreview(){
    abort.current?.abort()
    const controller=new AbortController()
    abort.current=controller
    setError('');setResult(null);setLoading(true)
    try{
      const data=await loadArsenalArtwork(controller.signal)
      if(!controller.signal.aborted)setResult(data)
    }catch{
      if(!controller.signal.aborted)setError('TheSportsDB free artwork preview could not be verified. The app will keep its neutral badges.')
    }finally{if(!controller.signal.aborted)setLoading(false)}
  }
  return <section className="m19-artwork-preview" aria-label="TheSportsDB artwork development test">
    <h2>TheSportsDB — artwork test</h2>
    <p>Optional, manual test of the free V1 shared key (123). This checks <strong>Arsenal only</strong>, as the free search endpoint has limited coverage. It does not change SoccerSense match-card crests.</p>
    <button className="load-button" type="button" onClick={tryPreview} disabled={loading}>{loading?'Checking TheSportsDB…':'Test Arsenal badge'}</button>
    {error&&<p role="alert">{error}</p>}
    {result&&<div className="m19-artwork-result" role="status">
      <img src={result.badgeUrl} alt="Arsenal artwork supplied by TheSportsDB for local testing" width={80} height={80} loading="lazy" referrerPolicy="no-referrer"/>
      <div><strong>{result.teamName}</strong><p>TheSportsDB team ID: {result.teamId}</p><p>Preview only · Rights for public redistribution are not verified.</p></div>
    </div>}
    <p>Source: <a href="https://www.thesportsdb.com" target="_blank" rel="noopener noreferrer">TheSportsDB</a>. Free artwork discovery is for development; public or app-store use must comply with the provider's terms and the rights of logo owners. No image is copied into the repository.</p>
  </section>
}
