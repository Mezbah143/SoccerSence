import {afterEach,describe,expect,it,vi} from 'vitest'
import {favoriteMatches} from './FavoritesHub'
import {favoriteKey,getFavorites,moveFavorite,toggleFavorite,validateFavorites,type Favorite} from './localPreferences'

const league:Favorite={kind:'league',id:'PL',name:'Premier League'}
const laLiga:Favorite={kind:'league',id:'PD',name:'La Liga'}
const club:Favorite={kind:'team',id:'57',name:'Example FC',competition:'PD'}
function mockStorage(initial:Favorite[]=[]){
  const storage=new Map<string,string>([['soccersense-favorites-v1',JSON.stringify(initial)]])
  vi.stubGlobal('window',{
    localStorage:{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,val:string)=>{storage.set(key,val)}},
    dispatchEvent:vi.fn(),
  })
}
afterEach(()=>vi.unstubAllGlobals())
describe('M8 favorites filters and shortcuts',()=>{
  it('filters by supported kind, name, league code and parent league',()=>{
    expect(favoriteMatches(league,'league','premier')).toBe(true)
    expect(favoriteMatches(league,'team','premier')).toBe(false)
    expect(favoriteMatches(club,'team','la liga')).toBe(true)
    expect(favoriteMatches(club,'all','pd')).toBe(true)
    expect(favoriteMatches(club,'team','unrelated')).toBe(false)
  })
  it('keeps names and IDs bounded after saving and never accepts unsafe routes',()=>{
    expect(validateFavorites([club,{kind:'team',id:'../../etc',competition:'PL',name:'Unsafe'}])).toEqual([club])
    expect(favoriteKey(club)).toBe('team:57:PD')
  })
  it('reorders saved items and keeps the order in browser storage',()=>{
    mockStorage([league,laLiga,club])
    expect(moveFavorite(club,-1)).toEqual([league,club,laLiga])
    expect(getFavorites()).toEqual([league,club,laLiga])
    expect(moveFavorite(league,-1)).toEqual([league,club,laLiga])
    expect(moveFavorite(club,1)).toEqual([league,laLiga,club])
  })
  it('removes an item without disturbing the saved positions of the others',()=>{
    mockStorage([league,club,laLiga])
    expect(toggleFavorite(club)).toEqual([league,laLiga])
    expect(getFavorites()).toEqual([league,laLiga])
  })
  it('never creates an item when reordering a nonexistent favorite',()=>{
    mockStorage([league])
    expect(moveFavorite(club,1)).toEqual([league])
    expect(getFavorites()).toEqual([league])
  })
})
