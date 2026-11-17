import { createServer, request } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, it, vi } from 'vitest'
import { createHandler } from './http.js'
describe('loopback HTTP boundary', () => {
  it('rejects hostile hosts/origins/methods, sends no-store/no CORS and sanitizes failures', async () => {
    const gateway = vi.fn().mockResolvedValue({status: 503, body: {error: 'provider_disabled'}})
    const server = createServer(createHandler(gateway))
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const port = (server.address() as AddressInfo).port
    const get = (headers: Record<string, string> = {}, method = 'GET') => new Promise<{status: number; headers: Record<string, unknown>; body: string}>((resolve, reject) => {
      const req = request({host: '127.0.0.1', port, path: '/api/standings?competition=PL', method, headers: {Host: '127.0.0.1:8787', ...headers}}, res => {
        let body = ''
        res.setEncoding('utf8').on('data', chunk => { body += chunk }).on('end', () => resolve({status: res.statusCode!, headers: res.headers, body}))
      })
      req.on('error', reject).end()
    })
    try {
      for (const headers of [{Host: 'evil.example'}, {Origin: 'https://evil.example'}, {'Sec-Fetch-Site': 'cross-site'}] as Record<string, string>[]) expect((await get(headers)).status).toBe(403)
      expect((await get({}, 'POST')).status).toBe(405)
      expect(gateway).not.toHaveBeenCalled()
      const response = await get()
      expect(response.status).toBe(503)
      expect(response.headers['cache-control']).toBe('no-store')
      expect(response.headers['access-control-allow-origin']).toBeUndefined()
      gateway.mockResolvedValueOnce({status: 429, body: {error: 'local_rate_limit'}, retryAfter: 60})
      expect((await get()).headers['retry-after']).toBe('60')
      gateway.mockRejectedValueOnce(new Error('private-value'))
      expect((await get()).body).toBe('{"error":"internal_error"}')
    } finally { await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve())) }
  })
})
