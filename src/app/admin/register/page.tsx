'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import RegisterInvestorForm from '@/components/admin/RegisterInvestorForm'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function AdminRegisterPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== 'admin') {
          router.push('/dashboard')
          return
        }
        setUser(parsedUser)
      } else {
        router.push('/')
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleRegisterSuccess = () => {
    router.push('/admin/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navigation user={user} onLogout={handleLogout} />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add New Investor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Register a new investor to the platform.
            </p>
          </div>

          {/* Register Form */}
          <div className="max-w-2xl">
            <RegisterInvestorForm onSuccess={handleRegisterSuccess} />
          </div>
        </div>
      </main>
    </div>
  )
}
