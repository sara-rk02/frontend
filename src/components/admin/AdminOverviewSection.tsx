'use client'

import { PieChart, Building2, Users, DollarSign } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'

interface DashboardData {
  total_invested_usd: number
  total_invested_aed: number
  total_profit_aed: number
  total_balance_aed: number
  total_payouts_aed: number
  total_expenses_aed: number
  total_broker_commission_aed: number
  active_investors: number
  total_brokers: number
  active_brokers: number
  total_transactions: number
}

export default function AdminOverviewSection() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await apiService.getDashboardData()
      if (response.success && response.data) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  // Calculate admin profit (total profit - broker commission)
  const adminProfit = dashboardData.total_profit_aed - dashboardData.total_broker_commission_aed
  const adminAShare = adminProfit / 2
  const adminBShare = adminProfit / 2
  
  // Calculate commission percentage
  const commissionPercentage = dashboardData.total_profit_aed > 0 
    ? ((dashboardData.total_broker_commission_aed / dashboardData.total_profit_aed) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="space-y-6">
      {/* Admin Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <PieChart className="text-purple-500 mr-2 w-5 h-5" />
            Admin Overview
          </h3>
        </div>
        <div className="p-6">
          {/* 4x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Row 1 */}
            {/* Total Profit */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                <CurrencyDisplay amount={dashboardData.total_profit_aed} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Profit
              </p>
            </div>
            
            {/* Broker Commission */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                <CurrencyDisplay amount={dashboardData.total_broker_commission_aed} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Broker Commission
              </p>
            </div>
            
            {/* Admin Profit */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                <CurrencyDisplay amount={adminProfit} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin Profit
              </p>
            </div>
            
            {/* Total Transactions */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {dashboardData.total_transactions}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Transactions
              </p>
            </div>

            {/* Row 2 */}
            {/* Admin A Share */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                <CurrencyDisplay amount={adminAShare} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin A Share (50%)
              </p>
            </div>
            
            {/* Admin B Share */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                <CurrencyDisplay amount={adminBShare} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Admin B Share (50%)
              </p>
            </div>

            {/* Admin A Available Balance */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
              <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      <CurrencyDisplay amount={adminAShare - (dashboardData.total_payouts_aed / 2)} />
                    </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Admin A Available
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Share: <CurrencyDisplay amount={adminAShare} showSymbol={false} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Payouts: <CurrencyDisplay amount={dashboardData.total_payouts_aed / 2} showSymbol={false} />
                </p>
              </div>
            </div>

            {/* Admin B Available Balance */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
              <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      <CurrencyDisplay amount={adminBShare - (dashboardData.total_payouts_aed / 2)} />
                    </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Admin B Available
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Share: <CurrencyDisplay amount={adminBShare} showSymbol={false} />
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Payouts: <CurrencyDisplay amount={dashboardData.total_payouts_aed / 2} showSymbol={false} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broker Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <Building2 className="text-blue-500 mr-2 w-5 h-5" />
            Broker Overview
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Total Brokers */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {dashboardData.total_brokers}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Brokers
              </p>
            </div>
            
            {/* Active Brokers */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {dashboardData.active_brokers}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Brokers
              </p>
            </div>
            
            {/* Total Commission */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                <CurrencyDisplay amount={dashboardData.total_broker_commission_aed} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Commission
              </p>
            </div>
            
            {/* Commission Percentage */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {commissionPercentage}%
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Commission Share
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
