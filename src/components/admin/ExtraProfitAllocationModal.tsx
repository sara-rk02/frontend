'use client'

import { useState, useEffect } from 'react'
import { apiService } from '@/services/api'

interface ExtraProfitAllocationModalProps {
  isOpen: boolean
  onClose: () => void
  allocationId: number
  extraAmount: number
  extraProfitAmount: number
  transactionType: 'INR' | 'UAE'
  onSuccess: () => void
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function ExtraProfitAllocationModal({
  isOpen,
  onClose,
  allocationId,
  extraAmount,
  extraProfitAmount,
  transactionType,
  onSuccess
}: ExtraProfitAllocationModalProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [allocatedAmount, setAllocatedAmount] = useState<number>(0)
  // Ensure profit is always positive for display and calculations
  const displayProfitAmount = Math.abs(extraProfitAmount)
  const [remainingAmount, setRemainingAmount] = useState<number>(displayProfitAmount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

  useEffect(() => {
    setRemainingAmount(displayProfitAmount - allocatedAmount)
  }, [allocatedAmount, displayProfitAmount])

  const fetchUsers = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.arbitrageyield.com'
      
      // Fetch both investors and brokers in parallel
      const [investorsResponse, brokersResponse] = await Promise.all([
        fetch(`${baseUrl}/api/investors/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${baseUrl}/api/brokers/`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      ])
      
      const allUsers: User[] = []
      
      // Add investors
      if (investorsResponse.ok) {
        const investorsData = await investorsResponse.json()
        if (Array.isArray(investorsData)) {
          investorsData.forEach((investor: any) => {
            allUsers.push({
              id: investor.id,
              name: investor.name || investor.email,
              email: investor.email,
              role: 'investor'
            })
          })
        }
      }
      
      // Add brokers
      if (brokersResponse.ok) {
        const brokersData = await brokersResponse.json()
        if (Array.isArray(brokersData)) {
          brokersData.forEach((broker: any) => {
            allUsers.push({
              id: broker.id,
              name: broker.name || broker.email,
              email: broker.email,
              role: 'broker'
            })
          })
        }
      }
      
      setUsers(allUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    }
  }

  const handleAllocate = async () => {
    if (!selectedUserId) {
      setError('Please select a user')
      return
    }

    if (allocatedAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (allocatedAmount > displayProfitAmount) {
      setError('Allocated amount cannot exceed extra profit')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Send the absolute value to backend to ensure positive profit allocation
      const response = await apiService.allocateExtraProfit(
        allocationId,
        selectedUserId,
        Math.abs(allocatedAmount)
      )

      if (response.success) {
        const userName = (response as any).user_name || 'the selected user'
        setSuccess(
          `Extra profit of ${allocatedAmount.toFixed(2)} AED allocated to ${userName}. ` +
          `Remaining ${remainingAmount.toFixed(2)} AED assigned to Admin.`
        )
        
        // Wait 2 seconds to show success message, then close and refresh
        setTimeout(() => {
          onSuccess()
          onClose()
          setSuccess(null)
        }, 2000)
      } else {
        setError(response.error || 'Failed to allocate profit')
      }
    } catch (err) {
      console.error('Error allocating profit:', err)
      setError('Failed to allocate profit')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4 animate-scale-in">
        {/* Header with Icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Extra Profit Allocation
                    </h2>
                    <p className="text-xs text-gray-500">Distribute the extra profit</p>
                  </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-full">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-green-900 font-semibold">{success}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Transaction Info Cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Transaction</p>
                <p className="text-base font-bold text-blue-600">{transactionType}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Extra Amount</p>
                <p className="text-base font-bold text-purple-600">{extraAmount.toFixed(2)} USDT</p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3 text-center">
                <div className="flex justify-center mb-2">
                  <div className="bg-emerald-500 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">Extra Profit</p>
                <p className="text-base font-bold text-emerald-600">{displayProfitAmount.toFixed(2)} AED</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-900">Allocation Required</p>
                  <p className="text-sm text-amber-700">
                    The transaction amount exceeded the initial investment limit. Allocate extra profit to an investor/broker. The remaining amount will be automatically assigned to Admin.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* User Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Select Investor or Broker
                </span>
              </label>
              <select
                value={selectedUserId || ''}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">-- Select Investor or Broker --</option>
                {users
                  .sort((a, b) => {
                    // Sort by role (investors first, then brokers), then by name
                    if (a.role !== b.role) {
                      return a.role === 'investor' ? -1 : 1
                    }
                    return a.name.localeCompare(b.name)
                  })
                  .map((user) => (
                    <option key={`${user.role}-${user.id}`} value={user.id}>
                      {user.name} {user.role === 'investor' ? '👤' : '🏢'} ({user.role === 'investor' ? 'Investor' : 'Broker'})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                {users.filter(u => u.role === 'investor').length} Investors, {users.filter(u => u.role === 'broker').length} Brokers available
              </p>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  Profit Share Amount (AED)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={allocatedAmount}
                  onChange={(e) => setAllocatedAmount(Number(e.target.value))}
                  max={displayProfitAmount}
                  min={0}
                  step={0.01}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={loading}
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-gray-500 text-sm">AED</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">Maximum: {displayProfitAmount.toFixed(2)} AED</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAllocatedAmount(displayProfitAmount * 0.5)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllocatedAmount(displayProfitAmount)}
                    className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Max
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Allocation Summary
              </h3>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Allocation Progress</span>
                  <span>{displayProfitAmount > 0 ? ((allocatedAmount / displayProfitAmount) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${displayProfitAmount > 0 ? (allocatedAmount / displayProfitAmount) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border-2 border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600">Allocated to User</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {allocatedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">AED</p>
                  {displayProfitAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {((allocatedAmount / displayProfitAmount) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-lg p-3 border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-600">Remaining for Admin</span>
                  </div>
                  <p className="text-xl font-bold text-blue-600">
                    {remainingAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">AED</p>
                  {displayProfitAmount > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {((remainingAmount / displayProfitAmount) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={loading || !selectedUserId || allocatedAmount <= 0}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Allocating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Allocate Profit
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
