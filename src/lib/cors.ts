// src/lib/cors.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const LOCAL_ORIGINS = new Set([
  'http://localhost:8081', // Expo Web (seu caso)
  'http://localhost:19006', // Expo web em alguns setups
  'http://localhost:3000',
  'http://localhost:3001',
])

function isAllowedOrigin(origin: string): boolean {
  if (LOCAL_ORIGINS.has(origin)) return true

  // Produção / previews do seu web admin na Vercel
  // Aceita:
  // - https://vitinho-barber-web-admin.vercel.app
  // - https://vitinho-barber-web-admin-<hash>-vertlabzs-projects.vercel.app (previews)
  if (
    /^https:\/\/vitinho-barber-web-admin(\-[a-z0-9-]+)?\.vercel\.app$/i.test(origin) ||
    /^https:\/\/vitinho-barber-web-admin\-[a-z0-9-]+\-vertlabzs-projects\.vercel\.app$/i.test(origin)
  ) {
    return true
  }

  // Se depois você colocar domínio próprio, inclua aqui:
  // if (origin === 'https://seu-dominio.com') return true

  return false
}

/**
 * Aplica CORS e lida com preflight OPTIONS.
 * Retorna true se a request foi finalizada (OPTIONS), e o handler deve dar return.
 */
export function applyCors(req: NextApiRequest, res: NextApiResponse): boolean {
  const origin = req.headers.origin

  if (typeof origin === 'string' && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    // Você usa refresh token em cookie. Se o front usar cookie, precisa disso:
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }

  return false
}
