'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthContextType {
  user: any
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  requireAuth: (requiredRole?: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  try {
    const auth = useAuth()

    return (
      <AuthContext.Provider value={auth}>
        {children}
      </AuthContext.Provider>
    )
  } catch (error) {
    console.error('Error initializing AuthProvider:', error)
    // Return a default context value to prevent crashes
    const defaultAuth: AuthContextType = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => ({ success: false, error: 'Auth initialization failed' }),
      logout: async () => {},
      requireAuth: () => false,
    }
    return (
      <AuthContext.Provider value={defaultAuth}>
        {children}
      </AuthContext.Provider>
    )
  }
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
