// src/pages/api/providers/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { applyCors } from '../../../lib/cors'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ CORS + preflight (OPTIONS)
  if (applyCors(req, res)) return

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }

  const providers = await prisma.user.findMany({
    where: { isProvider: true },
    select: {
      id: true,
      name: true,
      email: true,
      isProvider: true,
      services: {
        select: {
          id: true,
          name: true,
          duration: true,
          price: true,
        },
      },
    },
  })

  return res.status(200).json({ providers })
}
