import {useEffect,useState} from 'react'
import {isLocalCompetition,type LocalCompetitionCode} from './localCompetitions'

export type Favorite = {kind:'league';id:LocalCompetitionCode;name:string}|{kind:'team';id:string;name:string;competition:LocalCompetitionCode}
export type Preferences = {compactCards:boolean;reduceMotion:boolean}
export const DEFAULT_PREFERENCES:Preferences={compactCards:false,reduceMotion:false}
const FAVORITES_KEY='soccersense-favorites-v1'
const PREFS_KEY='soccersense-preferences-v1'
const EVENT='soccersense-preferences-changed'
const isObject=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x)
const validTeam=(id:unknown):id is string=>typeof id==='string'&&/^[1-9]\d{0,8}$/.test(id)
const validName=(name:unknown):name is string=>typeof name==='string'&&name.trim().length>0&&name.length<=120
export function validateFavorites(value:unknown):Favorite[]{
  if(!Array.isArray(value))return []
  const seen=new Set<string>()
  const result:Favorite[]=[]
  for(const candidate of value.slice(0,60)){
    if(!isObject(candidate)||!validName(candidate.name))continue
    let item:Favorite
    if(candidate.kind==='league'&&isLocalCompetition(candidate.id)){
      item={kind:'league',id:candidate.id,name:candidate.name}
    }else if(candidate.kind==='team'&&validTeam(candidate.id)&&isLocalCompetition(candidate.competition)){
      item={kind:'team',id:candidate.id,name:candidate.name,competition:candidate.competition}
    }else continue
    const key=item.kind+':'+item.id+(item.kind==='team'?':'+item.competition:'')
    if(seen.has(key))continue
    seen.add(key);result.push(item)
  }
  return result.slice(0,30)
}
export function validatePreferences(value:unknown):Preferences{
  if(!isObject(value))return DEFAULT_PREFERENCES
  return {compactCards:value.compactCards===true,reduceMotion:value.reduceMotion===true}
}
function read(key:string):unknown{
  try{const text=window.localStorage.getItem(key);return text?JSON.parse(text):null}catch{return null}
}
export function getFavorites():Favorite[]{return validateFavorites(read(FAVORITES_KEY))}
export function getPreferences():Preferences{return validatePreferences(read(PREFS_KEY))}
function write(key:string,value:unknown){
  try{window.localStorage.setItem(key,JSON.stringify(value))}catch{ /* private browsing/storage disabled: changes are not persisted */ }
  window.dispatchEvent(new Event(EVENT))
}
export function favoriteKey(item:Favorite):string{return item.kind+':'+item.id+(item.kind==='team'?':'+item.competition:'')}
export function toggleFavorite(item:Favorite):Favorite[]{
  const normalized=validateFavorites([item])[0]
  if(!normalized)return getFavorites()
  const list=getFavorites(),key=favoriteKey(normalized)
  const updated=list.some(entry=>favoriteKey(entry)===key)?list.filter(entry=>favoriteKey(entry)!==key):validateFavorites([...list,normalized])
  write(FAVORITES_KEY,updated)
  return updated
}
export function savePreferences(next:Preferences){write(PREFS_KEY,validatePreferences(next))}
export function clearFavorites(){write(FAVORITES_KEY,[])}
function useSaved<T>(reader:()=>T):T{
  const [value,setValue]=useState(reader)
  useEffect(()=>{
    const update=()=>setValue(reader())
    window.addEventListener(EVENT,update)
    window.addEventListener('storage',update)
    return ()=>{window.removeEventListener(EVENT,update);window.removeEventListener('storage',update)}
  },[reader])
  return value
}
export function useFavorites(){return useSaved(getFavorites)}
export function usePreferences(){return useSaved(getPreferences)}
