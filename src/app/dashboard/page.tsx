'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import DashboardCards from '@/components/dashboard/DashboardCards'
import ChartsSection from '@/components/dashboard/ChartsSection'
import PayoutsTable from '@/components/dashboard/PayoutsTable'
import ProfitHistoryTable from '@/components/dashboard/ProfitHistoryTable'
import { useAuthContext } from '@/contexts/AuthContext'

interface User {
  id: number
  name: string
  email: string
  role: string
  invested_amount: number
  total_profit: number
  profit_usdt: number
}

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (user && ['admin', 'SUPER_ADMIN'].includes(user.role)) {
        router.push('/admin/dashboard')
      } else if (user && user.role === 'broker') {
        // Prevent brokers from accessing investor dashboard
        router.push('/broker/dashboard')
      }
    }
  }, [isAuthenticated, user, isLoading, router])

  const handleLogout = async () => {
    await logout()
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Investor Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, <strong>{user.name}</strong>! Here&apos;s your investment overview.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Cards */}
          <DashboardCards user={user} totalPayouts={500} />

          {/* Charts Section */}
          <ChartsSection user={user} />

          {/* Tables Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <PayoutsTable />
            <ProfitHistoryTable />
          </div>
        </div>
      </main>
    </div>
  )
}
