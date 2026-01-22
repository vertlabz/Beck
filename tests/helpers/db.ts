import { prisma } from '../../src/lib/prisma'

export async function resetDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetDatabase can only run in test environment')
  }

  await prisma.$transaction([
    prisma.appointment.deleteMany(),
    prisma.providerBlock.deleteMany(),
    prisma.providerAvailability.deleteMany(),
    prisma.service.deleteMany(),
    prisma.token.deleteMany(),
    prisma.user.deleteMany(),
  ])
}
