import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import type {TeamDetails,TeamResult} from './providers/team'
const ATTRIBUTION='Football data provided by the Football-Data.org API'
const obj=(v:unknown):Record<string,unknown>|null=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null
const label=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=240&&!!v.trim()
const id=(v:unknown):v is string=>typeof v==='string'&&/^[1-9]\d{0,8}$/.test(v)
const nullable=(v:unknown):v is string|null=>v===null||label(v)
const score=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0
export type TeamExtraEnvelope = {source:'football-data.org';freshness:'delayed';fetchedAt:string;attribution:typeof ATTRIBUTION}
export function parseTeamExtra(value:unknown,kind:'team'|'team-matches',teamId:string): TeamExtraEnvelope & {team?:TeamDetails;matches?:TeamResult[]} {
  const data=obj(value)
  if(!data||data.source!=='football-data.org'||data.freshness!=='delayed'||
    data.attribution!==ATTRIBUTION||typeof data.fetchedAt!=='string'||!Number.isFinite(Date.parse(data.fetchedAt)))throw Error('invalid_response')
  const meta={source:'football-data.org' as const,freshness:'delayed' as const,fetchedAt:data.fetchedAt,attribution:ATTRIBUTION}
  if(kind==='team'){
    const t=obj(data.team)
    if(!t||t.id!==teamId||!label(t.name)||!nullable(t.shortName)||!nullable(t.venue)||!nullable(t.area)||
      !(t.founded===null||(typeof t.founded==='number'&&Number.isSafeInteger(t.founded)&&t.founded>=1800&&t.founded<=2100)))throw Error('invalid_response')
    return {...meta,team:{id:teamId,name:t.name,shortName:t.shortName,venue:t.venue,area:t.area,founded:t.founded} as TeamDetails}
  }
  if(!Array.isArray(data.matches)||data.matches.length>5)throw Error('invalid_response')
  const seen=new Set<string>()
  const matches:TeamResult[]=data.matches.map((item:unknown)=>{
    const m=obj(item)
    if(!m||!id(m.id)||seen.has(m.id)||!label(m.home)||!label(m.away)||
      typeof m.utcDate!=='string'||!Number.isFinite(Date.parse(m.utcDate))||
      !id(m.homeTeamId)||!id(m.awayTeamId)||(m.homeTeamId!==teamId&&m.awayTeamId!==teamId)||
      !score(m.homeScore)||!score(m.awayScore))throw Error('invalid_response')
    seen.add(m.id)
    return {id:m.id,utcDate:m.utcDate,home:m.home,away:m.away,
      homeTeamId:m.homeTeamId,awayTeamId:m.awayTeamId,homeScore:m.homeScore,awayScore:m.awayScore}
  })
  return {...meta,matches}
}
export async function loadTeamExtra(competition:LocalCompetitionCode,teamId:string,kind:'team'|'team-matches',signal?:AbortSignal){
  if(!isLocalCompetition(competition)||!id(teamId))throw Error('invalid_request')
  const path=kind==='team'?'/api/team':'/api/team-matches'
  const response=await fetch(path+'?competition='+competition+'&id='+teamId,{method:'GET',cache:'no-store',signal})
  if(!response.ok){
    if(response.status===429)throw Error('rate_limited')
    if(response.status===403)throw Error('team_not_allowed')
    if(response.status===503)throw Error('team_endpoint_unavailable')
    if(response.status===404)throw Error('team_data_unavailable')
    throw Error('gateway_unavailable')
  }
  return parseTeamExtra(await response.json(),kind,teamId)
}
