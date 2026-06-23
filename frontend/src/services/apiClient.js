import axios from 'axios'

const tokenKey = 'esplenin_staff_token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function unwrap(response) {
  return response.data.data
}

export function getStoredToken() {
  return localStorage.getItem(tokenKey)
}

export function storeToken(token) {
  localStorage.setItem(tokenKey, token)
}

export function clearStoredToken() {
  localStorage.removeItem(tokenKey)
}
