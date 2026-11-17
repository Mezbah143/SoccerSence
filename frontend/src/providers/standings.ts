/** Normalize only display fields; never pass through logos, URLs or provider metadata. */
export type StandingRow = {
  position: number; teamId: string; team: string; played: number
  won: number; drawn: number; lost: number; points: number
  goalsFor: number; goalsAgainst: number; goalDifference: number
}
export type StandingsView = {
  competition: string
  tables: { stage: string; group: string | null; rows: StandingRow[] }[]
  source: 'football-data.org'; freshness: 'delayed'; fetchedAt: string
}
const record = (v: unknown): Record<string, unknown> | null =>
  v !== null && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : null
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const integer = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v)
const nonnegative = (v: unknown): v is number => integer(v) && v >= 0

/** Null means malformed/unsupported; an empty tables array means a valid empty response. */
export function normalizeFootballDataStandings(payload: unknown, fetchedAt: string): StandingsView | null {
  const data = record(payload)
  const competition = record(data?.competition)
  if (!data || !text(competition?.name) || !Array.isArray(data.standings) || !Number.isFinite(Date.parse(fetchedAt))) return null
  const tables: StandingsView['tables'] = []
  for (const item of data.standings) {
    const table = record(item)
    if (!table || !['TOTAL', 'HOME', 'AWAY'].includes(String(table.type))) return null
    if (table.type !== 'TOTAL') continue
    if (!text(table.stage) || !(table.group === null || text(table.group)) || !Array.isArray(table.table)) return null
    const rows: StandingRow[] = []
    const ids = new Set<number>()
    for (const item of table.table) {
      const row = record(item)
      const team = record(row?.team)
      if (!row || !team || !integer(team.id) || team.id < 1 || ids.has(team.id) || !text(team.name) ||
          !integer(row.position) || row.position < 1 || !nonnegative(row.playedGames) ||
          !nonnegative(row.won) || !nonnegative(row.draw) || !nonnegative(row.lost) ||
          !integer(row.points) || !nonnegative(row.goalsFor) || !nonnegative(row.goalsAgainst) || !integer(row.goalDifference)) return null
      ids.add(team.id)
      rows.push({position: row.position, teamId: String(team.id), team: team.name, played: row.playedGames,
        won: row.won, drawn: row.draw, lost: row.lost, points: row.points,
        goalsFor: row.goalsFor, goalsAgainst: row.goalsAgainst, goalDifference: row.goalDifference})
    }
    tables.push({stage: table.stage, group: table.group, rows})
  }
  if (data.standings.length && !tables.length) return null
  return {competition: competition.name, tables, source: 'football-data.org', freshness: 'delayed', fetchedAt: new Date(fetchedAt).toISOString()}
}
