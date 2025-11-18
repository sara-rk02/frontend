'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Calendar, User, Building2, UserCheck, Clock } from 'lucide-react'
import { apiService } from '@/services/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'

interface Payout {
  id: number
  user_id: number
  user_name: string
  amount?: number  // API returns 'amount'
  amt?: number     // Database field is 'amt'
  role: string
  admin_name: string
  date: string
  note?: string
  created_at?: string
}

export default function UnifiedPayoutsTable() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPayouts()
  }, [])

  const loadPayouts = async () => {
    try {
      setLoading(true)
      // For now, we'll fetch from the existing payouts endpoint
      // In the future, this should be a unified endpoint that returns all payouts
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.arbitrageyield.com'}/api/payouts/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Payouts API Response:', data) // Debug log
        
        if (Array.isArray(data)) {
          setPayouts(data)
        } else if (data.success && data.data) {
          setPayouts(data.data)
        } else if (data.data && Array.isArray(data.data)) {
          setPayouts(data.data)
        } else {
          console.log('Unexpected data format:', data)
          setPayouts([])
        }
      } else {
        setError('Failed to load payouts')
      }
    } catch (err) {
      console.error('Failed to load payouts:', err)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCheck className="h-4 w-4 text-red-600" />
      case 'investor':
        return <User className="h-4 w-4 text-blue-600" />
      case 'broker':
        return <Building2 className="h-4 w-4 text-green-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      case 'investor':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'broker':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadPayouts}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Recent Payouts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            All payouts across Admin, Investor, and Broker accounts
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {payouts.length} payouts
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No payouts found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Account Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Admin</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Note</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Created</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => (
                <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      {getRoleIcon(payout.role)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payout.user_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {payout.user_id || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(payout.role || 'unknown')}`}>
                      {(payout.role || 'unknown').charAt(0).toUpperCase() + (payout.role || 'unknown').slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      <CurrencyDisplay amount={payout.amount || payout.amt || 0} />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(payout.date || new Date().toISOString())}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {payout.admin_name || 'Unknown Admin'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {payout.note || '-'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {payout.created_at ? formatDateTime(payout.created_at) : '-'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    {getRoleIcon(payout.role)}
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payout.user_name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {payout.user_id || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(payout.role)}`}>
                    {payout.role.charAt(0).toUpperCase() + payout.role.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      <CurrencyDisplay amount={payout.amount || payout.amt || 0} />
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(payout.date || new Date().toISOString())}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Admin</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payout.admin_name || 'Unknown Admin'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Created</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {payout.created_at ? formatDateTime(payout.created_at) : '-'}
                    </p>
                  </div>
                </div>
                
                {payout.note && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Note</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{payout.note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
