'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthContext()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      if (user.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      
      // Redirect to admin dashboard by default
      router.push('/admin/dashboard')
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
