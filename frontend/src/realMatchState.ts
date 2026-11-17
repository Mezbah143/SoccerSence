import {validDay} from './dateNavigation'
import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import {parseLocalFixtures,type LocalFixture,type LocalFixturesResult} from './localFixtures'

/** Browser navigation state is not a trusted data source. Validate it again before display. */
export type VerifiedMatchState = {
  day: string
  zone:'UTC'|'KST'
  competition:LocalCompetitionCode
  result: LocalFixturesResult
  match: LocalFixture
}
export function readVerifiedMatchState(state: unknown, expectedId?: string): VerifiedMatchState | null {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return null
  const data=state as Record<string,unknown>
  if (typeof data.day !== 'string' || !validDay(data.day)) return null
  const zone=data.zone===undefined?'UTC':data.zone
  if(zone!=='UTC'&&zone!=='KST')return null
  const competition=data.competition===undefined?'PL':data.competition
  if(!isLocalCompetition(competition))return null
  try {
    const result=parseLocalFixtures(data.result,data.day,zone)
    const match=expectedId===undefined?result.matches[0]:result.matches.find(m=>m.id===expectedId)
    if (!match) return null
    return {day:data.day,competition,result,match,zone}
  } catch {
    return null
  }
}
