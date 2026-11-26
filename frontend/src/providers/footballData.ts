/**
 * football-data.org v4 normalization functions.
 * No network requests or credentials here. Never import private API keys into browser code.
 * Real data integration must go through an approved, quota-limited server-side adapter.
 */
export type MatchView = {
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
type ProviderTeam = { id?: unknown; name?: unknown; shortName?: unknown; crest?: unknown }
type ProviderMatch = {
  id?: unknown
  utcDate?: unknown
  status?: unknown
  homeTeam?: ProviderTeam | null
  awayTeam?: ProviderTeam | null
  competition?: { name?: unknown } | null
  score?: { fullTime?: { home?: unknown; away?: unknown } | null } | null
}
const nameOr = (value: unknown, fallback: string) =>
  typeof value === 'string' && value.trim() ? value : fallback
const teamIdOrNull = (value: unknown): string | null => typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? String(value) : null
const scoreOrNull = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null

/** Fail closed: invalid identifiers or kickoff values must not appear as real match results. */
export function normalizeFootballDataMatch(value: unknown, fetchedAt: string): MatchView | null {
  if (!value || typeof value !== 'object') return null
  const match = value as ProviderMatch
  if (typeof match.id !== 'number' || !Number.isSafeInteger(match.id) || match.id < 1) return null
  if (typeof match.utcDate !== 'string' || !Number.isFinite(Date.parse(match.utcDate))) return null
  if (typeof fetchedAt !== 'string' || !Number.isFinite(Date.parse(fetchedAt))) return null
  return {
    id: String(match.id),
    competition: nameOr(match.competition?.name, 'Unknown competition'),
    home: nameOr(match.homeTeam?.name, 'TBD'),
    away: nameOr(match.awayTeam?.name, 'TBD'),
    homeTeamId: teamIdOrNull(match.homeTeam?.id),
    awayTeamId: teamIdOrNull(match.awayTeam?.id),
    kickoffUtc: new Date(match.utcDate).toISOString(),
    status: nameOr(match.status, 'UNKNOWN'),
    homeScore: scoreOrNull(match.score?.fullTime?.home),
    awayScore: scoreOrNull(match.score?.fullTime?.away),
    source: 'football-data.org',
    fetchedAt: new Date(fetchedAt).toISOString(),
    freshness: 'delayed',
  }
}

/** A provider response is untrusted; only valid matches are accepted. */
export function normalizeFootballDataList(payload: unknown, fetchedAt: string): MatchView[] {
  if (!payload || typeof payload !== 'object' || !('matches' in payload)) return []
  const matches = (payload as { matches?: unknown }).matches
  if (!Array.isArray(matches)) return []
  return matches.flatMap(match => {
    const normalized = normalizeFootballDataMatch(match, fetchedAt)
    return normalized ? [normalized] : []
  })
}
