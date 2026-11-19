/** Primary navigation has five stable destinations; detail routes belong to their parent. */
export function isPrimarySectionActive(pathname:string,section:string):boolean{
  if(section==='/')return pathname==='/'||pathname.startsWith('/match/')||pathname.startsWith('/real-match/')
  if(section==='/leagues')return pathname==='/leagues'||pathname==='/standings'||pathname.startsWith('/team/')
  if(section==='/more')return pathname==='/more'||pathname==='/settings'||pathname==='/about'
  return pathname===section
}
