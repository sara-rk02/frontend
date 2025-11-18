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
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      return
    }

    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const brokerToken = localStorage.getItem('broker_token')
    const brokerUserData = localStorage.getItem('broker_user')

    // Check regular user token first
    if (token && userData) {
      try {
        const user = JSON.parse(userData)
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
          return
        } else {
          // Token expired, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('token_timestamp')
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_timestamp')
      }
    }

    // Check broker token if no regular user token
    if (brokerToken && brokerUserData) {
      try {
        const user = JSON.parse(brokerUserData)
        const tokenTimestamp = localStorage.getItem('broker_timestamp')
        const now = Date.now()
        const tokenAge = tokenTimestamp ? now - parseInt(tokenTimestamp) : 0
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours

        if (tokenAge < maxAge) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
          return
        } else {
          // Token expired, clear storage
          localStorage.removeItem('broker_token')
          localStorage.removeItem('broker_user')
          localStorage.removeItem('broker_timestamp')
        }
      } catch (error) {
        console.error('Error parsing broker user data:', error)
        localStorage.removeItem('broker_token')
        localStorage.removeItem('broker_user')
        localStorage.removeItem('broker_timestamp')
      }
    }

    // No valid token found
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const login = useCallback(async (email: string, password: string, role: string) => {
    let response
    
    // Use broker login for broker role, regular login for others
    if (role === 'broker') {
      response = await apiService.brokerLogin({ email, password, role })
    } else {
      response = await apiService.login({ email, password, role })
    }
    
    if (response.success && response.data) {
      // Store tokens based on role (only in browser)
      if (typeof window !== 'undefined') {
        if (role === 'broker') {
          localStorage.setItem('broker_token', response.data.token)
          localStorage.setItem('broker_user', JSON.stringify(response.data.user))
          localStorage.setItem('broker_timestamp', Date.now().toString())
        } else {
          localStorage.setItem('token', response.data.token)
          localStorage.setItem('user', JSON.stringify(response.data.user))
          localStorage.setItem('token_timestamp', Date.now().toString())
        }
      }
      
      setAuthState({
        user: response.data.user,
        isLoading: false,
        isAuthenticated: true,
      })

      // Redirect based on role - ensure strict separation
      if (response.data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (response.data.user.role === 'broker') {
        router.push('/broker/dashboard')
      } else if (response.data.user.role === 'investor') {
        router.push('/dashboard')
      } else {
        // Unknown role, redirect to login
        router.push('/')
      }

      return { success: true }
    } else {
      return { success: false, error: response.error }
    }
  }, [router])

  const logout = useCallback(async () => {
    await apiService.logout()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('token_timestamp')
      localStorage.removeItem('broker_token')
      localStorage.removeItem('broker_user')
      localStorage.removeItem('broker_timestamp')
    }
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
      // Redirect to appropriate dashboard based on user's actual role
      if (authState.user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (authState.user?.role === 'broker') {
        router.push('/broker/dashboard')
      } else if (authState.user?.role === 'investor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
      return false
    }

    // Additional security: prevent brokers from accessing investor routes
    if (authState.user?.role === 'broker' && requiredRole === 'investor') {
      router.push('/broker/dashboard')
      return false
    }

    // Additional security: prevent investors from accessing broker routes
    if (authState.user?.role === 'investor' && requiredRole === 'broker') {
      router.push('/dashboard')
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
