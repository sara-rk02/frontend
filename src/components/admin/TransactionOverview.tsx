'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowRightLeft, Flag, Calendar, DollarSign, User, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { getApiUrl } from '@/config/api'
import CurrencyDisplay from '@/components/common/CurrencyDisplay'
import { apiService } from '@/services/api'

interface Transaction {
  id: number
  user_id: number
  investor_id: number
  investor_name: string
  transaction_type: string
  type: string
  currency: string
  amount: number
  rate: number
  total_amount: number
  profit?: number
  fees?: number
  balance_after?: number
  date: string
  created_at?: string
  timestamp?: string
}

interface TransactionOverviewProps {
  onShowInrModal?: () => void
  onShowUaeModal?: () => void
  onTransactionChange?: () => void // Callback to trigger dashboard refresh
}

export default function TransactionOverview({ onShowInrModal, onShowUaeModal, onTransactionChange }: TransactionOverviewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [perPage] = useState(50) // Increased to show more transactions
  const [successMessage, setSuccessMessage] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required')
        return
      }

      // Fetch both INR and UAE transactions in parallel
      const [inrResponse, uaeResponse] = await Promise.all([
        fetch(`${getApiUrl('/api/transactions/inr/')}?page=${currentPage}&per_page=${perPage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${getApiUrl('/api/transactions/uae/')}?page=${currentPage}&per_page=${perPage}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      ])

      if (!inrResponse.ok || !uaeResponse.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const [inrData, uaeData] = await Promise.all([
        inrResponse.json(),
        uaeResponse.json()
      ])
      
      if (inrData.success && uaeData.success) {
        // Combine both transaction types and add currency field
        const inrTransactions = (inrData.data || []).map((t: any) => ({
          ...t,
          currency: 'INR',
          transaction_type: 'arbitrage',
          investor_name: 'System',
          total_amount: t.profit_aed
        }))
        
        const uaeTransactions = (uaeData.data || []).map((t: any) => ({
          ...t,
          currency: 'AED',
          transaction_type: 'arbitrage',
          investor_name: 'System',
          total_amount: t.profit_aed
        }))
        
        const allTransactions = [...inrTransactions, ...uaeTransactions]
        console.log('Loaded transactions:', allTransactions.length, 'INR:', inrTransactions.length, 'UAE:', uaeTransactions.length)
        setTransactions(allTransactions)
        setTotalPages(Math.max(inrData.pagination?.total_pages || 1, uaeData.pagination?.total_pages || 1))
      } else {
        console.error('API Error:', inrData.error || uaeData.error)
        setError(inrData.error || uaeData.error || 'Failed to load transactions')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to load transactions:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleDeleteTransaction = async (transactionId: number, currency: string) => {
    const confirmMessage = `Are you sure you want to delete this ${currency} transaction?`
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      setDeletingId(transactionId)
      
      let response
      if (currency === 'INR') {
        response = await apiService.deleteInrTransaction(transactionId)
      } else {
        response = await apiService.deleteUaeTransaction(transactionId)
      }

      if (response.success) {
        setSuccessMessage('Transaction deleted successfully')
        // Reload transactions
        await loadTransactions()
        // Trigger dashboard refresh
        if (onTransactionChange) {
          onTransactionChange()
        }
      } else {
        setError(response.error || 'Failed to delete transaction')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      setError('Network error occurred while deleting transaction')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (type: string, currency: string) => {
    if (type === 'buy') {
      return <ArrowRightLeft className="h-4 w-4 text-green-600" />
    } else if (type === 'sell') {
      return <ArrowRightLeft className="h-4 w-4 text-red-600 rotate-180" />
    }
    return <Flag className="h-4 w-4 text-blue-600" />
  }

  const getTransactionTypeColor = (type: string) => {
    if (type === 'buy') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    } else if (type === 'sell') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
  }

  const getCurrencyColor = (currency: string) => {
    if (currency === 'INR') {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
    } else if (currency === 'AED') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
  }

  // Helper functions to separate transactions by currency
  const getInrTransactions = () => {
    return transactions.filter(t => t.currency === 'INR' || t.currency === 'USD')
  }

  const getUaeTransactions = () => {
    return transactions.filter(t => t.currency === 'AED')
  }

  // Helper function to render transaction table
  const renderTransactionTable = (transactions: Transaction[], title: string, currency: string) => {
    if (transactions.length === 0) {
      return (
        <div className="text-center py-8">
          <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No {currency} transactions found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Start by adding your first {currency} transaction</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Amount (USD)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Date</th>
              {currency === 'INR' ? (
                <>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">AED to USDT</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">INR to AED</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">USDT Selling INR</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">AED to USDT Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Total INR Sold</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">AED in Hand</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">USDT to INR Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">USDT to INR Cost Sold</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Profit INR</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Profit AED</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">ROI %</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">USDT Buy Rate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">USDT Sell Rate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">AED to USDT Total</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">AED to USD Cost</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Profit AED</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">ROI %</th>
                </>
              )}
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-gray-600 dark:text-gray-400">#{transaction.id}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {transaction.amount?.toLocaleString() || 'N/A'}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">USD</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {transaction.date ? formatDate(transaction.date) : 'N/A'}
                    </span>
                  </div>
                </td>
                {currency === 'INR' ? (
                  <>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.aed_to_usdt?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.inr_to_aed?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.usdt_selling_inr?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.aed_to_usdt_total?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.total_inr_sold?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.aed_in_hand?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.usdt_to_inr_cost?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.usdt_to_inr_cost_sold?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${transaction.profit_inr >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.profit_inr?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${transaction.profit_aed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.profit_aed?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.roi_percent >= 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {transaction.roi_percent?.toFixed(2) || 'N/A'}%
                      </span>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.usdt_buy_rate?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.usdt_sell_rate?.toFixed(4) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.aed_to_usdt_total?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {transaction.aed_to_usd_cost?.toFixed(2) || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${transaction.profit_aed >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.profit_aed?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.roi_percent >= 0 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {transaction.roi_percent?.toFixed(2) || 'N/A'}%
                      </span>
                    </td>
                  </>
                )}
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id, currency)}
                    disabled={deletingId === transaction.id}
                    className="inline-flex items-center px-2 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete transaction"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === transaction.id && (
                      <span className="ml-1 text-xs">Deleting...</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <ArrowRightLeft className="text-indigo-500 mr-2 w-5 h-5" />
            Transaction History
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={loadTransactions}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Refresh
            </button>
            <button
              onClick={onShowInrModal}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <ArrowRightLeft className="w-4 h-4 mr-1" />
              Add INR
            </button>
            <button
              onClick={onShowUaeModal}
              className="flex items-center px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              <Flag className="w-4 h-4 mr-1" />
              Add UAE
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={loadTransactions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* INR Transactions Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  INR Transactions
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getInrTransactions().length} transactions
                </span>
              </div>
              {renderTransactionTable(getInrTransactions(), "INR Transactions", "INR")}
            </div>

            {/* UAE Transactions Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                  UAE Transactions
                </h4>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getUaeTransactions().length} transactions
                </span>
              </div>
              {renderTransactionTable(getUaeTransactions(), "UAE Transactions", "AED")}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
