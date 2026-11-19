import type {LocalFixture,LocalFixturesResult} from './localFixtures'

export type MatchPresentation = {label:string;tone:'finished'|'scheduled'|'delayed'|'neutral';scoreLabel:string;hasScore:boolean}
const STATUS:Record<string,{label:string;tone:MatchPresentation['tone']}>={
  FINISHED:{label:'Full time',tone:'finished'},
  TIMED:{label:'Scheduled',tone:'scheduled'},
  SCHEDULED:{label:'Scheduled',tone:'scheduled'},
  POSTPONED:{label:'Postponed',tone:'neutral'},
  CANCELLED:{label:'Cancelled',tone:'neutral'},
  SUSPENDED:{label:'Suspended',tone:'neutral'},
  IN_PLAY:{label:'In progress · delayed',tone:'delayed'},
  PAUSED:{label:'Paused · delayed',tone:'delayed'},
  LIVE:{label:'In progress · delayed',tone:'delayed'},
  AWARDED:{label:'Awarded',tone:'neutral'},
}
export function presentMatch(match:Pick<LocalFixture,'status'|'homeScore'|'awayScore'>):MatchPresentation{
  const known=STATUS[match.status]
  const label=known?.label??'Status unavailable'
  const hasScore=match.homeScore!==null&&match.awayScore!==null
  return {label,tone:known?.tone??'neutral',hasScore,
    scoreLabel:hasScore?match.homeScore+' : '+match.awayScore:'Score not available'}
}
/** Only navigate among matches in the already-validated same-day response. */
export function nearbyMatches(result:LocalFixturesResult,currentId:string){
  const index=result.matches.findIndex(m=>m.id===currentId)
  if(index<0)return {previous:null,next:null,index:0,total:result.matches.length}
  return {previous:result.matches[index-1]??null,next:result.matches[index+1]??null,
    index:index+1,total:result.matches.length}
}
