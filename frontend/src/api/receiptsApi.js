import { apiClient, unwrap } from './client'

export const receiptsApi = {
  list: () => apiClient.get('/receipts').then(unwrap),
  get: (orNumber) => apiClient.get(`/receipts/${orNumber}`).then(unwrap),
  pdfUrl: (orNumber) => `${apiClient.defaults.baseURL}/receipts/${orNumber}/pdf`,
}
