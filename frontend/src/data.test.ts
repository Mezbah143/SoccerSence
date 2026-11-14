import {describe,it,expect} from 'vitest'
import {fixtures,leagues,matchesOn} from './data'
describe('demo fixtures',()=>{it('filters by day and competition',()=>{expect(matchesOn('2026-11-14','Demo Premier League')).toHaveLength(2);expect(matchesOn('2026-12-01','All competitions')).toHaveLength(0)});it('has an all filter',()=>{expect(leagues[0]).toBe('All competitions')});it('keeps scheduled scores unknown',()=>{expect(fixtures.filter(m=>m.status==='scheduled').every(m=>m.score===undefined)).toBe(true)})})
