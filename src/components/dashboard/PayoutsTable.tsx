'use client'

import { DollarSign } from 'lucide-react'
import CurrencyDisplay from '../common/CurrencyDisplay'

interface Payout {
  id: number
  date: string
  amt: number
  status: string
  mode: string
}

interface PayoutsTableProps {
  payouts?: Payout[]
}

export default function PayoutsTable({ payouts }: PayoutsTableProps) {
  // Mock data - replace with actual API data
  const defaultPayouts: Payout[] = [
    {
      id: 1,
      date: '2024-01-15',
      amt: 500.00,
      status: 'Completed',
      mode: 'Payout'
    },
    {
      id: 2,
      date: '2024-01-10',
      amt: 750.00,
      status: 'Completed',
      mode: 'Payout'
    },
    {
      id: 3,
      date: '2024-01-05',
      amt: 300.00,
      status: 'Completed',
      mode: 'Payout'
    }
  ]

  const displayPayouts = payouts || defaultPayouts

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Payouts
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        {displayPayouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayPayouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {payout.date}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-red-600 dark:text-red-400">
                        -<CurrencyDisplay amount={payout.amt} />
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {payout.mode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No payouts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
