import { updateCompletedAppointments } from './updateCompletedAppointments'

declare global {
  // eslint-disable-next-line no-var
  var appointmentCompletionJobStarted: boolean | undefined
}

const JOB_INTERVAL_MS = 2 * 60_000

export function startAppointmentCompletionJob(): void {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  if (globalThis.appointmentCompletionJobStarted) {
    return
  }

  globalThis.appointmentCompletionJobStarted = true

  setInterval(async () => {
    try {
      const count = await updateCompletedAppointments()
      if (count > 0) {
        console.info(`[appointments] background auto-completed ${count} appointment(s)`) // eslint-disable-line no-console
      }
    } catch (error) {
      console.error('[appointments] failed to auto-complete appointments', error) // eslint-disable-line no-console
    }
  }, JOB_INTERVAL_MS)
}
