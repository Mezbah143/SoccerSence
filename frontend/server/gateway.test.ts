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
  it('returns only the requested UTC day even when provider returns adjacent dates', async () => {
    const requested = '/api/fixtures?competition=PL&date=2026-11-21'
    const responses = [
      { ...match, id: 30, utcDate: '2026-11-21T12:30:00Z' },
      { ...match, id: 31, utcDate: '2026-11-21T23:59:59Z' },
      { ...match, id: 32, utcDate: '2026-11-22T00:00:00Z' },
      { ...match, id: 33, utcDate: '2026-11-22T16:30:00Z' },
      { ...match, id: 34, utcDate: '2026-11-20T23:59:59Z' },
    ]
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({ matches: responses }))
    const result = await createGateway(config, fetcher, () => Date.parse('2026-11-17T05:51:19Z'))(requested)
    expect(result.status).toBe(200)
    expect(fetcher.mock.calls[0][0]).toBe('https://api.football-data.org/v4/competitions/PL/matches?dateFrom=2026-11-21&dateTo=2026-11-22')
    const returned = result.body.matches as {id:string; kickoffUtc:string}[]
    expect(returned.map(m => m.id)).toEqual(['30', '31'])
    expect(returned.every(m => m.kickoffUtc.slice(0,10) === '2026-11-21')).toBe(true)
    expect(result.body).toMatchObject({source: 'football-data.org', freshness: 'delayed'})
  })
  it('treats valid adjacent-day-only records as an empty requested UTC day', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({
      matches: [{ ...match, utcDate: '2026-11-22T14:00:00Z' }],
    }))
    const result = await createGateway(config, fetcher)('/api/fixtures?competition=PL&date=2026-11-21')
    expect(result.status).toBe(200)
    expect(result.body.matches).toEqual([])
  })
  it('rejects corrupt records even if they would fall outside the requested day', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(json({
      matches: [{ ...match, utcDate: '2026-11-15T13:00:00Z' }, { id: 'bad', utcDate: '2026-11-22T14:00:00Z' }],
    }))
    const result = await createGateway(config, fetcher)(route)
    expect(result.status).toBe(502)
  })

  it.each([
    ['PD','/competitions/PD/matches?dateFrom=2026-11-15&dateTo=2026-11-16'],
    ['BL1','/competitions/BL1/matches?dateFrom=2026-11-15&dateTo=2026-11-16'],
    ['SA','/competitions/SA/matches?dateFrom=2026-11-15&dateTo=2026-11-16'],
    ['FL1','/competitions/FL1/matches?dateFrom=2026-11-15&dateTo=2026-11-16'],
    ['DED','/competitions/DED/matches?dateFrom=2026-11-15&dateTo=2026-11-16'],
  ])('uses explicit Free competition code %s in fixture upstream route',async(code,path)=>{
    const fetcher=vi.fn<typeof fetch>().mockResolvedValue(empty())
    const response=await createGateway(config,fetcher)('/api/fixtures?competition='+code+'&date=2026-11-15')
    expect(response.status).toBe(200)
    expect(fetcher.mock.calls[0][0]).toBe('https://api.football-data.org/v4'+path)
  })
  it('routes standings using allowlisted code while respecting shared request budget',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async()=>json({competition:{name:'Fictional League'},standings:[]}))
    const gateway=createGateway(config,fetcher,()=>0)
    for(const code of ['PL','PD','BL1','SA','FL1','DED']){
      expect((await gateway('/api/standings?competition='+code)).status).toBe(200)
    }
    expect((await gateway('/api/standings?competition=PL')).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(6)
    expect(fetcher.mock.calls[1][0]).toBe('https://api.football-data.org/v4/competitions/PD/standings')
  })
  it.each(['UNKNOWN','CL-PAID','../../key','pl','', 'WC%2Fextra'])('rejects unapproved competition %s before network call',async code=>{
    const fetcher=vi.fn<typeof fetch>()
    const response=await createGateway(config,fetcher)('/api/fixtures?competition='+code+'&date=2026-11-15')
    expect(response.status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('selects exactly one KST day in one upstream call across midnight',async()=>{
    const matches=[
      {...match,id:1,utcDate:'2026-11-20T14:59:59.999Z'},
      {...match,id:2,utcDate:'2026-11-20T15:00:00.000Z'},
      {...match,id:3,utcDate:'2026-11-21T14:59:59.999Z'},
      {...match,id:4,utcDate:'2026-11-21T15:00:00.000Z'},
      {...match,id:5,utcDate:'2026-11-22T01:00:00.000Z'},
    ]
    const fetcher=vi.fn<typeof fetch>().mockResolvedValue(json({matches}))
    const result=await createGateway(config,fetcher)('/api/fixtures?competition=PD&date=2026-11-21&tz=KST')
    expect(result.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toBe('https://api.football-data.org/v4/competitions/PD/matches?dateFrom=2026-11-20&dateTo=2026-11-22')
    expect((result.body.matches as {id:string}[]).map(x=>x.id)).toEqual(['2','3'])
    expect(JSON.stringify(result)).not.toContain(config.token)
  })
  it.each([
    '/api/fixtures?competition=PD&date=2026-11-21&tz=UTC',
    '/api/fixtures?competition=PD&date=2026-11-21&tz=Asia/Seoul',
    '/api/fixtures?competition=PD&date=2026-11-21&tz=KST&extra=1',
    '/api/fixtures?competition=PD&date=2026-11-21&tz=KST&tz=KST',
  ])('rejects unsupported KST parameters without provider calls: %s',async path=>{
    const fetcher=vi.fn<typeof fetch>()
    expect((await createGateway(config,fetcher)(path)).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('shares the same rate budget between KST and original UTC requests',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async(url)=>
      String(url).includes('/standings')
        ? json({competition:{name:'Fictional League'},standings:[]})
        : empty())
    const gateway=createGateway(config,fetcher,()=>0)
    for(let i=0;i<3;i++){
      expect((await gateway('/api/fixtures?competition=PL&date=2026-11-21&tz=KST')).status).toBe(200)
      expect((await gateway('/api/standings?competition=PL')).status).toBe(200)
    }
    expect((await gateway(route)).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(6)
  })
  it('does not return partially valid KST day when provider response includes malformed records',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockResolvedValue(json({matches:[{...match,utcDate:'2026-11-20T15:00:00Z'},{utcDate:'bad'}]}))
    const result=await createGateway(config,fetcher)('/api/fixtures?competition=PL&date=2026-11-21&tz=KST')
    expect(result.status).toBe(502)
  })


  const teamTable={competition:{name:'Example League'},standings:[{type:'TOTAL',stage:'REGULAR_SEASON',group:null,table:[{
    position:1,team:{id:57,name:'Sample FC'},playedGames:12,won:6,draw:4,lost:2,points:22,goalsFor:20,goalsAgainst:10,goalDifference:10
  }]}]}
  const team={id:57,name:'Sample FC',venue:'Example Ground',crest:'UNLICENSED_IMAGE',squad:[{name:'Do not expose'}]}
  const recent={matches:[{id:81,utcDate:'2026-11-19T08:00:00Z',status:'FINISHED',
    homeTeam:{id:57,name:'Sample FC'},awayTeam:{id:58,name:'Another FC'},
    score:{fullTime:{home:2,away:1}},crest:'UNLICENSED_IMAGE'}]}
  it('disables both optional team endpoints before network use by default',async()=>{
    const fetcher=vi.fn<typeof fetch>()
    const gateway=createGateway(config,fetcher)
    expect((await gateway('/api/team?competition=PL&id=57')).body.error).toBe('team_endpoint_not_confirmed')
    expect((await gateway('/api/team-matches?competition=PL&id=57')).body.error).toBe('team_endpoint_not_confirmed')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('only lets a verified standings team ID use optional, separately confirmed endpoints',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async(url)=>{
      const path=String(url)
      if(path.endsWith('/standings'))return json(teamTable)
      if(path.endsWith('/teams/57'))return json(team)
      if(path.includes('/teams/57/matches?'))return json(recent)
      throw Error('unexpected upstream route')
    })
    const gateway=createGateway({...config,teamDetailsConfirmed:true,teamMatchesConfirmed:true},fetcher)
    expect((await gateway('/api/team?competition=PL&id=57')).body.error).toBe('unverified_team_id')
    expect(fetcher).not.toHaveBeenCalled()
    expect((await gateway('/api/standings?competition=PL')).status).toBe(200)
    const info=await gateway('/api/team?competition=PL&id=57')
    const history=await gateway('/api/team-matches?competition=PL&id=57')
    expect(info.status).toBe(200)
    expect(info.body.team).toMatchObject({id:'57',name:'Sample FC',venue:'Example Ground'})
    expect(history.status).toBe(200)
    expect((history.body.matches as {id:string}[]).map(m=>m.id)).toEqual(['81'])
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(fetcher.mock.calls[1][0]).toBe('https://api.football-data.org/v4/teams/57')
    expect(fetcher.mock.calls[2][0]).toBe('https://api.football-data.org/v4/teams/57/matches?status=FINISHED&limit=5')
    expect(JSON.stringify(info)+JSON.stringify(history)).not.toContain(config.token)
    expect(JSON.stringify(info)+JSON.stringify(history)).not.toContain('UNLICENSED_IMAGE')
    expect(JSON.stringify(info)).not.toContain('squad')
    expect((await gateway('/api/team?competition=PL&id=58')).status).toBe(403)
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
  it.each(['/api/team?competition=PL&id=0','/api/team?competition=PL&id=57%2Fmatches',
    '/api/team?competition=PL&id=57&scope=anything','/api/team?competition=UNKNOWN&id=57',
    '/api/team-matches?competition=PL&id=../../credentials'])('rejects dangerous or unsupported team routes: %s',async path=>{
    const fetcher=vi.fn<typeof fetch>()
    expect((await createGateway({...config,teamDetailsConfirmed:true,teamMatchesConfirmed:true},fetcher)(path)).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('optional team 403 disables only that endpoint, keeping verified standings working',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async(url)=>
      String(url).endsWith('/standings')?json(teamTable):new Response('SECRET',{status:403}))
    const gateway=createGateway({...config,teamDetailsConfirmed:true,teamMatchesConfirmed:true},fetcher)
    expect((await gateway('/api/standings?competition=PL')).status).toBe(200)
    expect((await gateway('/api/team?competition=PL&id=57')).body.error).toBe('team_endpoint_denied')
    expect((await gateway('/api/team?competition=PL&id=57')).status).toBe(503)
    expect((await gateway('/api/standings?competition=PL')).status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(3)
  })
  it('all optional team calls draw from existing shared six-request budget',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async(url)=>{
      const path=String(url)
      if(path.endsWith('/standings'))return json(teamTable)
      if(path.endsWith('/teams/57'))return json(team)
      return json(recent)
    })
    const gateway=createGateway({...config,teamDetailsConfirmed:true,teamMatchesConfirmed:true},fetcher,()=>0)
    expect((await gateway('/api/standings?competition=PL')).status).toBe(200)
    for(let i=0;i<5;i++)expect((await gateway('/api/team?competition=PL&id=57')).status).toBe(200)
    expect((await gateway('/api/team-matches?competition=PL&id=57')).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(6)
  })

})


describe('M12 one-call consolidated league gateway',()=>{
  const route='/api/all-fixtures?date=2026-11-21&tz=KST'
  const mk=(id:number,competitionId:number,utcDate:string)=>({
    id,utcDate,status:'TIMED',competition:{id:competitionId,name:'Example League'},
    homeTeam:{name:'Sample Home'},awayTeam:{name:'Sample Away'},
  })
  it('fetches six competitions in one request, groups by verified provider id and filters exact KST date',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockResolvedValue(json({matches:[
      mk(1,2021,'2026-11-20T16:00:00Z'),mk(2,2014,'2026-11-21T14:00:00Z'),
      mk(3,2021,'2026-11-21T16:00:00Z'),mk(4,2002,'2026-11-20T15:00:00Z'),
    ]}))
    const result=await createGateway(config,fetcher)(route)
    expect(result.status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0][0]).toBe('https://api.football-data.org/v4/matches?dateFrom=2026-11-20&dateTo=2026-11-22&competitions=2021,2014,2002,2019,2015,2003')
    const leagues=result.body.leagues as Record<string,{id:string}[]>
    expect(leagues.PL.map(m=>m.id)).toEqual(['1'])
    expect(leagues.PD.map(m=>m.id)).toEqual(['2'])
    expect(leagues.BL1.map(m=>m.id)).toEqual(['4'])
    expect(Object.keys(leagues)).toHaveLength(6)
    expect(result.body).toMatchObject({freshness:'delayed',source:'football-data.org'})
    expect(JSON.stringify(result)).not.toContain(config.token)
  })
  it.each([
    '/api/all-fixtures?date=2026-11-21',
    '/api/all-fixtures?date=2026-11-21&tz=UTC',
    '/api/all-fixtures?date=2026-11-21&tz=KST&token=secret',
    '/api/all-fixtures?date=2026-11-99&tz=KST',
  ])('rejects invalid aggregate routes without upstream calls: %s',async path=>{
    const fetcher=vi.fn<typeof fetch>()
    expect((await createGateway(config,fetcher)(path)).status).toBe(400)
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('ignores unrelated provider competitions without mislabeling or dropping valid league results',async()=>{
    const provider=vi.fn<typeof fetch>().mockResolvedValue(json({matches:[
      mk(1,9999,'2026-11-21T10:00:00Z'),mk(2,2021,'2026-11-21T10:00:00Z')
    ]}))
    const result=await createGateway(config,provider)(route)
    expect(result.status).toBe(200)
    const leagues=result.body.leagues as Record<string,{id:string}[]>
    expect(leagues.PL.map(match=>match.id)).toEqual(['2'])
    expect(Object.values(leagues).flat()).toHaveLength(1)
  })
  it('rejects corrupt match payloads, even if the competition is not supported',async()=>{
    const item={...mk(1,9999,'2026-11-21T10:00:00Z'),id:'not-a-number'}
    expect((await createGateway(config,vi.fn<typeof fetch>().mockResolvedValue(json({matches:[item]})))(route)).status).toBe(502)
  })
  it('identifies rejected aggregate filters without revealing the provider response body',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockResolvedValue(new Response(config.token,{status:400}))
    const result=await createGateway(config,fetcher)(route)
    expect(result).toEqual({status:422,body:{error:'aggregate_filter_rejected'}})
    expect(JSON.stringify(result)).not.toContain(config.token)
  })
  it('does not disable valid single-league lookups after aggregate 403',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async url=>
      String(url).includes('/v4/matches?')?new Response('restricted',{status:403}):json({matches:[]}))
    const gateway=createGateway(config,fetcher)
    expect((await gateway(route)).body.error).toBe('aggregate_unavailable')
    expect((await gateway('/api/fixtures?competition=PL&date=2026-11-21')).status).toBe(200)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('uses the same shared rate limits without six separate calls',async()=>{
    const fetcher=vi.fn<typeof fetch>().mockImplementation(async()=>json({matches:[]}))
    const gateway=createGateway(config,fetcher,()=>0)
    for(let i=0;i<6;i++)expect((await gateway(route)).status).toBe(200)
    expect((await gateway(route)).status).toBe(429)
    expect(fetcher).toHaveBeenCalledTimes(6)
  })
})
