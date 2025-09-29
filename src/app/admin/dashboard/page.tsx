'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import FinancialSummaryCards from '@/components/admin/FinancialSummaryCards'
import AdminOverviewSection from '@/components/admin/AdminOverviewSection'
import TransactionManagement from '@/components/admin/TransactionManagement'
import InvestorsOverview from '@/components/admin/InvestorsOverview'
import AdminCharts from '@/components/admin/AdminCharts'
import PayoutsSection from '@/components/admin/PayoutsSection'
import ExpensesSection from '@/components/admin/ExpensesSection'
import TransactionModals from '@/components/admin/TransactionModals'
import { useAuthContext } from '@/contexts/AuthContext'

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function AdminDashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuthContext()
  const [showInrModal, setShowInrModal] = useState(false)
  const [showUaeModal, setShowUaeModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (user && user.role !== 'admin') {
        router.push('/dashboard')
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
          {/* Admin Header */}
          <AdminHeader 
            onShowPayoutModal={() => setShowPayoutModal(true)}
            onShowExpenseModal={() => setShowExpenseModal(true)}
            onShowCustomerModal={() => setShowCustomerModal(true)}
          />

          {/* Financial Summary Cards */}
          <FinancialSummaryCards />

          {/* Admin Overview Section */}
          <AdminOverviewSection />

          {/* Transaction Management */}
          <TransactionManagement 
            onShowInrModal={() => setShowInrModal(true)}
            onShowUaeModal={() => setShowUaeModal(true)}
          />

          {/* Investors Overview */}
          <InvestorsOverview />

          {/* Admin Charts */}
          <AdminCharts />

          {/* Payouts Section */}
          <PayoutsSection />

          {/* Expenses Section */}
          <ExpensesSection />

          {/* Transaction Modals */}
          <TransactionModals 
            showInrModal={showInrModal}
            showUaeModal={showUaeModal}
            showPayoutModal={showPayoutModal}
            showExpenseModal={showExpenseModal}
            showCustomerModal={showCustomerModal}
            onCloseInrModal={() => setShowInrModal(false)}
            onCloseUaeModal={() => setShowUaeModal(false)}
            onClosePayoutModal={() => setShowPayoutModal(false)}
            onCloseExpenseModal={() => setShowExpenseModal(false)}
            onCloseCustomerModal={() => setShowCustomerModal(false)}
          />
        </div>
      </main>
    </div>
  )
}
