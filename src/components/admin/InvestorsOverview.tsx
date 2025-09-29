'use client'

import { useState, useEffect } from 'react'
import { Users, Edit, Plus, Ban, Check, Trash2 } from 'lucide-react'
import { getDashboardUrl } from '@/config/api'

interface Investor {
  id: number
  name: string
  email: string
  invested_amount: number
  invested_amount_aed: number
  total_profit: number
  roi_min: number
  roi_max: number
  active: boolean
  created_at: string
  balance_usdt: number
}

export default function InvestorsOverview() {
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const response = await fetch(getDashboardUrl('INVESTORS'))
        const data = await response.json()
        
        if (response.ok && data.success) {
          setInvestors(data.data)
        } else {
          // Fallback to mock data
          setInvestors([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      invested_amount: 10000,
      invested_amount_aed: 36700,
      total_profit: 1500,
      roi_min: 0.5,
      roi_max: 2.0,
      active: true,
      created_at: '2024-01-15',
      balance_usdt: 1000.00
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      invested_amount: 5000,
      invested_amount_aed: 18350,
      total_profit: 750,
      roi_min: 0.3,
      roi_max: 1.5,
      active: true,
      created_at: '2024-01-10',
      balance_usdt: 500.00
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      invested_amount: 15000,
      invested_amount_aed: 55050,
      total_profit: 2250,
      roi_min: 0.8,
      roi_max: 2.5,
      active: false,
      created_at: '2024-01-05',
      balance_usdt: 1500.00
    }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch investors:', error)
        // Keep fallback mock data
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvestors()
  }, [])

  const getTotalBalance = (invested: number, profit: number) => {
    return invested + profit
  }

  const filteredInvestors = showActiveOnly 
    ? investors.filter(investor => investor.active)
    : investors

  const totalInvestedAed = investors.reduce((sum, investor) => sum + investor.invested_amount_aed, 0)
  const totalProfit = investors.reduce((sum, investor) => sum + investor.total_profit, 0)
  const totalBalance = investors.reduce((sum, investor) => sum + getTotalBalance(investor.invested_amount_aed, investor.total_profit), 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <Users className="text-blue-500 mr-2 w-5 h-5" />
            Investors Overview
          </h3>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button
              type="button"
              onClick={() => setShowActiveOnly(true)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                showActiveOnly
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Active Only
            </button>
            <button
              type="button"
              onClick={() => setShowActiveOnly(false)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                !showActiveOnly
                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Show All
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {filteredInvestors.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invested Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvestors.map((investor) => (
                    <tr key={investor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{investor.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{investor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">${investor.invested_amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">₫{investor.invested_amount_aed.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">₫{investor.total_profit.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">₫{getTotalBalance(investor.invested_amount_aed, investor.total_profit).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {investor.roi_min.toFixed(2)}% - {investor.roi_max.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {investor.active ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">{investor.created_at}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-300" title="Add Transaction">
                            <Plus className="w-4 h-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300" title={investor.active ? "Deactivate" : "Activate"}>
                            {investor.active ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Total Invested Amount Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400 text-xl" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    ₫{totalInvestedAed.toFixed(2)}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Invested Amount (AED)
                  </p>
                </div>
              </div>

              {/* Total Profit Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <Users className="text-green-600 dark:text-green-400 text-xl" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                    ₫{totalProfit.toFixed(2)}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Profit
                  </p>
                </div>
              </div>

              {/* Total Balance Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center">
                    <Users className="text-cyan-600 dark:text-cyan-400 text-xl" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                    ₫{totalBalance.toFixed(2)}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Balance
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-gray-400 text-2xl" />
            </div>
            <h5 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No investors found</h5>
            <p className="text-gray-500 dark:text-gray-400">Start by adding your first investor using the button above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
