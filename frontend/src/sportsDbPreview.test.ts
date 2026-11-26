import {afterEach,describe,expect,it,vi} from 'vitest'
import {loadArsenalArtwork,parseArsenalArtwork} from './sportsDbPreview'
afterEach(()=>vi.unstubAllGlobals())
const valid={idTeam:'133604',strTeam:'Arsenal',strSport:'Soccer',strBadge:'https://r2.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png'}
describe('M19 public-free-key local artwork preview',()=>{
 it('accepts only an exact vetted Arsenal team and official badge host',()=>{
  expect(parseArsenalArtwork({teams:[valid]})).toEqual({teamId:'133604',teamName:'Arsenal',badgeUrl:valid.strBadge})
 })
 it('refuses wrong team, wrong id, injected hosts and unsafe image paths',()=>{
  for(const candidate of [
    {...valid,idTeam:'57'},{...valid,strTeam:'Not Arsenal'},
    {...valid,strBadge:'https://r2.thesportsdb.com.evil.test/images/media/team/badge/a.png'},
    {...valid,strBadge:'javascript:alert(1)'},
    {...valid,strBadge:'https://r2.thesportsdb.com/images/media/team/badge/a.svg'},
    {...valid,strBadge:'https://r2.thesportsdb.com/images/media/team/badge/a.png?redirect=1'},
  ])expect(parseArsenalArtwork({teams:[candidate]})).toBeNull()
  expect(parseArsenalArtwork({teams:null})).toBeNull()
 })
 it('only requests on explicit call, with no private football-data credential',async()=>{
  const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({teams:[valid]})})
  vi.stubGlobal('fetch',fetcher)
  await loadArsenalArtwork()
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(fetcher).toHaveBeenCalledWith('/sportsdb-preview',{cache:'no-store',signal:undefined})
 })
})
