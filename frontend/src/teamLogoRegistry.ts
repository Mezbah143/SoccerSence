/**
 * M18 rights-reviewed team crest registry.
 * Only commit locally hosted, explicitly approved assets and matching records.
 * NEVER derive logo URLs from IDs or forward provider crest URLs.
 */
export type ApprovedTeamLogo = {
  src: string
  rightsHolder: string
  permissionReference: string
  permittedUse: 'public-web-display'
}
export const APPROVED_TEAM_LOGOS: Readonly<Record<string,ApprovedTeamLogo>> = Object.freeze({
  // Intentionally empty until a rights holder authorizes specific artwork.
  // '57': {src:'/logos/teams/57.svg',rightsHolder:'...',permissionReference:'...',permittedUse:'public-web-display'},
})
const safeId=(id:unknown):id is string=>typeof id==='string'&&/^[1-9]\d{0,14}$/.test(id)
const safePath=(path:string,id:string)=>new RegExp('^/logos/teams/'+id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\.(?:svg|png|webp)$').test(path)
/** Invalid or unreviewed crest references never initiate image downloads. */
export function approvedTeamLogoSrc(teamId:unknown):string|null{
  if(!safeId(teamId))return null
  const record=APPROVED_TEAM_LOGOS[teamId]
  return record&&record.permittedUse==='public-web-display'&&record.rightsHolder.trim()&&record.permissionReference.trim()&&safePath(record.src,teamId)?record.src:null
}
export function teamInitials(name:string):string{
  const words=name.trim().split(/\s+/).filter(Boolean)
  if(!words.length)return '?'
  return (words.length>1?words.slice(0,2).map(w=>w[0]).join(''):words[0].slice(0,2)).toLocaleUpperCase()
}
