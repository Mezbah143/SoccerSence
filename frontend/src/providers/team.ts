/** Strict and minimal football-data.org team data views. No images, URLs, squads or upstream metadata. */
export type TeamDetails = {id:string;name:string;shortName:string|null;venue:string|null;founded:number|null;area:string|null}
export type TeamResult = {id:string;utcDate:string;home:string;away:string;homeScore:number;awayScore:number;homeTeamId:string;awayTeamId:string}
const obj=(v:unknown):Record<string,unknown>|null=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null
const positive=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>0
const score=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0
const label=(v:unknown):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=240
const optionalLabel=(v:unknown)=>v===null||v===undefined?null:label(v)?v:null
export function normalizeTeamDetails(value:unknown,expectedId:string):TeamDetails|null{
  const v=obj(value)
  if(!v||!positive(v.id)||String(v.id)!==expectedId||!label(v.name))return null
  const founded=v.founded===null||v.founded===undefined?null:
    typeof v.founded==='number'&&Number.isSafeInteger(v.founded)&&v.founded>=1800&&v.founded<=2100?v.founded:null
  const area=obj(v.area)
  return {id:expectedId,name:v.name,shortName:optionalLabel(v.shortName),venue:optionalLabel(v.venue),founded,area:optionalLabel(area?.name)}
}
export function normalizeTeamResults(value:unknown,expectedId:string):TeamResult[]|null{
  const data=obj(value)
  if(!data||!Array.isArray(data.matches)||data.matches.length>5)return null
  const ids=new Set<string>()
  const matches:TeamResult[]=[]
  for(const item of data.matches){
    const v=obj(item),home=obj(v?.homeTeam),away=obj(v?.awayTeam),scores=obj(obj(v?.score)?.fullTime)
    if(!v||!positive(v.id)||ids.has(String(v.id))||v.status!=='FINISHED'||
      typeof v.utcDate!=='string'||!Number.isFinite(Date.parse(v.utcDate))||
      !home||!away||!positive(home.id)||!positive(away.id)||
      (String(home.id)!==expectedId&&String(away.id)!==expectedId)||
      !label(home.name)||!label(away.name)||!scores||!score(scores.home)||!score(scores.away))return null
    ids.add(String(v.id))
    matches.push({id:String(v.id),utcDate:new Date(v.utcDate).toISOString(),home:home.name,away:away.name,
      homeScore:scores.home,awayScore:scores.away,homeTeamId:String(home.id),awayTeamId:String(away.id)})
  }
  return matches.sort((a,b)=>b.utcDate.localeCompare(a.utcDate))
}
