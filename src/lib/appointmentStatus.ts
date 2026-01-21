export function getAppointmentStatusLabel(status: string): string {
  switch (status) {
    case 'SCHEDULED':
      return 'Não iniciado'
    case 'CANCELED':
      return 'Cancelado'
    case 'DONE':
      return 'Concluído'
    default:
      return status
  }
}
