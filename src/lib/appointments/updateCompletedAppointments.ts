import { AppointmentStatus, Prisma } from '@prisma/client'
import { prisma } from '../prisma'

type UpdateCompletedAppointmentsOptions = {
  now?: Date
  customerId?: string
  providerId?: string
}

export async function updateCompletedAppointments(
  options: UpdateCompletedAppointmentsOptions = {}
): Promise<number> {
  const { now = new Date(), customerId, providerId } = options

  const where: Prisma.AppointmentWhereInput = {
    status: { notIn: [AppointmentStatus.CANCELED, AppointmentStatus.DONE] },
    date: { lte: now },
  }

  if (customerId) {
    where.customerId = customerId
  }

  if (providerId) {
    where.providerId = providerId
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      service: { select: { duration: true } },
    },
  })

  const completedIds = appointments
    .filter(appointment => {
      const durationMinutes = appointment.service?.duration ?? 0
      const endTime = new Date(appointment.date.getTime() + durationMinutes * 60_000)
      return endTime <= now
    })
    .map(appointment => appointment.id)

  if (completedIds.length === 0) {
    return 0
  }

  const { count } = await prisma.appointment.updateMany({
    where: { id: { in: completedIds } },
    data: { status: AppointmentStatus.DONE },
  })

  console.info(`[appointments] auto-completed ${count} appointment(s)`) // eslint-disable-line no-console
  return count
}
