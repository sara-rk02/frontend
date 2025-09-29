'use client'

import { Coins, TrendingUp, Wallet, DollarSign } from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
  invested_amount: number
  total_profit: number
  profit_usdt: number
}

interface DashboardCardsProps {
  user: User
  totalPayouts?: number
}

export default function DashboardCards({ user, totalPayouts = 500 }: DashboardCardsProps) {
  const totalBalance = user.invested_amount + user.total_profit
  const netUsdtProfit = user.profit_usdt - totalPayouts

  const cards = [
    {
      title: 'Invested Amount',
      value: `$${user.invested_amount.toFixed(2)}`,
      subtitle: 'Original Capital',
      icon: Coins,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'Total Profit',
      value: `₫${user.total_profit.toFixed(2)}`,
      subtitle: 'Lifetime Profit',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: 'Total Balance',
      value: `₫${totalBalance.toFixed(2)}`,
      subtitle: 'Invested + Profit',
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: 'USDT Profit',
      value: `₫${netUsdtProfit.toFixed(2)}`,
      subtitle: 'Total USDT Earnings (Net)',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-xl p-6 card-hover`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.subtitle}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
