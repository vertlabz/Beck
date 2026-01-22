if (!process.env.DATABASE_URL_TEST) {
  throw new Error('DATABASE_URL_TEST must be set for integration tests')
}

process.env.DATABASE_URL = process.env.DATABASE_URL_TEST

afterAll(async () => {
  const { prisma } = await import('../src/lib/prisma')
  await prisma.$disconnect()
})
