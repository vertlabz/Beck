// src/middleware/requireAuth.ts
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { verifyAccessToken } from '../lib/auth'
import { applyCors } from '../lib/cors'

export function requireAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest & { user?: { userId: string } }, res: NextApiResponse) => {
    try {
      const isAppointmentsRoute = req.url?.startsWith('/api/appointments')
      if (isAppointmentsRoute && (req.method === 'OPTIONS' || req.method === 'POST')) {
        const origin = req.headers.origin ?? 'unknown'
        const authHeader = req.headers.authorization
        const authPreview =
          typeof authHeader === 'string' ? `${authHeader.slice(0, 10)}...` : 'none'
        if (req.method === 'OPTIONS') {
          const requestedMethod = req.headers['access-control-request-method'] ?? 'unknown'
          const requestedHeaders = req.headers['access-control-request-headers'] ?? 'unknown'
          console.info(
            `[appointments] OPTIONS origin=${origin} acrm=${requestedMethod} acrh=${requestedHeaders} auth=${authPreview}`
          )
        } else {
          console.info(`[appointments] POST origin=${origin} auth=${authPreview}`)
        }
      }

      if (applyCors(req, res)) {
        return
      }

      const auth = req.headers.authorization
      if (!auth) return res.status(401).json({ error: 'No authorization header' })

      const [scheme, token] = auth.split(' ')
      if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Invalid authorization format' })
      }

      const payload = verifyAccessToken(token)
      req.user = { userId: payload.userId }

      return handler(req, res)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
