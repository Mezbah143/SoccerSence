/** Explicit free-tier evaluation allowlist; no arbitrary paid competition IDs. */
export const LOCAL_COMPETITIONS = [
  {code:'PL',name:'Premier League'},
  {code:'PD',name:'La Liga'},
  {code:'BL1',name:'Bundesliga'},
  {code:'SA',name:'Serie A'},
  {code:'FL1',name:'Ligue 1'},
  {code:'DED',name:'Eredivisie'},
  {code:'CL',name:'UEFA Champions League'},
  {code:'WC',name:'FIFA World Cup'},
  {code:'EC',name:'UEFA European Championship'},
] as const
export type LocalCompetitionCode = typeof LOCAL_COMPETITIONS[number]['code']
export function isLocalCompetition(value:unknown):value is LocalCompetitionCode {
  return typeof value==='string' && LOCAL_COMPETITIONS.some(c=>c.code===value)
}
export function localCompetitionName(code:LocalCompetitionCode):string {
  return LOCAL_COMPETITIONS.find(c=>c.code===code)?.name ?? code
}

/** Stable football-data.org competition identifiers, server allowlist only. */
export const LOCAL_COMPETITION_IDS: Record<LocalCompetitionCode,number> = {
  PL:2021, PD:2014, BL1:2002, SA:2019, FL1:2015, DED:2003,
  CL:2001, WC:2000, EC:2018,
}
export function codeFromProviderId(id:unknown):LocalCompetitionCode|null {
  const found=LOCAL_COMPETITIONS.find(c=>LOCAL_COMPETITION_IDS[c.code]===id)
  return found?.code??null
}

/** Separate international national-team tournaments from club competitions. */
export const isInternationalCompetition=(code:LocalCompetitionCode)=>code==='WC'||code==='EC'
