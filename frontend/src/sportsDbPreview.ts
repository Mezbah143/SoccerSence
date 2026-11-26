/** M19: explicitly requested development-only artwork discovery, not a public logo license. */
export type SportsDbArtwork = {teamId:string;teamName:string;badgeUrl:string}
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
export function parseArsenalArtwork(value:unknown):SportsDbArtwork|null{
  if(!object(value)||!Array.isArray(value.teams))return null
  for(const candidate of value.teams){
    if(!object(candidate)||candidate.strSport!=='Soccer'||candidate.idTeam!=='133604'||candidate.strTeam!=='Arsenal')continue
    if(typeof candidate.strBadge!=='string')continue
    let url:URL
    try {url=new URL(candidate.strBadge)} catch {continue}
    if(url.protocol!=='https:'||!['r2.thesportsdb.com','www.thesportsdb.com'].includes(url.hostname)||
       !/^\/images\/media\/team\/badge\/[a-z0-9_-]+\.(?:png|webp)$/i.test(url.pathname)||
       url.username||url.password||url.search||url.hash)continue
    return {teamId:candidate.idTeam,teamName:candidate.strTeam,badgeUrl:url.href}
  }
  return null
}
export async function loadArsenalArtwork(signal?:AbortSignal):Promise<SportsDbArtwork>{
  const response=await fetch('/sportsdb-preview',{cache:'no-store',signal})
  if(!response.ok)throw Error('provider_unavailable')
  const result=parseArsenalArtwork(await response.json())
  if(!result)throw Error('invalid_artwork')
  return result
}
