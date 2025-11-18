'use client'

import { useState, useEffect, useMemo } from 'react'
import { DollarSign, Coins, TrendingUp, Wallet, Users, CreditCard, FileText } from 'lucide-react'
import { apiService } from '@/services/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'

export default function FinancialSummaryCards() {
  const [financialData, setFinancialData] = useState({
    totalInvestedUsd: 0,
    totalInvestedAed: 0,
    totalProfit: 0,
    totalBalance: 0,
    totalInvestorsProfit: 0,
    totalPayoutInvestor: 0,
    adminExpenseAmount: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const response = await apiService.getDashboardSummary()
        
        if (response.success && response.data) {
          setFinancialData({
            totalInvestedUsd: response.data.total_invested_usd || 0,
            totalInvestedAed: response.data.total_invested_aed || 0,
            totalProfit: response.data.total_profit_aed || 0,
            totalBalance: response.data.total_balance_aed || 0,
            totalInvestorsProfit: response.data.total_profit_aed || 0,
            totalPayoutInvestor: response.data.total_payouts_aed || 0,
            adminExpenseAmount: response.data.total_expenses_aed || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch financial data:', error)
        // Keep default mock data on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [])

  const cards = useMemo(() => [
    {
      title: 'Initial Investment (USD)',
      value: `$${financialData.totalInvestedUsd.toLocaleString()}`,
      subtitle: 'Total USD Investment',
      icon: DollarSign,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    },
    {
      title: 'Initial Balance (AED)',
      value: <CurrencyDisplay amount={financialData.totalInvestedAed} />,
      subtitle: 'Total AED Investment',
      icon: Coins,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Profit',
      value: <CurrencyDisplay amount={financialData.totalProfit} />,
      subtitle: 'Overall Profit',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Balance',
      value: <CurrencyDisplay amount={financialData.totalBalance} />,
      subtitle: 'Current Balance',
      icon: Wallet,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
      title: 'Investors Profit',
      value: <CurrencyDisplay amount={financialData.totalInvestorsProfit} />,
      subtitle: 'Total Investors Profit',
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20'
    },
    {
      title: 'Payout Investor',
      value: <CurrencyDisplay amount={financialData.totalPayoutInvestor} />,
      subtitle: 'Total Payout Investor',
      icon: CreditCard,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'Admin Expense',
      value: <CurrencyDisplay amount={financialData.adminExpenseAmount} />,
      subtitle: 'Admin Expense Amount',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ], [financialData])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(7)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.title}
              </h3>
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <IconComponent className={`${card.color} text-xl`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {card.value}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {card.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}
