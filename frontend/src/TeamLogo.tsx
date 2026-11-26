import {useEffect,useState} from 'react'
import {approvedTeamLogoSrc,teamInitials} from './teamLogoRegistry'

/** One reusable, permission-gated logo UI. No network calls without a vetted asset. */
export function TeamLogo({teamId,teamName,size=40}:{teamId?:string|null;teamName:string;size?:number}){
  const logo=approvedTeamLogoSrc(teamId)
  const [failed,setFailed]=useState(false)
  useEffect(()=>setFailed(false),[logo])
  const pixels=Math.max(24,Math.min(size,80))
  return <span className="team-logo" style={{width:pixels,height:pixels}} aria-hidden="true" title={teamName}>
    {logo&&!failed?<img src={logo} alt="" width={pixels} height={pixels} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>:
      <span className="team-logo-placeholder">{teamInitials(teamName)}</span>}
  </span>
}
