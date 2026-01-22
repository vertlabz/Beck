import { testApiHandler } from 'next-test-api-route-handler'
import registerHandler from '../../src/pages/api/auth/register'
import loginHandler from '../../src/pages/api/auth/login'
import { resetDatabase } from '../helpers/db'

describe('Auth API', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('registers and logs in a user', async () => {
    const email = 'healthcheck@example.com'
    const password = 'securepass123'

    await testApiHandler({
      handler: registerHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email,
            password,
            isProvider: false,
          }),
        })

        expect(response.status).toBe(201)
        const body = await response.json()
        expect(body).toMatchObject({ email, isProvider: false })
      },
    })

    await testApiHandler({
      handler: loginHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
          }),
        })

        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body).toHaveProperty('accessToken')
        expect(body).toHaveProperty('user')
      },
    })
  })
})
