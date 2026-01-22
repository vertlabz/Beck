import type { GetServerSideProps } from 'next'
import { getHealthSnapshot, type HealthSnapshot } from '../lib/health'
import styles from './health.module.css'

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

type HealthProps = {
  snapshot: HealthSnapshot
}

function formatBytes(value: number) {
  if (value === 0) return '0 B'

  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )
  const converted = value / 1024 ** exponent

  return `${converted.toFixed(2)} ${BYTE_UNITS[exponent]}`
}

function formatSeconds(value: number) {
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const seconds = Math.floor(value % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }

  return `${seconds}s`
}

export const getServerSideProps: GetServerSideProps<HealthProps> = async ({ res }) => {
  const snapshot = await getHealthSnapshot()

  if (res && snapshot.status === 'degraded') {
    res.statusCode = 503
  }

  return {
    props: {
      snapshot,
    },
  }
}

export default function HealthPage({ snapshot }: HealthProps) {
  const { status, uptimeSeconds, timestamp, nodeVersion, memory, db, build } = snapshot
  const isOk = status === 'ok'

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Monitoramento</p>
            <h1 className={styles.title}>Saúde do sistema</h1>
            <p className={styles.subtitle}>Endpoint: GET /health</p>
          </div>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={() => window.location.reload()}
          >
            Atualizar
          </button>
        </header>

        <section className={styles.mainCard}>
          <div>
            <h2 className={styles.cardTitle}>Status geral</h2>
            <p className={styles.cardMeta}>Atualizado em {new Date(timestamp).toLocaleString()}</p>
          </div>
          <span className={isOk ? styles.badgeOk : styles.badgeDegraded}>
            {isOk ? 'OK' : 'DEGRADED'}
          </span>
        </section>

        <div className={styles.grid}>
          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Banco de dados</h3>
            <p className={styles.cardValue}>{db.status === 'ok' ? 'Conectado' : 'Indisponível'}</p>
            <p className={styles.cardMeta}>
              {db.status === 'ok'
                ? `Latência: ${db.latencyMs ?? 0} ms`
                : db.error ?? 'Erro de conexão'}
            </p>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Runtime</h3>
            <p className={styles.cardValue}>{formatSeconds(uptimeSeconds)} de uptime</p>
            <p className={styles.cardMeta}>Node {nodeVersion}</p>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Memória</h3>
            <ul className={styles.list}>
              <li>RSS: {formatBytes(memory.rss)}</li>
              <li>Heap usado: {formatBytes(memory.heapUsed)}</li>
              <li>Heap total: {formatBytes(memory.heapTotal)}</li>
              <li>Externa: {formatBytes(memory.external)}</li>
            </ul>
          </section>

          <section className={styles.card}>
            <h3 className={styles.cardTitle}>Build</h3>
            {build ? (
              <ul className={styles.list}>
                <li>Commit: {build.gitCommit ?? 'N/A'}</li>
                <li>URL: {build.vercelUrl ?? 'N/A'}</li>
                <li>Ambiente: {build.environment ?? 'N/A'}</li>
              </ul>
            ) : (
              <p className={styles.cardMeta}>Informações não disponíveis.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
