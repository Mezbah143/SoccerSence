import {describe,expect,it} from 'vitest'
import {codeFromProviderId,isInternationalCompetition,isLocalCompetition,LOCAL_COMPETITIONS,LOCAL_COMPETITION_IDS,localCompetitionName} from './localCompetitions'
import {orderedCompetitions} from './multiLeagueFixtures'

describe('M13 Champions League and international tournament allowlist',()=>{
  it('includes the documented Champions League, World Cup and European Championship IDs',()=>{
    expect(LOCAL_COMPETITIONS).toHaveLength(9)
    expect(LOCAL_COMPETITION_IDS).toMatchObject({CL:2001,WC:2000,EC:2018})
    expect(codeFromProviderId(2001)).toBe('CL')
    expect(codeFromProviderId(2000)).toBe('WC')
    expect(codeFromProviderId(2018)).toBe('EC')
    expect(codeFromProviderId(2147)).toBeNull()
    expect(codeFromProviderId('2000')).toBeNull()
  })
  it('separates national-team tournaments from Champions League and domestic clubs',()=>{
    expect(isInternationalCompetition('WC')).toBe(true)
    expect(isInternationalCompetition('EC')).toBe(true)
    expect(isInternationalCompetition('CL')).toBe(false)
    expect(isInternationalCompetition('PL')).toBe(false)
    expect(localCompetitionName('CL')).toBe('UEFA Champions League')
    expect(localCompetitionName('WC')).toBe('FIFA World Cup')
    expect(localCompetitionName('EC')).toBe('UEFA European Championship')
  })
  it('accepts only explicitly free-covered competitions and allows favorites',()=>{
    expect(isLocalCompetition('CL')).toBe(true)
    expect(isLocalCompetition('WC')).toBe(true)
    expect(isLocalCompetition('EC')).toBe(true)
    expect(isLocalCompetition('QUFA')).toBe(false)
    expect(isLocalCompetition('QAFC')).toBe(false)
    expect(isLocalCompetition('FRIENDLY')).toBe(false)
    const order=orderedCompetitions([{kind:'league',id:'EC'},{kind:'league',id:'CL'}])
    expect(order.slice(0,2).map(x=>x.code)).toEqual(['CL','EC'])
  })
})
