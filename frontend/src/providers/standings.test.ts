import { describe, expect, it } from 'vitest'
import { normalizeFootballDataStandings } from './standings'
const fetched = '2026-11-15T00:00:00Z'
const row = { position: 1, team: {id: 1, name: 'Fictional North FC', crest: 'https://invalid.example/logo'}, playedGames: 2, won: 1, draw: 0, lost: 1, points: -1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2 }
const table = { type: 'TOTAL', stage: 'REGULAR_SEASON', group: null, table: [row] }
const data = { competition: {name: 'Fictional League'}, standings: [table] }
describe('standings adapter (invented data only)', () => {
  it('keeps official position, deductions and negative goal difference, without brand assets', () => {
    const result = normalizeFootballDataStandings(data, fetched)
    expect(result?.tables[0].rows[0]).toEqual({position: 1, teamId: '1', team: 'Fictional North FC', played: 2, won: 1, drawn: 0, lost: 1, points: -1, goalsFor: 2, goalsAgainst: 4, goalDifference: -2})
    expect(JSON.stringify(result)).not.toContain('crest')
    expect(result).toMatchObject({source: 'football-data.org', freshness: 'delayed', fetchedAt: '2026-11-15T00:00:00.000Z'})
  })
  it('preserves group tables and excludes HOME/AWAY views', () => {
    const result = normalizeFootballDataStandings({...data, standings: [{...table, group: 'GROUP_A'}, {...table, group: 'GROUP_B'}, {...table, type: 'HOME'}, {...table, type: 'AWAY'}]}, fetched)
    expect(result?.tables.map(t => t.group)).toEqual(['GROUP_A', 'GROUP_B'])
  })
  it('distinguishes valid empty data from malformed or unsupported tables', () => {
    expect(normalizeFootballDataStandings({...data, standings: []}, fetched)?.tables).toEqual([])
    for (const value of [null, {}, {...data, standings: [{}]}, {...data, standings: [{...table, type: 'HOME'}]}]) expect(normalizeFootballDataStandings(value, fetched)).toBeNull()
    expect(normalizeFootballDataStandings(data, 'invalid')).toBeNull()
  })
  it.each([{points: '3'}, {playedGames: -1}, {position: 0}, {goalsFor: 1.5}, {team: null}])('rejects corrupt rows: %j', invalid => {
    expect(normalizeFootballDataStandings({...data, standings: [{...table, table: [{...row, ...invalid}]}]}, fetched)).toBeNull()
  })
  it('rejects duplicate teams', () => {
    expect(normalizeFootballDataStandings({...data, standings: [{...table, table: [row, row]}]}, fetched)).toBeNull()
  })
})
