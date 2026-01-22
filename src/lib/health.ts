import { prisma } from './prisma'

type HealthDbStatus = {
  status: 'ok' | 'down'
  latencyMs?: number
  error?: string
}

type HealthMemory = {
  rss: number
  heapUsed: number
  heapTotal: number
  external: number
}

type HealthBuildInfo = {
  gitCommit?: string
  vercelUrl?: string
  environment?: string
}

export type HealthSnapshot = {
  status: 'ok' | 'degraded'
  timestamp: string
  uptimeSeconds: number
  nodeVersion: string
  memory: HealthMemory
  db: HealthDbStatus
  build?: HealthBuildInfo
}

const MAX_ERROR_LENGTH = 200

function sanitizeErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error)
  const normalized = raw.replace(/\s+/g, ' ').trim()
  const maskedUrl = normalized.replace(/(postgres(?:ql)?:\/\/)[^\s]+/gi, '$1***')
  const maskedPassword = maskedUrl.replace(/password=[^\s]+/gi, 'password=***')
  const maskedUser = maskedPassword.replace(/user=[^\s]+/gi, 'user=***')
  return maskedUser.slice(0, MAX_ERROR_LENGTH)
}

function buildInfo(): HealthBuildInfo | undefined {
  const info: HealthBuildInfo = {}

  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    info.gitCommit = process.env.VERCEL_GIT_COMMIT_SHA
  }

  if (process.env.VERCEL_URL) {
    info.vercelUrl = process.env.VERCEL_URL
  }

  const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV
  if (environment) {
    info.environment = environment
  }

  return Object.keys(info).length > 0 ? info : undefined
}

export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  const memory = process.memoryUsage()
  const timestamp = new Date().toISOString()

  let dbStatus: HealthDbStatus
  const start = Date.now()

  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = { status: 'ok', latencyMs: Date.now() - start }
  } catch (error) {
    dbStatus = {
      status: 'down',
      error: sanitizeErrorMessage(error),
    }
  }

  const status = dbStatus.status === 'ok' ? 'ok' : 'degraded'

  return {
    status,
    timestamp,
    uptimeSeconds: process.uptime(),
    nodeVersion: process.version,
    memory: {
      rss: memory.rss,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
    },
    db: dbStatus,
    build: buildInfo(),
  }
}
