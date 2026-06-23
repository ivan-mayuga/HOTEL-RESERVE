import { apiClient, unwrap } from './client'

export const roomsApi = {
  list: (params) => apiClient.get('/rooms', { params }).then(unwrap),
  vacant: (checkIn, checkOut) => apiClient.get('/rooms/vacant', { params: { checkIn, checkOut } }).then(unwrap),
  get: (id) => apiClient.get(`/rooms/${id}`).then(unwrap),
  create: (payload) => apiClient.post('/rooms', payload).then(unwrap),
  update: (id, payload) => apiClient.put(`/rooms/${id}`, payload).then(unwrap),
  updateAvailability: (id, isAvailable) => apiClient.patch(`/rooms/${id}/availability`, { isAvailable }).then(unwrap),
  remove: (id) => apiClient.delete(`/rooms/${id}`).then(unwrap),
}
