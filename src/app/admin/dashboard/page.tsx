'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/layout/Navigation'
import AdminHeader from '@/components/admin/AdminHeader'
import FinancialSummaryCards from '@/components/admin/FinancialSummaryCards'
import AdminOverviewSection from '@/components/admin/AdminOverviewSection'
import TransactionOverview from '@/components/admin/TransactionOverview'
import InvestorsOverview from '@/components/admin/InvestorsOverview'
import AdminCharts from '@/components/admin/AdminCharts'
import PayoutsSection from '@/components/admin/PayoutsSection'
import UnifiedPayoutsTable from '@/components/admin/UnifiedPayoutsTable'
import ExpensesSection from '@/components/admin/ExpensesSection'
import BrokerDashboard from '@/components/admin/BrokerDashboard'
import BrokerModal from '@/components/admin/BrokerModal'
import BrokerPayoutSystem from '@/components/admin/BrokerPayoutSystem'
import UnifiedPayoutModal from '@/components/admin/UnifiedPayoutModal'
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
  const [showBrokerModal, setShowBrokerModal] = useState(false)
  const [showUnifiedPayoutModal, setShowUnifiedPayoutModal] = useState(false)
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0)
  const router = useRouter()

  // Handler to refresh dashboard when transactions change
  const handleTransactionChange = () => {
    setDashboardRefreshKey(prev => prev + 1)
  }

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/')
      } else if (user && !['admin', 'SUPER_ADMIN'].includes(user.role)) {
        // Redirect non-admins to their appropriate dashboard
        if (user.role === 'broker') {
          router.push('/broker/dashboard')
        } else if (user.role === 'investor') {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
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
            onShowPayoutModal={() => setShowUnifiedPayoutModal(true)}
            onShowExpenseModal={() => setShowExpenseModal(true)}
          />

          {/* Financial Summary Cards */}
          <FinancialSummaryCards key={`financial-${dashboardRefreshKey}`} />

          {/* Admin Overview Section */}
          <AdminOverviewSection key={`admin-overview-${dashboardRefreshKey}`} />

          {/* Transaction Overview */}
          <TransactionOverview 
            key={dashboardRefreshKey}
            onShowInrModal={() => setShowInrModal(true)}
            onShowUaeModal={() => setShowUaeModal(true)}
            onTransactionChange={handleTransactionChange}
          />

          {/* Investors Overview */}
          <InvestorsOverview />

          {/* Admin Charts */}
          <AdminCharts />

          {/* Unified Payouts Table */}
          <UnifiedPayoutsTable />

          {/* Expenses Section */}
          <ExpensesSection />

          {/* Broker Dashboard */}
          <BrokerDashboard onAddBroker={() => setShowBrokerModal(true)} />

          {/* Transaction Modals */}
          <TransactionModals
            showInrModal={showInrModal}
            showUaeModal={showUaeModal}
            showPayoutModal={false} // Disabled old payout modal
            showExpenseModal={showExpenseModal}
            showCustomerModal={showCustomerModal}
            onCloseInrModal={() => setShowInrModal(false)}
            onCloseUaeModal={() => setShowUaeModal(false)}
            onClosePayoutModal={() => setShowPayoutModal(false)}
            onCloseExpenseModal={() => setShowExpenseModal(false)}
            onCloseCustomerModal={() => setShowCustomerModal(false)}
            onTransactionChange={handleTransactionChange}
          />

          {/* Unified Payout Modal */}
          <UnifiedPayoutModal
            isOpen={showUnifiedPayoutModal}
            onClose={() => setShowUnifiedPayoutModal(false)}
            onSuccess={() => {
              // Refresh data after successful payout
              setTimeout(() => {
                window.location.reload()
              }, 1000) // Small delay to ensure the alert is seen
            }}
          />

          {/* Broker Modal */}
          <BrokerModal 
            isOpen={showBrokerModal}
            onClose={() => setShowBrokerModal(false)}
            onSuccess={() => {
              // Refresh broker data by reloading the page or calling a refresh function
              setTimeout(() => {
                window.location.reload()
              }, 1000) // Small delay to ensure the alert is seen
            }}
          />
        </div>
      </main>
    </div>
  )
}
