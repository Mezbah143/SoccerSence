export type Fixture = {id:string;competition:string;home:string;away:string;date:string;time:string;status:'scheduled'|'finished';score?:[number,number]}
export const fixtures:Fixture[]=[
{id:'1',competition:'Demo Premier League',home:'Northbridge FC',away:'Riverside United',date:'2026-11-14',time:'12:30 UTC',status:'finished',score:[2,1]},
{id:'2',competition:'Demo Premier League',home:'Evergreen Athletic',away:'Coastal City',date:'2026-11-14',time:'17:00 UTC',status:'scheduled'},
{id:'3',competition:'Demo Continental Cup',home:'Mountain Rovers',away:'Valley Stars',date:'2026-11-14',time:'20:00 UTC',status:'scheduled'},
{id:'4',competition:'Demo Premier League',home:'Riverside United',away:'Evergreen Athletic',date:'2026-11-15',time:'14:00 UTC',status:'scheduled'}]
export const leagues=['All competitions',...new Set(fixtures.map(m=>m.competition))]
export const matchesOn=(date:string,league:string)=>fixtures.filter(m=>m.date===date&&(league==='All competitions'||m.competition===league))
