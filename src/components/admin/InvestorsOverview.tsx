'use client'

import { useState, useEffect } from 'react'
import { Users, Edit, Plus, Ban, Check, Trash2 } from 'lucide-react'
import { getDashboardUrl, getApiUrl } from '@/config/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'

interface Investor {
  id: number
  name: string
  email: string
  invested_amount: number
  total_profit: number
  roi_min: number
  roi_max: number
  active: boolean
  created_at: string
  balance_usdt: number
  broker?: {
    id: number
    name: string
    email: string
    broker_min_roi: number
    broker_max_roi: number
  }
}

export default function InvestorsOverview() {
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [investors, setInvestors] = useState<Investor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchInvestors = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('No authentication token found, skipping API call')
          setIsLoading(false)
          return
        }
        
        const response = await fetch(getApiUrl('/api/investors/'), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })
        const data = await response.json()
        
        if (response.ok) {
          setInvestors(data || [])
        } else {
          console.error('Failed to load investors:', response.status)
          setInvestors([])
        }
      } catch (error) {
        console.error('Failed to fetch investors:', error)
        setInvestors([])
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

  const totalInvestedAed = investors.reduce((sum, investor) => sum + (investor.invested_amount * 3.667), 0)
  const totalProfit = investors.reduce((sum, investor) => sum + investor.total_profit, 0)
  const totalBalance = investors.reduce((sum, investor) => sum + getTotalBalance(investor.invested_amount * 3.667, investor.total_profit), 0)

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
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invested Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI Range</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Broker</th>
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          <CurrencyDisplay amount={investor.invested_amount * 3.667} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          <CurrencyDisplay amount={investor.total_profit} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          <CurrencyDisplay amount={getTotalBalance(investor.invested_amount * 3.667, investor.total_profit)} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          {investor.roi_min.toFixed(2)}% - {investor.roi_max.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {investor.broker ? (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">{investor.broker.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ROI: {investor.broker.broker_min_roi.toFixed(2)}% - {investor.broker.broker_max_roi.toFixed(2)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">No Broker</span>
                        )}
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

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredInvestors.map((investor) => (
                <div key={investor.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{investor.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{investor.email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      investor.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {investor.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Invested Amount</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${investor.invested_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <CurrencyDisplay amount={investor.balance_usdt} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Profit</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <CurrencyDisplay amount={investor.total_profit} />
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ROI Range</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {investor.roi_min}% - {investor.roi_max}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Broker</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {investor.broker ? (
                          <>
                            {investor.broker.name}
                            <br />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ROI: {investor.broker.broker_min_roi.toFixed(2)}% - {investor.broker.broker_max_roi.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">No Broker</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
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
                  </div>
                </div>
              ))}
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
                    <CurrencyDisplay amount={totalInvestedAed} />
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
                    <CurrencyDisplay amount={totalProfit} />
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
                    <CurrencyDisplay amount={totalBalance} />
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
