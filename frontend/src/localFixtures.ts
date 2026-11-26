import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
import {fixtureDay,validDay} from './dateNavigation'
/**
 * Browser-facing, development-only local gateway client.
 * Never sends or reads provider credentials. Browser uses Vite's same-origin
 * loopback proxy; the private gateway remains on 127.0.0.1:8787.
 */
export type LocalFixture = {
  id: string
  competition: string
  home: string
  away: string
  homeTeamId: string | null
  awayTeamId: string | null
  kickoffUtc: string
  status: string
  homeScore: number | null
  awayScore: number | null
  source: 'football-data.org'
  fetchedAt: string
  freshness: 'delayed'
}
export type LocalFixturesResult = {
  matches: LocalFixture[]
  source: 'football-data.org'
  fetchedAt: string
  freshness: 'delayed'
  attribution: string
}
const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))
const validTeamId = (value: unknown) => value === null || (typeof value === 'string' && /^[1-9]\\d{0,14}$/.test(value))
const validScore = (value: unknown) =>
  value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value >= 0)

export function parseLocalFixtures(value: unknown, requestedDate: string, zone:'UTC'|'KST'='UTC'): LocalFixturesResult {
  if (!isObject(value) || value.source !== 'football-data.org' ||
      value.freshness !== 'delayed' || !isDate(value.fetchedAt) ||
      value.attribution !== 'Football data provided by the Football-Data.org API' ||
      !Array.isArray(value.matches)) throw new Error('invalid_response')
  const matches: LocalFixture[] = value.matches.map((item: unknown) => {
    if (!isObject(item) || typeof item.id !== 'string' ||
        typeof item.home !== 'string' || typeof item.away !== 'string' ||
        typeof item.competition !== 'string' || typeof item.status !== 'string' ||
        !isDate(item.kickoffUtc) || fixtureDay(item.kickoffUtc,zone) !== requestedDate ||
        !validScore(item.homeScore) || !validScore(item.awayScore) ||
        !validTeamId(item.homeTeamId ?? null) || !validTeamId(item.awayTeamId ?? null)) throw new Error('invalid_response')
    return {
      id: item.id, home: item.home, away: item.away,
      homeTeamId:(item.homeTeamId as string | null | undefined) ?? null,
      awayTeamId:(item.awayTeamId as string | null | undefined) ?? null,
      competition: item.competition, status: item.status,
      kickoffUtc: item.kickoffUtc,
      homeScore: item.homeScore as number | null,
      awayScore: item.awayScore as number | null,
      source: 'football-data.org',
      fetchedAt: value.fetchedAt as string,
      freshness: 'delayed',
    }
  })
  return {
    matches, source:'football-data.org',
    freshness:'delayed', fetchedAt:value.fetchedAt,
    attribution:value.attribution as string,
  }
}
export async function loadLocalFixtures(date: string, signal?: AbortSignal, competition:LocalCompetitionCode='PL', zone:'UTC'|'KST'='UTC'): Promise<LocalFixturesResult> {
  if(!isLocalCompetition(competition))throw new Error('invalid_competition')
  if (!validDay(date)) throw new Error('invalid_date')
  const response = await fetch('/api/fixtures?competition=' + competition + '&date=' + encodeURIComponent(date) + (zone==='KST'?'&tz=KST':''),{
    method:'GET',cache:'no-store',signal,
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('rate_limited')
    if (response.status === 503) throw new Error('gateway_disabled')
    throw new Error('gateway_unavailable')
  }
  return parseLocalFixtures(await response.json(),date,zone)
}
export function utcKickoffLabel(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone:'Asia/Seoul', month:'short',day:'numeric',
    hour:'2-digit',minute:'2-digit',hour12:false,
  }).format(new Date(value))+' KST'
}
