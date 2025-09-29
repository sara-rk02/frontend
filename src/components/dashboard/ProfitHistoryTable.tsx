'use client'

import { History } from 'lucide-react'

interface ProfitRecord {
  id: number
  date: string
  daily_profit_usdt: number
  balance_usdt_snapshot: number
}

interface ProfitHistoryTableProps {
  profitHistory?: ProfitRecord[]
}

export default function ProfitHistoryTable({ profitHistory }: ProfitHistoryTableProps) {
  // Mock data - replace with actual API data
  const defaultProfitHistory: ProfitRecord[] = [
    {
      id: 1,
      date: '2024-01-15',
      daily_profit_usdt: 45.50,
      balance_usdt_snapshot: 1545.50
    },
    {
      id: 2,
      date: '2024-01-14',
      daily_profit_usdt: 42.30,
      balance_usdt_snapshot: 1500.00
    },
    {
      id: 3,
      date: '2024-01-13',
      daily_profit_usdt: 38.75,
      balance_usdt_snapshot: 1457.70
    },
    {
      id: 4,
      date: '2024-01-12',
      daily_profit_usdt: 41.20,
      balance_usdt_snapshot: 1418.95
    },
    {
      id: 5,
      date: '2024-01-11',
      daily_profit_usdt: 39.80,
      balance_usdt_snapshot: 1377.75
    }
  ]

  const displayProfitHistory = profitHistory || defaultProfitHistory

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <History className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Profit History
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        {displayProfitHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    USDT Profit
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    USDT Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayProfitHistory.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {record.date}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ₫{record.daily_profit_usdt.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-blue-600 dark:text-blue-400">
                        ₫{record.balance_usdt_snapshot.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
              No profit history yet
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Your daily profits will be calculated and displayed here starting from tomorrow.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
