'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, isLoading } = useAuthContext()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // User is logged in, redirect to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        // User is not logged in, redirect to login
        router.push('/auth/login')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
