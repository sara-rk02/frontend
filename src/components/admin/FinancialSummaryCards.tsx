'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Coins, TrendingUp, Wallet, Users, CreditCard, FileText } from 'lucide-react'
import { getDashboardUrl } from '@/config/api'

export default function FinancialSummaryCards() {
  const [financialData, setFinancialData] = useState({
    totalInvestedUsd: 50000.00,
    totalInvestedAed: 183500.00,
    totalProfit: 0.00,
    totalBalance: 0.00,
    totalInvestorsProfit: 15000.00,
    totalPayoutInvestor: 0.00,
    adminExpenseAmount: 0.00
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(getDashboardUrl('SUMMARY'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })
        const data = await response.json()
        
        if (response.ok && data.success && data.data) {
          setFinancialData({
            totalInvestedUsd: data.data.total_invested_usd || 0,
            totalInvestedAed: data.data.total_invested_aed || 0,
            totalProfit: data.data.total_profit_aed || 0,
            totalBalance: data.data.total_balance_aed || 0,
            totalInvestorsProfit: data.data.total_profit_aed || 0,
            totalPayoutInvestor: data.data.total_payouts_aed || 0,
            adminExpenseAmount: data.data.total_expenses_aed || 0
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

  const cards = [
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
      value: `₫${financialData.totalInvestedAed.toLocaleString()}`,
      subtitle: 'Total AED Investment',
      icon: Coins,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Total Profit',
      value: `₫${financialData.totalProfit.toFixed(2)}`,
      subtitle: 'Overall Profit',
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Total Balance',
      value: `₫${financialData.totalBalance.toFixed(2)}`,
      subtitle: 'Current Balance',
      icon: Wallet,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
      title: 'Investors Profit',
      value: `₫${financialData.totalInvestorsProfit.toFixed(2)}`,
      subtitle: 'Total Investors Profit',
      icon: Users,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20'
    },
    {
      title: 'Payout Investor',
      value: `₫${financialData.totalPayoutInvestor.toFixed(2)}`,
      subtitle: 'Total Payout Investor',
      icon: CreditCard,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      title: 'Admin Expense',
      value: `₫${financialData.adminExpenseAmount.toFixed(2)}`,
      subtitle: 'Admin Expense Amount',
      icon: FileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ]

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
