import { apiClient, unwrap } from './client'

export const bookingsApi = {
  list: (params) => apiClient.get('/bookings', { params }).then(unwrap),
  get: (referenceNumber) => apiClient.get(`/bookings/${referenceNumber}`).then(unwrap),
  create: (payload) => apiClient.post('/bookings', payload).then(unwrap),
  pay: (referenceNumber, payload) => apiClient.patch(`/bookings/${referenceNumber}/pay`, payload).then(unwrap),
  checkout: (referenceNumber) => apiClient.patch(`/bookings/${referenceNumber}/checkout`).then(unwrap),
  cancel: (referenceNumber) => apiClient.delete(`/bookings/${referenceNumber}`).then(unwrap),
}
