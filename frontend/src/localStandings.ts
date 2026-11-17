import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'
/**
 * Local-development browser client for normalized standings.
 * All provider access and the private token stay behind the loopback gateway.
 */
export type StandingRow = {
  position: number
  teamId: string
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}
export type StandingTable = {stage: string; group: string | null; rows: StandingRow[]}
export type LocalStandingsResult = {
  competition: string
  tables: StandingTable[]
  source: 'football-data.org'
  freshness: 'delayed'
  fetchedAt: string
  attribution: 'Football data provided by the Football-Data.org API'
}
const object = (value: unknown): value is Record<string,unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)
const label = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value)
const natural = (value: unknown): value is number => integer(value) && value >= 0
const validTime = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value))

export function parseLocalStandings(data: unknown): LocalStandingsResult {
  if (!object(data) || !label(data.competition) || !Array.isArray(data.tables) ||
      data.source !== 'football-data.org' || data.freshness !== 'delayed' ||
      !validTime(data.fetchedAt) ||
      data.attribution !== 'Football data provided by the Football-Data.org API') {
    throw new Error('invalid_response')
  }
  const tables: StandingTable[] = data.tables.map((candidate: unknown) => {
    if (!object(candidate) || !label(candidate.stage) ||
        !(candidate.group === null || label(candidate.group)) ||
        !Array.isArray(candidate.rows)) throw new Error('invalid_response')
    const seen = new Set<string>()
    const rows: StandingRow[] = candidate.rows.map((candidateRow: unknown) => {
      if (!object(candidateRow) ||
          !natural(candidateRow.position) || candidateRow.position === 0 ||
          !label(candidateRow.teamId) || !/^\d+$/.test(candidateRow.teamId) ||
          !label(candidateRow.team) || !natural(candidateRow.played) ||
          !natural(candidateRow.won) || !natural(candidateRow.drawn) ||
          !natural(candidateRow.lost) || !integer(candidateRow.points) ||
          !natural(candidateRow.goalsFor) || !natural(candidateRow.goalsAgainst) ||
          !integer(candidateRow.goalDifference) || seen.has(candidateRow.teamId)) {
        throw new Error('invalid_response')
      }
      seen.add(candidateRow.teamId)
      return {
        position: candidateRow.position, teamId: candidateRow.teamId,
        team: candidateRow.team, played: candidateRow.played, won: candidateRow.won,
        drawn: candidateRow.drawn, lost: candidateRow.lost, points: candidateRow.points,
        goalsFor: candidateRow.goalsFor, goalsAgainst: candidateRow.goalsAgainst,
        goalDifference: candidateRow.goalDifference,
      }
    })
    return {stage:candidate.stage,group:candidate.group,rows}
  })
  return {
    competition:data.competition, tables, source:'football-data.org',
    freshness:'delayed',fetchedAt:data.fetchedAt,
    attribution:'Football data provided by the Football-Data.org API',
  }
}

export async function loadLocalStandings(signal?: AbortSignal, competition:LocalCompetitionCode='PL'): Promise<LocalStandingsResult> {
  if(!isLocalCompetition(competition))throw new Error('invalid_competition')
  const response = await fetch('/api/standings?competition='+competition,{
    method:'GET',cache:'no-store',signal,
  })
  if (!response.ok) {
    if (response.status === 429) throw new Error('rate_limited')
    if (response.status === 503) throw new Error('gateway_disabled')
    throw new Error('gateway_unavailable')
  }
  return parseLocalStandings(await response.json())
}
