import type { NextApiRequest, NextApiResponse } from 'next'
import { getHealthSnapshot } from '../../lib/health'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0')

  const snapshot = await getHealthSnapshot()
  const statusCode = snapshot.status === 'ok' ? 200 : 503

  return res.status(statusCode).json(snapshot)
}
