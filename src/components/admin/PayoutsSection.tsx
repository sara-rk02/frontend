'use client'

import { useState, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import CurrencyDisplay from '../common/CurrencyDisplay'
import { apiService } from '@/services/api'

interface Payout {
  id: number
  user_name: string
  role: string
  admin_name?: string
  date: string
  amt: number
  created_at: string
}

export default function PayoutsSection() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await apiService.getPayouts()
        if (response.success && response.data) {
          setPayouts(response.data.slice(0, 5)) // Show latest 5 payouts
        }
      } catch (error) {
        console.error('Failed to fetch payouts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayouts()
  }, [])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <DollarSign className="text-yellow-500 mr-2 w-5 h-5" />
          Recent Payouts
        </h3>
      </div>
      <div className="p-6">
        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payout Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payouts.map((payout) => {
                  const payoutType = payout.role === 'admin' ? 'Admin' : 'Investor'
                  const userName = payout.role === 'admin' ? (payout.admin_name || 'Admin') : payout.user_name
                  const badgeClass = payout.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  
                  return (
                    <tr key={payout.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{payout.date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                          {payoutType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          <CurrencyDisplay amount={payout.amt} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{payout.created_at}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading payouts...</p>
          </div>
        )}
      </div>
    </div>
  )
}
