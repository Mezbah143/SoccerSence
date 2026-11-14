import { describe, expect, it, vi } from 'vitest'
import { createGateway } from './gateway.js'
const config = { enabled: true, freePlanConfirmed: true, rightsReview: 'test-only-fictional', token: 'TESTONLY000000000000000000000000' }
const route = '/api/fixtures?competition=PL&date=2026-11-15'
const match = { id: 1, utcDate: '2026-11-15T13:00:00Z', homeTeam: {name: 'Fictional Home'}, awayTeam: {name: 'Fictional Away'} }
const json = (body: unknown) => new Response(JSON.stringify(body), {headers: {'content-type': 'application/json'}})
const empty = () => json({matches: []})
describe('local provider gateway', () => {
  it.each([{...config, enabled: false}, {...config, freePlanConfirmed: false}, {...config, rightsReview: ''}, {...config, token: ''}, {...config, token: 'replace-with-server-side-secret'}])('makes no request until all gates pass', async settings => {
    const fetcher = vi.fn<typeof fetch>()
    expect((await createGateway(settings, fetcher)(route)).status).toBe(503)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it.each(['/api/fixtures?competition=PL&date=2026-02-30', '/api/fixtures?competition=PL&date=wrong', '/api/fixtures?competition=PL&date=2026-11-15&token=secret', '/api/fixtures?competition=PL&competition=PL&date=2026-11-15', '/api/standings?competition=PAID', '/api/standings?competition=PL&season=2020', '/api/key', '/api/fixtures?competition=PL&date=9999-12-31'])('rejects invalid routes without network: %s', async path => {
    const fetcher = vi.fn<typeof fetch>()
    expect((await createGateway(config, fetcher)(path)).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('fetches one UTC day from the fixed host, normalizes and never exposes keys or logos', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({matches: [{...match, crest: 'unlicensed'}], token: config.token}))
    const result = await createGateway(config, fetcher, () => Date.parse('2026-11-15T00:00:00Z'))(route)
    expect(fetcher).toHaveBeenCalledWith('https://api.football-data.org/v4/competitions/PL/matches?dateFrom=2026-11-15&dateTo=2026-11-16', expect.objectContaining({redirect: 'error', signal: expect.any(AbortSignal), headers: {'X-Auth-Token': config.token, Accept: 'application/json'}}))
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject({freshness: 'delayed', source: 'football-data.org', fetchedAt: '2026-11-15T00:00:00.000Z', attribution: expect.any(String)})
    expect(JSON.stringify(result)).not.toContain(config.token)
    expect(JSON.stringify(result)).not.toContain('unlicensed')
  })
  it('returns valid empty standings using a fixed endpoint', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({competition: {name: 'Fictional League'}, standings: []}))
    const result = await createGateway(config, fetcher)('/api/standings?competition=PL')
    expect(result.status).toBe(200)
    expect(result.body.tables).toEqual([])
    expect(fetcher.mock.calls[0][0]).toBe('https://api.football-data.org/v4/competitions/PL/standings')
  })
  it('limits both routes together to six attempts per rolling minute', async () => {
    let time = 0
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => empty())
    const gateway = createGateway(config, fetcher, () => time)
    for (let i = 0; i < 6; i++) await gateway(route)
    expect((await gateway('/api/standings?competition=PL')).status).toBe(429)
    time = 59_999
    expect((await gateway(route)).status).toBe(429)
    time = 60_000
    expect((await gateway(route)).status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(7)
  })
  it('stops at 100 attempts per process even after time advances', async () => {
    let time = 0
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => empty())
    const gateway = createGateway(config, fetcher, () => time)
    for (let i = 0; i < 100; i++) { await gateway(route); time += 60_000 }
    expect((await gateway(route)).body.error).toBe('session_budget_exhausted')
    expect(fetcher).toHaveBeenCalledTimes(100)
  })
  it('reserves quota before concurrent requests without retries', async () => {
    let finish!: (response: Response) => void
    const fetcher = vi.fn<typeof fetch>().mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const gateway = createGateway(config, fetcher)
    const first = gateway(route)
    expect((await gateway(route)).status).toBe(429)
    finish(empty())
    expect((await first).status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it.each([401, 403])('blocks further requests after status %s', async status => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(config.token, {status}))
    const gateway = createGateway(config, fetcher)
    expect((await gateway(route)).status).toBe(status)
    expect((await gateway(route)).body.error).toBe('provider_access_blocked')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it.each(['120', 'Thu, 01 Jan 1970 00:02:00 GMT', 'invalid'])('honors 429 cooldown (%s)', async retry => {
    let time = 0
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => new Response(config.token, {status: 429, headers: {'retry-after': retry}}))
    const gateway = createGateway(config, fetcher, () => time)
    const result = await gateway(route)
    expect(result.retryAfter).toBe(retry === 'invalid' ? 60 : 120)
    time = 59_999
    expect((await gateway(route)).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(1)
    time = 120_000
    await gateway(route)
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(JSON.stringify(result)).not.toContain(config.token)
  })
  it.each([404, 500, 302])('sanitizes upstream status %s', async status => {
    const result = await createGateway(config, vi.fn<typeof fetch>().mockResolvedValue(new Response(config.token, {status})))(route)
    expect(result.status).toBe(status === 404 ? 404 : 502)
    expect(JSON.stringify(result)).not.toContain(config.token)
  })
  it('sanitizes network failures/timeouts and counts failed attempts', async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error(config.token))
    const gateway = createGateway(config, fetcher)
    for (let i = 0; i < 6; i++) expect(await gateway(route)).toEqual({status: 502, body: {error: 'provider_unavailable'}})
    expect((await gateway(route)).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(6)
  })
  it.each([{}, {matches: [{}]}, {matches: 'bad'}])('rejects corrupt envelopes: %j', async body => {
    expect((await createGateway(config, vi.fn<typeof fetch>().mockResolvedValue(json(body)))(route)).status).toBe(502)
  })
  it('rejects malformed standings', async () => {
    expect((await createGateway(config, vi.fn<typeof fetch>().mockResolvedValue(json({standings: [{}]})))('/api/standings?competition=PL')).status).toBe(502)
  })
  it('rejects wrong content types, invalid JSON and oversized bodies', async () => {
    for (const response of [new Response('{}'), new Response('{', {headers: {'content-type': 'application/json'}}), json({matches: [], extra: 'x'.repeat(512 * 1024)})]) expect((await createGateway(config, vi.fn<typeof fetch>().mockResolvedValue(response))(route)).status).toBe(502)
  })
})
