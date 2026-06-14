import { apiClient, unwrap } from './client'

export const roomsApi = {
  list: (params) => apiClient.get('/rooms', { params }).then(unwrap),
  vacant: () => apiClient.get('/rooms/vacant').then(unwrap),
  get: (id) => apiClient.get(`/rooms/${id}`).then(unwrap),
  create: (payload) => apiClient.post('/rooms', payload).then(unwrap),
  updateAvailability: (id, isAvailable) => apiClient.patch(`/rooms/${id}/availability`, { isAvailable }).then(unwrap),
}
