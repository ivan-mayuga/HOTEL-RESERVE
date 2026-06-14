import { apiClient, unwrap } from './client'

export const amenitiesApi = {
  list: (params) => apiClient.get('/amenities', { params }).then(unwrap),
  get: (code) => apiClient.get(`/amenities/${code}`).then(unwrap),
  create: (payload) => apiClient.post('/amenities', payload).then(unwrap),
  update: (code, payload) => apiClient.patch(`/amenities/${code}`, payload).then(unwrap),
  remove: (code) => apiClient.delete(`/amenities/${code}`).then(unwrap),
}
