import { useCallback, useMemo, useState } from 'react'
import { apiClient, clearStoredToken, getStoredToken, storeToken, unwrap } from '../services/apiClient'
import { AuthContext } from './authContext'

const userKey = 'esplenin_staff_user'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken())
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey) || 'null')
    } catch {
      return null
    }
  })

  const login = useCallback(async (credentials) => {
    const data = await apiClient.post('/auth/login', credentials).then(unwrap)
    storeToken(data.token)
    localStorage.setItem(userKey, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    localStorage.removeItem(userKey)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [login, logout, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
