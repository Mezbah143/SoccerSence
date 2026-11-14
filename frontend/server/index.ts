import { createServer } from 'node:http'
import { createGateway } from './gateway.js'
import { createHandler } from './http.js'

const gateway = createGateway({
  enabled: process.env.DATA_MODE === 'football-data-local',
  freePlanConfirmed: process.env.FOOTBALL_FREE_PLAN_CONFIRMED === 'true',
  rightsReview: process.env.FOOTBALL_RIGHTS_REVIEW ?? '',
  token: process.env.FOOTBALL_API_KEY ?? '',
})
const server = createServer(createHandler(gateway))
server.requestTimeout = 10_000
server.headersTimeout = 10_000
server.listen(8787, '127.0.0.1', () => {
  console.info('SoccerSense local data gateway: http://127.0.0.1:8787 (no public hosting)')
})
server.on('error', () => { console.error('Local gateway could not start. Check whether port 8787 is already in use.'); process.exitCode = 1 })
