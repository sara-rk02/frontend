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
      } else if (user && user.role === 'admin') {
        router.push('/admin/dashboard')
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
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme:</span>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dashboardDarkModeToggle"
                    className="sr-only"
                    onChange={(e) => {
                      const isDark = e.target.checked
                      if (isDark) {
                        document.documentElement.classList.add('dark')
                        localStorage.setItem('theme', 'dark')
                      } else {
                        document.documentElement.classList.remove('dark')
                        localStorage.setItem('theme', 'light')
                      }
                    }}
                  />
                  <label
                    htmlFor="dashboardDarkModeToggle"
                    className="flex items-center cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded-full shadow-inner"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out"></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      <i className="fas fa-moon"></i> Dark Mode
                    </span>
                  </label>
                </div>
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
