'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calculator, TrendingUp, Users, DollarSign, RefreshCw, Calendar } from 'lucide-react'
import { getApiUrl } from '@/config/api'

interface ProfitData {
  transaction_profit: {
    total_transaction_profit: number
    inr_profit: number
    uae_profit: number
    inr_transaction_count: number
    uae_transaction_count: number
    total_transaction_count: number
  }
  investor_profit: {
    total_daily_profit: number
    total_investor_profit: number
    investor_count: number
    investor_profits: Array<{
      investor_id: number
      investor_name: string
      investment_amount: number
      daily_roi: number
      daily_profit: number
      total_profit: number
    }>
  }
  broker_commission: {
    total_broker_commission: number
    broker_count: number
    broker_commissions: Array<{
      broker_id: number
      broker_name: string
      daily_commission: number
      total_commission: number
      investor_count: number
    }>
  }
  net_profit: number
  admin_profit: {
    admin_total_profit: number
    admin_A_profit: number
    admin_B_profit: number
    admin_A_payouts: number
    admin_B_payouts: number
    admin_A_available: number
    admin_B_available: number
    total_admin_available: number
  }
  weekday_status?: {
    is_weekday: boolean
    current_date: string
    day_name: string
    next_weekday?: string
    message: string
  }
  calculation_date: string
  daily_roi_used: number | null
}

export default function ProfitCalculation() {
  const [profitData, setProfitData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dailyRoi, setDailyRoi] = useState<number>(1.0)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateProfits = useCallback(async (forceCalculation = false) => {
    try {
      setIsCalculating(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${getApiUrl('/api/profit/admin-dashboard/')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          daily_roi: dailyRoi,
          force_calculation: forceCalculation
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate profits')
      }

      const result = await response.json()
      if (result.success) {
        setProfitData(result.data)
      } else {
        setError(result.error || 'Failed to calculate profits')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to calculate profits:', err)
    } finally {
      setIsCalculating(false)
    }
  }, [dailyRoi])

  const getTransactionTotals = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Authentication required')
        return
      }

      const response = await fetch(`${getApiUrl('/api/profit/transaction-totals/')}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch transaction totals')
      }

      const result = await response.json()
      if (result.success) {
        // Update only transaction profit data
        setProfitData(prev => prev ? {
          ...prev,
          transaction_profit: result.data
        } : null)
      } else {
        setError(result.error || 'Failed to fetch transaction totals')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to fetch transaction totals:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getTransactionTotals()
  }, [getTransactionTotals])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <Calculator className="text-blue-500 mr-2 w-5 h-5" />
            Profit Calculations
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="daily-roi" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Daily ROI:
              </label>
              <input
                id="daily-roi"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={dailyRoi}
                onChange={(e) => setDailyRoi(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <button
              onClick={() => calculateProfits()}
              disabled={isCalculating}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCalculating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calculator className="w-4 h-4 mr-2" />
              )}
              Calculate Profits
            </button>
            <button
              onClick={() => calculateProfits(true)}
              disabled={isCalculating}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Calculate
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Weekday Status Alert */}
      {profitData?.weekday_status && !profitData.weekday_status.is_weekday && (
        <div className="mx-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">Weekend - No Profit Calculations</p>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">{profitData.weekday_status.message}</p>
            </div>
          </div>
        </div>
      )}

      {profitData && (
        <div className="px-6 space-y-6">
          {/* Transaction Profit Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Transaction Profit Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">Total Transaction Profit</div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(profitData.transaction_profit.total_transaction_profit)}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">INR Profit</div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(profitData.transaction_profit.inr_profit)}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-300">
                  {profitData.transaction_profit.inr_transaction_count} transactions
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200">UAE Profit</div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(profitData.transaction_profit.uae_profit)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300">
                  {profitData.transaction_profit.uae_transaction_count} transactions
                </div>
              </div>
            </div>
          </div>

          {/* Investor Profit Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Investor Profit Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Daily Profit</div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(profitData.investor_profit.total_daily_profit)}
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Total Investor Profit</div>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {formatCurrency(profitData.investor_profit.total_investor_profit)}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-300">
                  {profitData.investor_profit.investor_count} investors
                </div>
              </div>
            </div>
            
            {/* Individual Investor Profits */}
            {profitData.investor_profit.investor_profits.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Individual Investor Profits</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Investor</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Investment</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Daily ROI</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Daily Profit</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Total Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {profitData.investor_profit.investor_profits.map((investor) => (
                        <tr key={investor.investor_id}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{investor.investor_name}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{formatCurrency(investor.investment_amount)}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{formatNumber(investor.daily_roi)}%</td>
                          <td className="px-3 py-2 text-green-600 dark:text-green-400 font-medium">{formatCurrency(investor.daily_profit)}</td>
                          <td className="px-3 py-2 text-green-600 dark:text-green-400 font-medium">{formatCurrency(investor.total_profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Broker Commission Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-500" />
              Broker Commission Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Daily Commission</div>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {formatCurrency(profitData.broker_commission.total_broker_commission)}
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Total Broker Commission</div>
                <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {formatCurrency(profitData.broker_commission.broker_commissions.reduce((sum, broker) => sum + broker.total_commission, 0))}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-300">
                  {profitData.broker_commission.broker_count} brokers
                </div>
              </div>
            </div>
            
            {/* Individual Broker Commissions */}
            {profitData.broker_commission.broker_commissions.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Individual Broker Commissions</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Broker</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Daily Commission</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Total Commission</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-900 dark:text-white">Investors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {profitData.broker_commission.broker_commissions.map((broker) => (
                        <tr key={broker.broker_id}>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{broker.broker_name}</td>
                          <td className="px-3 py-2 text-yellow-600 dark:text-yellow-400 font-medium">{formatCurrency(broker.daily_commission)}</td>
                          <td className="px-3 py-2 text-yellow-600 dark:text-yellow-400 font-medium">{formatCurrency(broker.total_commission)}</td>
                          <td className="px-3 py-2 text-gray-900 dark:text-white">{broker.investor_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Admin Profit Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-purple-500" />
              Admin Profit Split (50/50)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200">Admin A Profit</div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(profitData.admin_profit.admin_A_profit)}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                  Available: {formatCurrency(profitData.admin_profit.admin_A_available)}
                </div>
                <div className="text-xs text-purple-500 dark:text-purple-400">
                  Payouts: {formatCurrency(profitData.admin_profit.admin_A_payouts)}
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Admin B Profit</div>
                <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {formatCurrency(profitData.admin_profit.admin_B_profit)}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-300 mt-1">
                  Available: {formatCurrency(profitData.admin_profit.admin_B_available)}
                </div>
                <div className="text-xs text-indigo-500 dark:text-indigo-400">
                  Payouts: {formatCurrency(profitData.admin_profit.admin_B_payouts)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total Admin Profit</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(profitData.admin_profit.admin_total_profit)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total Available: {formatCurrency(profitData.admin_profit.total_admin_available)}
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-purple-500" />
              Net Profit Summary
            </h4>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">Net Profit (Before Admin Split)</div>
                <div className={`text-4xl font-bold ${profitData.net_profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(profitData.net_profit)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Transaction Profit - Investor Profit - Broker Commission
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Calculated on: {new Date(profitData.calculation_date).toLocaleString()}
                  {profitData.daily_roi_used && ` | Daily ROI: ${profitData.daily_roi_used}%`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">Loading profit data...</span>
        </div>
      )}
    </div>
  )
}
