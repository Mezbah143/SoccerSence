/** Explicit free-tier evaluation allowlist; no arbitrary paid competition IDs. */
export const LOCAL_COMPETITIONS = [
  {code:'PL',name:'Premier League'},
  {code:'PD',name:'La Liga'},
  {code:'BL1',name:'Bundesliga'},
  {code:'SA',name:'Serie A'},
  {code:'FL1',name:'Ligue 1'},
  {code:'DED',name:'Eredivisie'},
] as const
export type LocalCompetitionCode = typeof LOCAL_COMPETITIONS[number]['code']
export function isLocalCompetition(value:unknown):value is LocalCompetitionCode {
  return typeof value==='string' && LOCAL_COMPETITIONS.some(c=>c.code===value)
}
export function localCompetitionName(code:LocalCompetitionCode):string {
  return LOCAL_COMPETITIONS.find(c=>c.code===code)?.name ?? code
}
