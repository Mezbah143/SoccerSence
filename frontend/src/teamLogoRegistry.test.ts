import {describe,expect,it} from 'vitest'
import {APPROVED_TEAM_LOGOS,approvedTeamLogoSrc,teamInitials} from './teamLogoRegistry'

describe('M18 approved logo registry and safe fallbacks',()=>{
  it('does not request any real crest without documented rights',()=>{
    expect(APPROVED_TEAM_LOGOS).toEqual({})
    expect(approvedTeamLogoSrc('57')).toBeNull()
    expect(approvedTeamLogoSrc('65')).toBeNull()
    expect(approvedTeamLogoSrc('2000')).toBeNull()
  })
  it('disallows arbitrary names, external URLs, or path traversal IDs',()=>{
    for(const id of ['../57','57.png','https://crests.football-data.org/57.png','-2','0','57?x=1',null,undefined,57]){
      expect(approvedTeamLogoSrc(id)).toBeNull()
    }
  })
  it('generates an accessible neutral badge from names, without fetching artwork',()=>{
    expect(teamInitials('Manchester City')).toBe('MC')
    expect(teamInitials('  Real Madrid  ')).toBe('RM')
    expect(teamInitials('Arsenal')).toBe('AR')
    expect(teamInitials('')).toBe('?')
  })
})
