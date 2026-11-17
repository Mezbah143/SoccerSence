import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import {parseLocalFixtures,type LocalFixture,type LocalFixturesResult} from './localFixtures'

/** Browser navigation state is not a trusted data source. Validate it again before display. */
export type VerifiedMatchState = {
  day: string
  competition:LocalCompetitionCode
  result: LocalFixturesResult
  match: LocalFixture
}
export function readVerifiedMatchState(state: unknown, expectedId?: string): VerifiedMatchState | null {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return null
  const data=state as Record<string,unknown>
  if (typeof data.day !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.day) ||
      !Number.isFinite(Date.parse(data.day)) ||
      new Date(data.day).toISOString().slice(0,10)!==data.day) return null
  const competition=data.competition===undefined?'PL':data.competition
  if(!isLocalCompetition(competition))return null
  try {
    const result=parseLocalFixtures(data.result,data.day)
    const match=expectedId===undefined?result.matches[0]:result.matches.find(m=>m.id===expectedId)
    if (!match) return null
    return {day:data.day,competition,result,match}
  } catch {
    return null
  }
}
