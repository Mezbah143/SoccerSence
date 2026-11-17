import {describe,it,expect} from 'vitest'
import {fixtureDay,kstDayFromUtc,shiftDay,todayInKst,validDay} from './dateNavigation'
describe('Korean match calendar boundaries',()=>{
  it('correctly moves late UTC kickoff into next Korean date',()=>{
    expect(kstDayFromUtc('2026-11-20T14:59:59.999Z')).toBe('2026-11-20')
    expect(kstDayFromUtc('2026-11-20T15:00:00.000Z')).toBe('2026-11-21')
    expect(kstDayFromUtc('2026-11-21T14:59:59.999Z')).toBe('2026-11-21')
    expect(kstDayFromUtc('2026-11-21T15:00:00.000Z')).toBe('2026-11-22')
    expect(fixtureDay('2026-11-20T15:00:00.000Z','KST')).toBe('2026-11-21')
    expect(fixtureDay('2026-11-20T15:00:00.000Z','UTC')).toBe('2026-11-20')
  })
  it('determines today in Korea, not in the host operating-system time zone',()=>{
    expect(todayInKst(new Date('2026-11-17T16:00:00Z'))).toBe('2026-11-18')
  })
  it('previous/next navigation handles month, year, leap-day changes',()=>{
    expect(shiftDay('2026-11-01',-1)).toBe('2026-10-31')
    expect(shiftDay('2026-12-31',1)).toBe('2027-01-01')
    expect(shiftDay('2028-02-28',1)).toBe('2028-02-29')
    expect(shiftDay('2028-02-29',1)).toBe('2028-03-01')
  })
  it('rejects invalid calendar input',()=>{
    expect(validDay('2026-02-30')).toBe(false)
    expect(validDay('2026-11-21')).toBe(true)
    expect(()=>shiftDay('not-a-date',1)).toThrow('invalid_date')
  })
})
