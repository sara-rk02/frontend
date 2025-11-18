'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, PieChart, Activity, DollarSign, Users, Calendar } from 'lucide-react'
import { apiService, BrokerDashboardData } from '@/services/api'

interface BrokerAnalyticsProps {
  brokerId: number
}

export default function BrokerAnalytics({ brokerId }: BrokerAnalyticsProps) {
  const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [brokerId, timeRange])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBrokerDashboard(brokerId)
      
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load analytics data')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to load analytics data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error || 'Failed to load analytics'}</p>
      </div>
    )
  }

  const { broker, statistics, investors, daily_commissions, recent_commissions } = dashboardData

  // Calculate analytics metrics
  const totalCommission = statistics.total_commission_aed
  const avgCommissionPerDay = Object.values(daily_commissions).reduce((sum, amount) => sum + amount, 0) / Object.keys(daily_commissions).length || 0
  const avgCommissionPerInvestor = totalCommission / statistics.total_investors || 0
  const commissionGrowthRate = calculateGrowthRate(Object.values(daily_commissions))

  // Prepare chart data
  const commissionChartData = Object.entries(daily_commissions)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-parseInt(timeRange.replace('d', '')))

  const investorPerformanceData = investors.map(investor => ({
    name: investor.name,
    investment: investor.invested_amount_aed || 0,
    profit: investor.total_profit || 0,
    commission: calculateInvestorCommission(investor.invested_amount_aed || 0, broker.min_roi, broker.max_roi)
  }))

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Analytics</h3>
        <div className="flex space-x-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as any)}
              className={`px-3 py-1 text-sm rounded-lg ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCommission.toLocaleString()} AED
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Daily Commission</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgCommissionPerDay.toLocaleString()} AED
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Per Investor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgCommissionPerInvestor.toLocaleString()} AED
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className={`text-2xl font-bold ${commissionGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {commissionGrowthRate >= 0 ? '+' : ''}{commissionGrowthRate.toFixed(1)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Commission Trend ({timeRange})
          </h4>
          <div className="h-64 flex items-end justify-between space-x-1">
            {commissionChartData.map(([date, amount], index) => {
              const maxAmount = Math.max(...commissionChartData.map(([, amt]) => amt))
              const height = (amount / maxAmount) * 200
              return (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t w-full transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}px` }}
                    title={`${new Date(date).toLocaleDateString()}: ${amount.toLocaleString()} AED`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-left">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Investor Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-green-600" />
            Top Performing Investors
          </h4>
          <div className="space-y-3">
            {investorPerformanceData
              .sort((a, b) => b.commission - a.commission)
              .slice(0, 5)
              .map((investor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{investor.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {investor.investment.toLocaleString()} AED invested
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      {investor.commission.toLocaleString()} AED
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">commission</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commission Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Distribution</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">This Month:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Object.values(daily_commissions).reduce((sum, amount) => sum + amount, 0).toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Last Month:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {(totalCommission * 0.8).toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Daily:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {avgCommissionPerDay.toLocaleString()} AED
              </span>
            </div>
          </div>
        </div>

        {/* ROI Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">ROI Performance</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Min ROI:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{broker.min_roi}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Max ROI:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{broker.max_roi}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average ROI:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {((broker.min_roi + broker.max_roi) / 2).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Summary</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Investors:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{statistics.total_investors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Investment:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {statistics.total_invested_aed.toLocaleString()} AED
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Commission Rate:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {((totalCommission / statistics.total_invested_aed) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function calculateGrowthRate(values: number[]): number {
  if (values.length < 2) return 0
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  return ((secondAvg - firstAvg) / firstAvg) * 100
}

function calculateInvestorCommission(investment: number, minRoi: number, maxRoi: number): number {
  const avgRoi = (minRoi + maxRoi) / 2
  return investment * (avgRoi / 100)
}
