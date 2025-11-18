'use client'

import { useState, useEffect } from 'react'
import { Users, Eye, Edit, Trash2, Plus } from 'lucide-react'
import CurrencyDisplay from '../common/CurrencyDisplay'
import { apiService } from '@/services/api'

export default function InvestorsTable() {
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await apiService.getInvestors()
        if (response.success && response.data) {
          setInvestors(response.data.map((inv: any) => ({
            id: inv.id,
            name: inv.name,
            email: inv.email,
            investedAmount: inv.invested_amount || 0,
            totalProfit: inv.total_profit || 0,
            profitUsdt: inv.balance_usdt || 0,
            joinDate: inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : 'N/A',
            status: inv.active ? 'Active' : 'Inactive'
          })))
        }
      } catch (error) {
        console.error('Failed to fetch investors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvestors()
  }, [])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this investor?')) {
      setInvestors(investors.filter(investor => investor.id !== id))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investors Management
            </h3>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Investor</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Invested
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profit
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {investor.name}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined: {investor.joinDate}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {investor.email}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      ${investor.investedAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        <CurrencyDisplay amount={investor.totalProfit} />
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        USDT: <CurrencyDisplay amount={investor.profitUsdt} />
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {investor.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(investor.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
