'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Users, DollarSign, TrendingUp, Calendar, BarChart3, PieChart, Activity, Wallet, CreditCard, Star, Award, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Navigation from '@/components/layout/Navigation'
import { apiService, BrokerDashboardData } from '@/services/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'

interface BrokerUser {
  id: number
  name: string
  email: string
  role: string
}

export default function BrokerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'investors' | 'commissions' | 'analytics'>('overview')
  const [brokerUser, setBrokerUser] = useState<BrokerUser | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if broker is logged in
    const brokerToken = localStorage.getItem('broker_token')
    const brokerUserData = localStorage.getItem('broker_user')
    const regularToken = localStorage.getItem('token')
    const regularUser = localStorage.getItem('user')
    
    // If regular user is logged in, check their role
    if (regularToken && regularUser) {
      try {
        const user = JSON.parse(regularUser)
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
          return
        } else if (user.role === 'investor') {
          // Prevent investors from accessing broker dashboard
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    
    // Check broker authentication
    if (!brokerToken || !brokerUserData) {
      router.push('/auth/login')
      return
    }

    try {
      const broker = JSON.parse(brokerUserData)
      setBrokerUser(broker)
      loadDashboardData(broker.id)
    } catch (error) {
      console.error('Error parsing broker data:', error)
      router.push('/auth/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('broker_token')
    localStorage.removeItem('broker_user')
    router.push('/auth/login')
  }

  const loadDashboardData = async (brokerId: number) => {
    try {
      setLoading(true)
      const response = await apiService.getBrokerDashboard(brokerId)
      
      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        setError(response.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Network error occurred while loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your data...</p>
        </div>
      </div>
    )
  }

  if (error || !dashboardData || !brokerUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Dashboard Error</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const { broker, statistics, investors, daily_commissions, recent_commissions } = dashboardData

  // Calculate broker metrics
  const totalBalance = broker.total_commission_aed
  const availableBalance = totalBalance // For now, assuming no payouts yet
  const averageROI = ((broker.min_roi + broker.max_roi) / 2).toFixed(2)

  return (
    <div className="min-h-screen">
      <Navigation user={brokerUser} onLogout={handleLogout} />
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Broker Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                    <Building2 className="text-white w-5 h-5" />
                  </div>
                  Broker Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, <strong>{broker.name}</strong>! Here&apos;s your broker overview.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Commission */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CurrencyDisplay amount={totalBalance} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    <CurrencyDisplay amount={availableBalance} />
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Total Investors */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Investors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total_investors}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            {/* Average ROI */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average ROI</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageROI}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'investors', label: 'Investors', icon: Users },
                  { id: 'commissions', label: 'Commissions', icon: DollarSign },
                  { id: 'analytics', label: 'Analytics', icon: PieChart }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Commissions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Commissions</h3>
                  </div>
                  <div className="p-6">
                    {recent_commissions.length > 0 ? (
                      <div className="space-y-4">
                        {recent_commissions.slice(0, 5).map((commission, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Investor #{commission.investor_id}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(commission.date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                <CurrencyDisplay amount={commission.commission_aed} />
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {commission.daily_rate}% ROI
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No commissions yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Daily Commission Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Commission Summary</h3>
                  </div>
                  <div className="p-6">
                    {Object.keys(daily_commissions).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(daily_commissions).slice(0, 7).map(([date, total_commission], index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              <CurrencyDisplay amount={total_commission} />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No daily commissions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Investors Tab */}
            {activeTab === 'investors' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Investors</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Investment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI Range</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {investors.map((investor) => (
                        <tr key={investor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{investor.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{investor.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <CurrencyDisplay amount={investor.invested_amount_aed} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <CurrencyDisplay amount={investor.total_profit} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {broker.min_roi}% - {broker.max_roi}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commission History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Investor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Investment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recent_commissions.map((commission, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(commission.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Investor #{commission.investor_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <CurrencyDisplay amount={0} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {commission.daily_rate}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                            <CurrencyDisplay amount={commission.commission_aed} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commission Trend */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission Trend</h3>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Analytics coming soon</p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                  <div className="text-center py-8">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Analytics coming soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}