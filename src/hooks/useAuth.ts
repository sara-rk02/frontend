import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiService } from '@/services/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  invested_amount?: number
  total_profit?: number
  profit_usdt?: number
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        // Check if token is still valid (basic check - in production, you'd validate with backend)
        const tokenTimestamp = localStorage.getItem('token_timestamp')
        const now = Date.now()
        const tokenAge = tokenTimestamp ? now - parseInt(tokenTimestamp) : 0
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (tokenAge < maxAge) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          // Token expired, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('token_timestamp')
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_timestamp')
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } else {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }, [])

  const login = useCallback(async (email: string, password: string, role: string) => {
    const response = await apiService.login({ email, password, role })
    
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      localStorage.setItem('token_timestamp', Date.now().toString())
      
      setAuthState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
      })

      // Redirect based on role
      if (response.data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }

      return { success: true }
    } else {
      return { success: false, error: response.error }
    }
  }, [router])

  const logout = useCallback(async () => {
    await apiService.logout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('token_timestamp')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
    router.push('/')
  }, [router])

  const requireAuth = useCallback((requiredRole?: string) => {
    if (!authState.isAuthenticated) {
      router.push('/')
      return false
    }

    if (requiredRole && authState.user?.role !== requiredRole) {
      if (authState.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      return false
    }

    return true
  }, [authState, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    login,
    logout,
    requireAuth,
    checkAuth,
  }
}
