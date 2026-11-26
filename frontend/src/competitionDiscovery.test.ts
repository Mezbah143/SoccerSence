import {describe,expect,it} from 'vitest'
import {findStandingRows,standingPeers,tableSnapshot} from './competitionDiscovery'
import type {StandingTable} from './localStandings'
const table:StandingTable={stage:'REGULAR_SEASON',group:null,rows:[
{position:1,teamId:'57',team:'Alpha Club',played:8,won:5,drawn:1,lost:2,points:16,goalsFor:14,goalsAgainst:8,goalDifference:6},
{position:2,teamId:'65',team:'Bravo FC',played:8,won:4,drawn:2,lost:2,points:14,goalsFor:12,goalsAgainst:9,goalDifference:3},
{position:3,teamId:'397',team:'Charlie Club',played:8,won:3,drawn:2,lost:3,points:11,goalsFor:10,goalsAgainst:11,goalDifference:-1},
{position:4,teamId:'90',team:'Delta FC',played:8,won:2,drawn:1,lost:5,points:7,goalsFor:6,goalsAgainst:13,goalDifference:-7},
]}
describe('M15 verified table discovery',()=>{
 it('filters within verified names case-insensitively without mutating source',()=>{
  expect(findStandingRows(table.rows,'  CLUB ' ).map(r=>r.teamId)).toEqual(['57','397'])
  expect(findStandingRows(table.rows,'unknown')).toEqual([])
  expect(findStandingRows(table.rows,'')).toHaveLength(4)
  expect(table.rows).toHaveLength(4)
 })
 it('summarizes the official leader instead of recomputing point positions',()=>{
  expect(tableSnapshot(table)).toMatchObject({clubs:4,goalsForTotal:42,top:table.rows[0]})
  expect(tableSnapshot({...table,rows:[]})).toMatchObject({clubs:0,top:null})
 })
 it('returns only same-table peers ordered by distance and excludes clicked team',()=>{
  expect(standingPeers(table,'397').map(r=>r.teamId)).toEqual(['65','90','57'])
 })
})
