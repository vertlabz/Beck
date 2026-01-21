# Deploy na Vercel + Neon (Postgres)

Este projeto é um Next.js (pages router) com API Routes (`/pages/api/*`). Na Vercel, o front e o backend sobem juntos.

## 1) Criar o banco no Neon
1. Crie um projeto no Neon.
2. Copie **duas** connection strings:
   - **Pooled (runtime)**: use como `DATABASE_URL` (boa para serverless).
   - **Direct (migrations)**: use como `DIRECT_URL`.

Se você não tiver uma URL direct separada, pode (temporariamente) colocar `DIRECT_URL` igual a `DATABASE_URL`.

> Dica: mantenha `sslmode=require` nas duas.

## 2) Variáveis de ambiente na Vercel
No painel do projeto (Settings → Environment Variables), adicione:

- `DATABASE_URL` = pooled URL do Neon
- `DIRECT_URL` = direct URL do Neon
- `JWT_SECRET` = uma string forte
- `JWT_EXPIRES_IN` = `2h` (ou o que você preferir)
- `JWT_REFRESH_EXPIRES_DAYS` = `30`
- `REFRESH_TOKEN_COOKIE_NAME` = `rtk`
- `REFRESH_TOKEN_COOKIE_PATH` = `/`

## 3) Build e migrations
Este repo já inclui `vercel.json` com:
- `installCommand`: instala devDependencies (necessário para prisma/typescript em builds)
- `buildCommand`: roda `npm run build:vercel`

O script `build:vercel` faz:
1. `prisma migrate deploy`
2. `prisma generate`
3. `next build`

Assim, ao deployar, as migrations são aplicadas automaticamente no Neon.

## 4) Deploy
- Suba o código para o GitHub.
- Importe o repo no painel da Vercel.
- Garanta que as env vars acima estão cadastradas.
- Deploy.

## 5) Notas sobre cookies (refresh token)
- Em produção, o cookie é marcado como `Secure` automaticamente (`NODE_ENV=production`).
- Se você consumir a API de OUTRO domínio (ex.: um admin em outro domínio), pode precisar ajustar `SameSite` para `none` e usar HTTPS.
