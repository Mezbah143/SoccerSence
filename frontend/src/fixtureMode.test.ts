import {describe,expect,it} from 'vitest'
import {initialFixtureMode} from './fixtureMode'

describe('SoccerSense initial fixture mode',()=>{
  it('defaults to local controls in development',()=>{
    expect(initialFixtureMode(true)).toBe('local')
    expect(initialFixtureMode(true,undefined)).toBe('local')
  })
  it('keeps fictional demo explicitly selectable in development',()=>{
    expect(initialFixtureMode(true,'demo')).toBe('demo')
    expect(initialFixtureMode(true,'local')).toBe('local')
  })
  it('never defaults to local data in production, even with navigation state',()=>{
    expect(initialFixtureMode(false)).toBe('demo')
    expect(initialFixtureMode(false,'local')).toBe('demo')
    expect(initialFixtureMode(false,'demo')).toBe('demo')
  })
  it('does not interpret unexpected route state as a production override',()=>{
    expect(initialFixtureMode(false,{mode:'local'})).toBe('demo')
    expect(initialFixtureMode(true,{mode:'demo'})).toBe('local')
  })
})
