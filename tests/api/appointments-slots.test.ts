import { testApiHandler } from 'next-test-api-route-handler'
import handler from '../../src/pages/api/appointments/slots'
import { prisma } from '../../src/lib/prisma'
import { resetDatabase } from '../helpers/db'
import { OFFSET_MS, getSaoPauloDayRangeFromLocalDate } from '../../src/lib/saoPauloTime'

describe('GET /api/appointments/slots', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('returns available slots for a provider', async () => {
    const provider = await prisma.user.create({
      data: {
        name: 'Provider Test',
        email: 'provider@example.com',
        password: 'hashed',
        isProvider: true,
        maxBookingDays: 10,
      },
    })

    const service = await prisma.service.create({
      data: {
        name: 'Corte',
        duration: 30,
        price: 50,
        providerId: provider.id,
      },
    })

    const localNowMs = Date.now() - OFFSET_MS
    const localDate = new Date(localNowMs)
    localDate.setUTCDate(localDate.getUTCDate() + 1)

    const year = localDate.getUTCFullYear()
    const month = String(localDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(localDate.getUTCDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const { weekday } = getSaoPauloDayRangeFromLocalDate(dateStr)

    await prisma.providerAvailability.create({
      data: {
        providerId: provider.id,
        weekday,
        startTime: '09:00',
        endTime: '11:00',
      },
    })

    await testApiHandler({
      handler,
      url: `/api/appointments/slots?providerId=${provider.id}&date=${dateStr}&serviceId=${service.id}`,
      test: async ({ fetch }) => {
        const response = await fetch({ method: 'GET' })
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(Array.isArray(body.slots)).toBe(true)
        expect(body.slots.length).toBeGreaterThan(0)
      },
    })
  })
})
