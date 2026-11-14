import type { IncomingMessage, ServerResponse } from 'node:http'
import type { GatewayResult } from './gateway.js'
import { error } from './gateway.js'

export function createHandler(gateway: (path: string) => Promise<GatewayResult>) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    let result: GatewayResult
    // Exact host validation also rejects DNS rebinding; cross-site browser requests get no CORS grant.
    if (req.headers.host !== '127.0.0.1:8787' ||
        (req.headers.origin !== undefined && req.headers.origin !== 'http://127.0.0.1:8787') ||
        req.headers['sec-fetch-site'] === 'cross-site') result = error(403, 'local_access_only')
    else if (req.method !== 'GET') result = error(405, 'method_not_allowed')
    else {
      try { result = await gateway(req.url ?? '') }
      catch { result = error(500, 'internal_error') }
    }
    res.writeHead(result.status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      ...(result.status === 405 ? { Allow: 'GET' } : {}),
      ...(result.retryAfter ? { 'Retry-After': String(result.retryAfter) } : {}),
    })
    res.end(JSON.stringify(result.body))
  }
}
