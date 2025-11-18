'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Building2, Users, TrendingUp, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { apiService, Broker, BrokerPayout } from '@/services/api'
import { useAlert } from '@/components/common/Alert'

interface BrokerPayoutSystemProps {
  onPayoutCreated?: () => void
}

export default function BrokerPayoutSystem({ onPayoutCreated }: BrokerPayoutSystemProps) {
  const { showAlert, AlertComponent } = useAlert()
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [payouts, setPayouts] = useState<BrokerPayout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [adminName, setAdminName] = useState('Admin')
  const [isCreatingPayout, setIsCreatingPayout] = useState(false)

  useEffect(() => {
    loadBrokers()
  }, [])

  useEffect(() => {
    if (selectedBroker) {
      loadBrokerPayouts(selectedBroker.id)
    }
  }, [selectedBroker])

  const loadBrokers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getBrokers()
      
      if (response.success && response.data) {
        setBrokers(response.data)
        if (response.data.length > 0) {
          setSelectedBroker(response.data[0])
        }
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

  const loadBrokerPayouts = async (brokerId: number) => {
    try {
      const response = await apiService.getBrokerPayouts(brokerId)
      
      if (response.success && response.data) {
        setPayouts(response.data)
      } else {
        console.error('Failed to load payouts:', response.error)
      }
    } catch (err) {
      console.error('Failed to load payouts:', err)
    }
  }

  const handleCreatePayout = async () => {
    if (!selectedBroker || !payoutAmount) return

    const amount = parseFloat(payoutAmount)
    if (amount <= 0) {
      setError('Payout amount must be positive')
      return
    }

    if (amount > selectedBroker.total_commission_aed) {
      setError('Payout amount exceeds available commission')
      return
    }

    try {
      setIsCreatingPayout(true)
      setError('')

      const response = await apiService.createBrokerPayout(
        selectedBroker.id,
        amount,
        adminName
      )

      if (response.success) {
        showAlert('Broker payout processed successfully!')
        setShowPayoutModal(false)
        setPayoutAmount('')
        setAdminName('Admin')
        
        // Refresh broker data and payouts
        await loadBrokers()
        await loadBrokerPayouts(selectedBroker.id)
        
        if (onPayoutCreated) {
          onPayoutCreated()
        }
      } else {
        setError(response.error || 'Failed to create payout')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to create payout:', err)
    } finally {
      setIsCreatingPayout(false)
    }
  }

  const totalPaidOut = payouts.reduce((sum, payout) => sum + payout.amount, 0)
  const remainingCommission = selectedBroker ? selectedBroker.total_commission_aed - totalPaidOut : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !brokers.length) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadBrokers}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {AlertComponent}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Payouts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage broker commission payouts</p>
        </div>
        <button
          onClick={() => setShowPayoutModal(true)}
          disabled={!selectedBroker || remainingCommission <= 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Create Payout
        </button>
      </div>

      {/* Broker Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Select Broker</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokers.map((broker) => (
            <div
              key={broker.id}
              onClick={() => setSelectedBroker(broker)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedBroker?.id === broker.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900 dark:text-white">{broker.name}</h5>
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{broker.email}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {broker.total_commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  broker.active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {broker.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedBroker && (
        <>
          {/* Commission Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedBroker.total_commission_aed.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Paid Out</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPaidOut.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {remainingCommission.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Payout History</h4>
            {payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Amount</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Admin</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payouts.map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {new Date(payout.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                          {payout.amount.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {payout.admin_name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center text-green-600 dark:text-green-400">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No payouts found for this broker</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Payout Modal */}
      {showPayoutModal && selectedBroker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Payout for {selectedBroker.name}
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Commission
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {remainingCommission.toLocaleString()} <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" />
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Amount (<img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mr-1" />)
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Enter admin name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPayoutModal(false)
                  setError('')
                  setPayoutAmount('')
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayout}
                disabled={isCreatingPayout || !payoutAmount}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                {isCreatingPayout ? 'Creating...' : 'Create Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
