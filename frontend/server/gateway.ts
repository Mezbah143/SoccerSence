import { normalizeFootballDataList } from '../src/providers/footballData.js'
import { normalizeFootballDataStandings } from '../src/providers/standings.js'
import { isLocalCompetition } from '../src/localCompetitions.js'

const UPSTREAM = 'https://api.football-data.org/v4'
const ATTRIBUTION = 'Football data provided by the Football-Data.org API'
const MAX_BYTES = 512 * 1024
export type GatewayConfig = { enabled: boolean; freePlanConfirmed: boolean; rightsReview: string; token: string }
export type GatewayResult = { status: number; body: Record<string, unknown>; retryAfter?: number }
export const error = (status: number, code: string): GatewayResult => ({ status, body: { error: code } })

function parseRoute(path: string): { upstream: string; kind: 'fixtures' | 'standings'; date?: string } | null {
  if (!path.startsWith('/api/') || path.includes('#')) return null
  const url = new URL(path, 'http://127.0.0.1:8787')
  const keys = [...url.searchParams.keys()]
  if (new Set(keys).size !== keys.length || !isLocalCompetition(url.searchParams.get('competition'))) return null
  const competition=url.searchParams.get('competition')!
  if (url.pathname === '/api/standings' && keys.length === 1) {
    return { upstream: `/competitions/${competition}/standings`, kind: 'standings' }
  }
  const date = url.searchParams.get('date') ?? ''
  if (url.pathname !== '/api/fixtures' || keys.length !== 2 || !keys.includes('date') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return null
  // v4 dateTo is exclusive. Limit every request to one UTC day and one competition.
  const next = new Date(Date.parse(date) + 86_400_000).toISOString().split('T')[0]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return null
  return {upstream: `/competitions/${competition}/matches?dateFrom=${date}&dateTo=${next}`, kind: 'fixtures', date}
}

async function boundedJson(response: Response): Promise<unknown> {
  if (!response.headers.get('content-type')?.includes('application/json') || !response.body) throw new Error('invalid response')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > MAX_BYTES) throw new Error('response too large')
      chunks.push(value)
    }
  } finally {
    await reader.cancel()
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown
}

/** One instance per local process, shared by both routes. Not a distributed/public quota guard. */
export function createGateway(config: GatewayConfig, fetcher: typeof fetch = fetch, now = Date.now) {
  let starts: number[] = []
  let sessionCalls = 0
  let busy = false
  let blockedUntil = 0
  let accessDenied = false
  return async (path: string): Promise<GatewayResult> => {
    let route: ReturnType<typeof parseRoute>
    try { route = parseRoute(path) } catch { return error(400, 'invalid_request') }
    if (!route) return error(400, 'invalid_request')
    if (!config.enabled || !config.freePlanConfirmed || !config.rightsReview.trim() ||
        !/^[a-zA-Z0-9]{16,128}$/.test(config.token)) return error(503, 'provider_disabled')
    if (accessDenied) return error(503, 'provider_access_blocked')
    const time = now()
    starts = starts.filter(start => time - start < 60_000)
    if (time < blockedUntil) return {...error(429, 'provider_cooldown'), retryAfter: Math.ceil((blockedUntil - time) / 1000)}
    if (sessionCalls >= 100) return error(429, 'session_budget_exhausted')
    if (busy || starts.length >= 6) return {...error(429, 'local_rate_limit'), retryAfter: 60}
    // Reserve before awaiting: concurrent callers and failed requests consume the same budget.
    starts.push(time)
    sessionCalls++
    busy = true
    try {
      const response = await fetcher(UPSTREAM + route.upstream, {
        headers: { 'X-Auth-Token': config.token, Accept: 'application/json' },
        redirect: 'error', signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) {
        await response.body?.cancel()
        if (response.status === 401 || response.status === 403) {
          accessDenied = true
          return error(response.status, response.status === 401 ? 'provider_unauthorized' : 'provider_forbidden')
        }
        if (response.status === 429) {
          const retry = response.headers.get('retry-after') ?? ''
          const delay = /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - now()
          blockedUntil = now() + Math.max(60_000, Number.isFinite(delay) ? delay : 60_000)
          return {...error(429, 'provider_cooldown'), retryAfter: Math.ceil((blockedUntil - now()) / 1000)}
        }
        if (response.status === 404) return error(404, 'provider_data_unavailable')
        return error(502, 'provider_unavailable')
      }
      const payload = await boundedJson(response)
      const fetchedAt = new Date(now()).toISOString()
      const meta = {source: 'football-data.org', freshness: 'delayed', fetchedAt, attribution: ATTRIBUTION}
      if (route.kind === 'standings') {
        const standings = normalizeFootballDataStandings(payload, fetchedAt)
        return standings ? {status: 200, body: {...standings, attribution: ATTRIBUTION}} : error(502, 'invalid_provider_response')
      }
      if (!payload || typeof payload !== 'object' || !('matches' in payload) || !Array.isArray(payload.matches)) return error(502, 'invalid_provider_response')
      const matches = normalizeFootballDataList(payload, fetchedAt)
      // Do not silently present a partial/corrupt provider response as an empty/successful day.
      if (matches.length !== payload.matches.length) return error(502, 'invalid_provider_response')
      // Provider date-range responses may include adjacent UTC dates; enforce the requested
      // calendar day after validating the complete upstream payload. This deliberately
      // removes legitimately returned adjacent-day records rather than mislabeling them.
      const dailyMatches = matches.filter(match => match.kickoffUtc.slice(0, 10) === route.date)
      return {status: 200, body: {...meta, matches: dailyMatches}}
    } catch {
      // Never echo upstream bodies, thrown errors, headers or credentials to users/logs.
      return error(502, 'provider_unavailable')
    } finally { busy = false }
  }
}
