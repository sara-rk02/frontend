'use client'

import { Users, DollarSign, TrendingUp, UserPlus } from 'lucide-react'
import CurrencyDisplay from '../common/CurrencyDisplay'

export default function AdminOverviewCards() {
  // Mock data - replace with actual API data
  const stats = {
    totalInvestors: 24,
    totalInvestments: 245000,
    totalProfits: 12500,
    newInvestorsThisMonth: 5
  }

  const cards = [
    {
      title: 'Total Investors',
      value: stats.totalInvestors.toString(),
      subtitle: 'Active accounts',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      gradient: 'gradient-primary'
    },
    {
      title: 'Total Investments',
      value: `$${stats.totalInvestments.toLocaleString()}`,
      subtitle: 'Capital under management',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      gradient: 'gradient-success'
    },
    {
      title: 'Total Profits',
      value: <CurrencyDisplay amount={stats.totalProfits} />,
      subtitle: 'Generated for investors',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      gradient: 'gradient-info'
    },
    {
      title: 'New This Month',
      value: stats.newInvestorsThisMonth.toString(),
      subtitle: 'New investor registrations',
      icon: UserPlus,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      gradient: 'gradient-warning'
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
