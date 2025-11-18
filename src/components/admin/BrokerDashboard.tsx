'use client'

import { useState, useEffect } from 'react'
import { Building2, Users, DollarSign, TrendingUp, Calendar, Plus, Eye } from 'lucide-react'
import { apiService, Broker, BrokerCommissionHistory } from '@/services/api'

interface BrokerDashboardProps {
  onAddBroker: () => void
}

export default function BrokerDashboard({ onAddBroker }: BrokerDashboardProps) {
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [brokerInvestors, setBrokerInvestors] = useState<any[]>([])
  const [commissionHistory, setCommissionHistory] = useState<BrokerCommissionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadBrokers()
  }, [])

  const loadBrokers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBrokers()
      if (response.success && response.data) {
        setBrokers(response.data)
      } else {
        setError(response.error || 'Failed to load brokers')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to load brokers:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadBrokerDetails = async (broker: Broker) => {
    try {
      setSelectedBroker(broker)
      
      // Load broker's investors
      const investorsResponse = await apiService.getBrokerInvestors(broker.id)
      if (investorsResponse.success && investorsResponse.data) {
        setBrokerInvestors(investorsResponse.data)
      }

      // Load commission history
      const historyResponse = await apiService.getBrokerCommissionHistory(broker.id)
      if (historyResponse.success && historyResponse.data) {
        setCommissionHistory(historyResponse.data)
      }
    } catch (err) {
      console.error('Failed to load broker details:', err)
    }
  }

  const totalCommission = brokers.reduce((sum, broker) => sum + broker.total_commission_aed, 0)
  const activeBrokers = brokers.filter(broker => broker.active).length
  const topBroker = brokers.reduce((top, broker) => 
    broker.total_commission_aed > top.total_commission_aed ? broker : top, 
    brokers[0] || { name: 'N/A', total_commission_aed: 0 }
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Building2 className="h-8 w-8 mr-3 text-blue-600" />
            Broker Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage brokers and view commission details
          </p>
        </div>
        <button
          onClick={onAddBroker}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Broker
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Broker Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Brokers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{brokers.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCommission.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Broker</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{topBroker.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {topBroker.total_commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Brokers List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Brokers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Broker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ROI Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {brokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {broker.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {broker.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {broker.min_roi}% - {broker.max_roi}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {broker.total_commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      broker.active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {broker.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => loadBrokerDetails(broker)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broker Details Modal */}
      {selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedBroker.name} - Broker Details
                </h3>
                <button
                  onClick={() => setSelectedBroker(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Broker Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Broker Information</h4>
                  <div className="space-y-2">
                    <p><span className="font-medium">Email:</span> {selectedBroker.email}</p>
                    <p><span className="font-medium">ROI Range:</span> {selectedBroker.min_roi}% - {selectedBroker.max_roi}%</p>
                    <p><span className="font-medium">Total Commission:</span> {selectedBroker.total_commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" /></p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedBroker.active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {selectedBroker.active ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Linked Investors */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Linked Investors</h4>
                  <div className="space-y-2">
                    {brokerInvestors.length > 0 ? (
                      brokerInvestors.map((investor) => (
                        <div key={investor.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="font-medium">{investor.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{investor.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Investment: {investor.invested_amount_aed?.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">No investors linked to this broker</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Commission History */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Commission History</h4>
                {commissionHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Investor</th>
                          <th className="px-4 py-2 text-left">Daily Rate</th>
                          <th className="px-4 py-2 text-left">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissionHistory.map((record) => (
                          <tr key={record.id} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2">Investor #{record.investor_id}</td>
                            <td className="px-4 py-2">{record.daily_rate}%</td>
                            <td className="px-4 py-2">{record.commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No commission history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
