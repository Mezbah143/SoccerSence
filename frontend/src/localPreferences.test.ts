import {describe,expect,it} from 'vitest'
import {DEFAULT_PREFERENCES,favoriteKey,validateFavorites,validatePreferences} from './localPreferences'
describe('local-first SoccerSense favorites and settings',()=>{
  it('accepts allowlisted league IDs and valid saved team IDs only',()=>{
    const result=validateFavorites([
      {kind:'league',id:'PL',name:'Premier League'},
      {kind:'league',id:'PL',name:'Duplicate'},
      {kind:'league',id:'PAID',name:'Unavailable'},
      {kind:'team',id:'57',name:'Fictional Test FC',competition:'PD'},
      {kind:'team',id:'../../credentials',name:'Unsafe',competition:'PL'},
      {kind:'team',id:'18',name:'Unknown',competition:'PAID'},
    ])
    expect(result).toEqual([
      {kind:'league',id:'PL',name:'Premier League'},
      {kind:'team',id:'57',name:'Fictional Test FC',competition:'PD'},
    ])
    expect(result.map(favoriteKey)).toEqual(['league:PL','team:57:PD'])
  })
  it('rejects malformed payloads and caps local saved entries',()=>{
    expect(validateFavorites(null)).toEqual([])
    expect(validateFavorites({kind:'league'})).toEqual([])
    expect(validateFavorites(Array.from({length:70},(_,i)=>({kind:'team',id:String(i+1),name:'Club '+i,competition:'PL'})))).toHaveLength(30)
  })
  it('ignores malformed stored settings and preserves defaults',()=>{
    expect(validatePreferences(null)).toEqual(DEFAULT_PREFERENCES)
    expect(validatePreferences({compactCards:'yes',reduceMotion:0})).toEqual(DEFAULT_PREFERENCES)
    expect(validatePreferences({compactCards:true,reduceMotion:true})).toEqual({compactCards:true,reduceMotion:true})
  })
})
