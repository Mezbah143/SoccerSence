import {describe,expect,it} from 'vitest'
import {isPrimarySectionActive} from './primaryNavigation'
describe('five-item navigation ownership',()=>{
  it.each([['/','/'],['/match/demo-1','/'],['/real-match/42','/'],['/standings','/leagues'],['/team/57','/leagues'],['/leagues','/leagues'],['/favorites','/favorites'],['/news','/news'],['/settings','/more'],['/about','/more'],['/more','/more']])('%s highlights %s', (path,section)=>{
    expect(isPrimarySectionActive(path,section)).toBe(true)
  })
  it('does not incorrectly mark search or unrelated tabs active',()=>{
    expect(isPrimarySectionActive('/search','/')).toBe(false)
    expect(isPrimarySectionActive('/news','/favorites')).toBe(false)
    expect(isPrimarySectionActive('/standings','/')).toBe(false)
  })
})
