import { testApiHandler } from 'next-test-api-route-handler'
import handler from '../../src/pages/api/health'

describe('GET /api/health', () => {
  it('returns health snapshot when database is reachable', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        expect(response.status).toBe(200)

        const body = await response.json()

        expect(body).toMatchObject({
          status: 'ok',
          db: { status: 'ok' },
        })
        expect(body).toHaveProperty('timestamp')
        expect(body).toHaveProperty('uptimeSeconds')
        expect(body).toHaveProperty('nodeVersion')
        expect(body).toHaveProperty('memory')
      },
    })
  })
})
