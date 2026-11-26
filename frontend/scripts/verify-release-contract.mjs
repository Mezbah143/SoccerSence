import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'

/** Architectural regression gates, not security certification or permission to publish real data. */
const read=(path)=>readFileSync(resolve(path),'utf8')
const app=read('src/App.tsx')
const gateway=read('server/index.ts')
const vite=read('vite.config.ts')
const competitions=read('src/localCompetitions.ts')
const aggregate=read('src/aggregatedFixtures.ts')
const assertions=[
  ['Real match centre stays development-only',app.includes('import.meta.env.DEV?<AllLeaguesMatchCentre/>')],
  ['Real team profiles stay development-only',app.includes('import.meta.env.DEV?<LocalTeamProfile/>')],
  ['Standings stay development-only',app.includes('import.meta.env.DEV?<LocalStandings/>')],
  ['Gateway listens only on loopback',/server\.listen\(8787,\s*'127\.0\.0\.1'/.test(gateway)],
  ['Frontend development server binds loopback only',/host:\s*'127\.0\.0\.1'/.test(vite)],
  ['Server-only token originates in process environment',gateway.includes("process.env.FOOTBALL_API_KEY")],
  ['Nine competition definitions present', ['PL','PD','BL1','SA','FL1','DED','CL','WC','EC'].every(code=>new RegExp("code:'"+code+"'").test(competitions))],
  ['Consolidated data uses local gateway',aggregate.includes("fetch('/api/all-fixtures?date=")],
]
const failures=assertions.filter(([,ok])=>!ok).map(([label])=>label)
for(const [label,ok] of assertions)console.info((ok?'PASS ':'FAIL ')+label)
if(failures.length){console.error('M17 release contract regression: '+failures.join('; '));process.exitCode=1}
else console.info('M17 source contract guard passed. Public real-data release remains blocked without provider rights.')
