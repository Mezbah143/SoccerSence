import { describe, expect, it } from 'vitest'
import { normalizeFootballDataList, normalizeFootballDataMatch } from './footballData'

const fetched = '2026-11-15T00:00:00Z'
describe('football-data.org v4 response adapter', () => {
  it('normalizes supported fields without inventing missing scores', () => {
    const match = normalizeFootballDataMatch({
      id: 123,
      utcDate: '2026-11-16T18:00:00Z',
      status: 'SCHEDULED',
      competition: { name: 'Example Competition' },
      homeTeam: { name: 'Example Home' },
      awayTeam: { name: 'Example Away' },
      score: { fullTime: { home: null, away: null } },
    }, fetched)
    expect(match?.homeScore).toBeNull()
    expect(match?.awayScore).toBeNull()
    expect(match?.freshness).toBe('delayed')
    expect(match?.source).toBe('football-data.org')
    expect(match?.kickoffUtc).toBe('2026-11-16T18:00:00.000Z')
  })
  it('rejects malformed records and never coerces fake scores', () => {
    expect(normalizeFootballDataMatch({ id: '123', utcDate: 'oops' }, fetched)).toBeNull()
    expect(normalizeFootballDataMatch({ id: 1, utcDate: '2026-11-16T18:00:00Z', score: { fullTime: { home: '2' } } }, fetched)?.homeScore).toBeNull()
  })
  it('handles missing, invalid and partial response bodies', () => {
    expect(normalizeFootballDataList(null, fetched)).toEqual([])
    expect(normalizeFootballDataList({matches:[{}, {id:5,utcDate:'2026-11-16T18:00:00Z'}]}, fetched)).toHaveLength(1)
  })
})
