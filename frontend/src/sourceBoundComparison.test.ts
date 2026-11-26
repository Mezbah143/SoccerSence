import {describe,expect,it} from 'vitest'
import {sourceBoundComparison} from './sourceBoundComparison'
import type {StandingRow} from './localStandings'
const left:StandingRow={position:3,teamId:'57',team:'Example A',played:10,won:5,drawn:3,lost:2,points:-2,goalsFor:19,goalsAgainst:11,goalDifference:8}
const right:StandingRow={position:4,teamId:'58',team:'Example B',played:5,won:2,drawn:2,lost:1,points:8,goalsFor:5,goalsAgainst:6,goalDifference:-1}
describe('M16 source-bound comparison',()=>{
 it('preserves official positions and point deductions; exposes no made-up source fields',()=>{
  const result=sourceBoundComparison(left,right)
  expect(result.positions).toEqual([3,4])
  expect(result.officialPoints).toEqual([-2,8])
  expect(result.goalsForPerMatch).toEqual([1.9,1])
  expect(result.goalsAgainstPerMatch).toEqual([1.1,1.2])
  expect(result.winRate).toEqual([50,40])
  expect(JSON.stringify(result)).not.toMatch(/prediction|recentForm|headToHead|xG/i)
 })
 it('reports missing rates for zero played matches, not imaginary zeros',()=>{
  const zero={...left,played:0,won:0,goalsFor:0,goalsAgainst:0}
  const result=sourceBoundComparison(zero,right)
  expect(result.winRate[0]).toBeNull()
  expect(result.goalsForPerMatch[0]).toBeNull()
  expect(result.officialPoints[0]).toBe(-2)
 })
})
