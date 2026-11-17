/** Pure UTC/KST calendar helpers. Korea does not observe daylight-saving time. */
export function validDay(day: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
}
export function shiftDay(day: string, days: number): string {
  if (!validDay(day)) throw new Error('invalid_date')
  const shifted = new Date(Date.parse(day) + days * 86_400_000)
  if (!Number.isFinite(shifted.valueOf())) throw new Error('invalid_date')
  return shifted.toISOString().slice(0,10)
}
export function kstDayFromUtc(iso: string): string {
  const time = Date.parse(iso)
  if (!Number.isFinite(time)) throw new Error('invalid_date')
  return new Date(time + 9*60*60*1000).toISOString().slice(0,10)
}
export function todayInKst(now:Date=new Date()): string {
  return kstDayFromUtc(now.toISOString())
}
export function fixtureDay(iso:string, zone:'UTC'|'KST'):string {
  return zone==='KST'?kstDayFromUtc(iso):iso.slice(0,10)
}
