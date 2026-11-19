import {describe,expect,it} from 'vitest'
import {normalizeTeamDetails,normalizeTeamResults} from './team'
const club={id:57,name:'Example Club',shortName:'EC',venue:'Example Stadium',founded:1902,area:{name:'Example Area'},crest:'https://unlicensed.invalid/club.png',squad:[{name:'Not licensed'}]}
const match={id:123,utcDate:'2026-11-16T19:00:00Z',status:'FINISHED',homeTeam:{id:57,name:'Example Club'},awayTeam:{id:58,name:'Sample Team'},score:{fullTime:{home:2,away:1}}}
describe('optional provider club normalizers',()=>{
  it('keeps only allowlisted display fields and an exact ID',()=>{
    const data=normalizeTeamDetails(club,'57')
    expect(data).toEqual({id:'57',name:'Example Club',shortName:'EC',venue:'Example Stadium',founded:1902,area:'Example Area'})
    expect(JSON.stringify(data)).not.toContain('unlicensed')
    expect(JSON.stringify(data)).not.toContain('squad')
  })
  it('never accepts an incorrect club ID or missing name',()=>{
    expect(normalizeTeamDetails(club,'58')).toBeNull()
    expect(normalizeTeamDetails({...club,name:''},'57')).toBeNull()
  })
  it('allows absent optional fields without inventing data',()=>{
    expect(normalizeTeamDetails({id:57,name:'Example Club'},'57')).toMatchObject({venue:null,founded:null,area:null})
  })
  it('sorts valid finished match history newest-first, without logos or metadata',()=>{
    const payload={matches:[{...match,id:101,utcDate:'2026-11-12T12:00:00Z'},match]}
    const data=normalizeTeamResults(payload,'57')
    expect(data?.map(m=>m.id)).toEqual(['123','101'])
    expect(JSON.stringify(data)).not.toContain('crest')
  })
  it('rejects absent team ID, unfinished matches, malformed scores and oversized sets',()=>{
    expect(normalizeTeamResults({matches:[{...match,homeTeam:{name:'Example Club'}}]},'57')).toBeNull()
    expect(normalizeTeamResults({matches:[{...match,status:'TIMED'}]},'57')).toBeNull()
    expect(normalizeTeamResults({matches:[{...match,score:{fullTime:{home:null,away:1}}}]},'57')).toBeNull()
    expect(normalizeTeamResults({matches:[match]},'59')).toBeNull()
    expect(normalizeTeamResults({matches:[match,match]},'57')).toBeNull()
    expect(normalizeTeamResults({matches:Array(6).fill(match)},'57')).toBeNull()
  })
  it('permits a valid empty history without fake scores',()=>{
    expect(normalizeTeamResults({matches:[]},'57')).toEqual([])
  })
})
