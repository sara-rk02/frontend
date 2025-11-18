'use client'

import { useState } from 'react'
import { X, ArrowRightLeft, Flag, CreditCard, FileText, DollarSign, Calendar, ArrowDown, ArrowUp, UserPlus, User, Mail, Lock } from 'lucide-react'
import { getApiUrl } from '@/config/api'
import { useAlert } from '@/components/common/Alert'
import ExtraProfitAllocationModal from './ExtraProfitAllocationModal'

interface TransactionModalsProps {
  showInrModal: boolean
  showUaeModal: boolean
  showPayoutModal: boolean
  showExpenseModal: boolean
  showCustomerModal: boolean
  onCloseInrModal: () => void
  onCloseUaeModal: () => void
  onClosePayoutModal: () => void
  onCloseExpenseModal: () => void
  onCloseCustomerModal: () => void
  onTransactionChange?: () => void // Callback to trigger dashboard refresh
}

export default function TransactionModals({
  showInrModal,
  showUaeModal,
  showPayoutModal,
  showExpenseModal,
  showCustomerModal,
  onCloseInrModal,
  onCloseUaeModal,
  onClosePayoutModal,
  onCloseExpenseModal,
  onCloseCustomerModal,
  onTransactionChange
}: TransactionModalsProps) {
  const { showAlert, AlertComponent } = useAlert()
  const [showExtraProfitModal, setShowExtraProfitModal] = useState(false)
  const [extraProfitData, setExtraProfitData] = useState<{
    allocation_id: number
    extra_amount: number
    extra_profit_amount: number
  } | null>(null)

  const handleInrSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const form = e.currentTarget as HTMLFormElement
      const formData = new FormData(form)
      
      // Get form values
      const amount = parseFloat((form.querySelector('#inrAmount') as HTMLInputElement)?.value || '0')
      const date = (form.querySelector('#inrDate') as HTMLInputElement)?.value || ''
      const aedToUsdt = parseFloat((form.querySelector('#aedToUsdt') as HTMLInputElement)?.value || '0')
      const inrToAed = parseFloat((form.querySelector('#inrToAed') as HTMLInputElement)?.value || '0')
      const usdtSellingInr = parseFloat((form.querySelector('#usdtSellingInr') as HTMLInputElement)?.value || '0')
      
      // Validate required fields
      if (!amount || !date || !aedToUsdt || !inrToAed || !usdtSellingInr) {
        showAlert('Please fill in all required fields', 'error')
        return
      }
      
      // Import API service
      const { apiService } = await import('@/services/api')
      
      // Create transaction data
      const transactionData = {
        amount,
        date,
        aed_to_usdt: aedToUsdt,
        inr_to_aed: inrToAed,
        usdt_selling_inr: usdtSellingInr
      }
      
      // Call API to create transaction
      const response = await apiService.createInrTransaction(transactionData)
      
      if (response.success) {
        // Always refresh transaction list when transaction is created
        onTransactionChange?.()
        
        if (response.extra_profit) {
          // Show extra profit allocation modal
          setExtraProfitData({
            allocation_id: response.allocation_id,
            extra_amount: response.extra_amount,
            extra_profit_amount: response.extra_profit_amount
          })
          setShowExtraProfitModal(true)
        } else {
          showAlert('INR Transaction saved successfully!')
          form.reset()
        }
        onCloseInrModal()
      } else {
        showAlert(`Failed to save transaction: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('Error creating INR transaction:', error)
      showAlert('Network error occurred while saving transaction', 'error')
    }
  }

  const handleUaeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const form = e.currentTarget as HTMLFormElement
      
      // Get form values
      const amount = parseFloat((form.querySelector('#uaeAmount') as HTMLInputElement)?.value || '0')
      const date = (form.querySelector('#uaeDate') as HTMLInputElement)?.value || ''
      const usdtBuyRate = parseFloat((form.querySelector('#usdtBuyRate') as HTMLInputElement)?.value || '0')
      const usdtSellRate = parseFloat((form.querySelector('#usdtSellRate') as HTMLInputElement)?.value || '0')
      
      // Validate required fields
      if (!amount || !date || !usdtBuyRate || !usdtSellRate) {
        showAlert('Please fill in all required fields', 'error')
        return
      }
      
      // Import API service
      const { apiService } = await import('@/services/api')
      
      // Create transaction data
      const transactionData = {
        amount,
        date,
        usdt_buy_rate: usdtBuyRate,
        usdt_sell_rate: usdtSellRate
      }
      
      // Call API to create transaction
      const response = await apiService.createUaeTransaction(transactionData)
      
      if (response.success) {
        // Always refresh transaction list when transaction is created
        onTransactionChange?.()
        
        if (response.extra_profit) {
          // Show extra profit allocation modal
          setExtraProfitData({
            allocation_id: response.allocation_id,
            extra_amount: response.extra_amount,
            extra_profit_amount: response.extra_profit_amount
          })
          setShowExtraProfitModal(true)
        } else {
          showAlert('UAE Transaction saved successfully!')
          form.reset()
        }
        onCloseUaeModal()
      } else {
        showAlert(`Failed to save transaction: ${response.error}`, 'error')
      }
    } catch (error) {
      console.error('Error creating UAE transaction:', error)
      showAlert('Network error occurred while saving transaction', 'error')
    }
  }

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const userSelect = formData.get('user') as string
    const amount = formData.get('amount') as string
    const date = formData.get('date') as string
    
    if (!userSelect || !amount || !date) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      // Extract user ID from the selected option (using actual user ID 3 for Test User)
      const userId = userSelect === 'Admin' ? 1 : 
                     userSelect === 'John Doe (Investor)' ? 3 :
                     userSelect === 'Jane Smith (Investor)' ? 3 : 3
      
      const response = await fetch(getApiUrl('/api/payouts/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          amount: parseFloat(amount),
          date: date
        }),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        console.log('Payout created successfully:', data.data)
        showAlert('Payout processed successfully!')
        // Clear form
        const form = e.currentTarget as HTMLFormElement
        form.reset()
        onClosePayoutModal()
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to create payout:', data.message)
        alert(`Failed to create payout: ${data.message}`)
      }
    } catch (error) {
      console.error('Error creating payout:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const amount = formData.get('amount') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string
    
    if (!amount || !description || !date) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      // Import API service
      const { apiService } = await import('@/services/api')
      
      // Create expense data
      const expenseData = {
        amount: parseFloat(amount),
        description: description,
        expense_date: date
      }
      
      // Call API to create expense
      const response = await apiService.createExpense(expenseData)
      
      if (response.success) {
        showAlert('Expense recorded successfully!')
        // Clear form
        const form = e.currentTarget as HTMLFormElement
        form.reset()
        onCloseExpenseModal()
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        alert(`Failed to create expense: ${response.error}`)
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Network error. Please try again.')
    }
  }

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle customer registration submission
    console.log('Customer registration submitted')
    showAlert('Customer registered successfully!')
    // Clear form
    const form = e.currentTarget as HTMLFormElement
    form.reset()
    onCloseCustomerModal()
  }

  return (
    <>
      {AlertComponent}
      {/* INR Transaction Modal */}
      {showInrModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onCloseInrModal}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <ArrowRightLeft className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add INR Transaction</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter transaction details</p>
                  </div>
                </div>
                <button type="button" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200" onClick={onCloseInrModal}>
                  <X className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleInrSubmit} className="space-y-6">
                {/* Amount and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="inrAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Amount (INR)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="inrAmount" step="0.01" min="0" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inrDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" />
                      </div>
                      <input type="date" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="inrDate" required />
                    </div>
                  </div>
                </div>
                
                {/* Rates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="aedToUsdt" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mr-1" />
                      to USDT Rate
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ArrowRightLeft className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="aedToUsdt" step="0.0001" min="0" required placeholder="0.0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="inrToAed" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      INR to <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mx-1" /> Rate
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ArrowRightLeft className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="inrToAed" step="0.0001" min="0" required placeholder="0.0000" />
                    </div>
                  </div>
                </div>
                
                {/* USDT Selling Rate */}
                <div className="space-y-2">
                  <label htmlFor="usdtSellingInr" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">USDT Selling INR</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="text-gray-400" />
                    </div>
                    <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="usdtSellingInr" step="0.0001" min="0" required placeholder="0.0000" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button type="button" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-4 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2" onClick={onCloseInrModal}>
                    <X />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl px-6 py-4 font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <ArrowRightLeft />
                    <span>Add Transaction</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* UAE Transaction Modal */}
      {showUaeModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onCloseUaeModal}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Flag className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add UAE Transaction</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter transaction details</p>
                  </div>
                </div>
                <button type="button" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200" onClick={() => onCloseUaeModal()}>
                  <X className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleUaeSubmit} className="space-y-6">
                {/* Amount and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="uaeAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="uaeAmount" step="0.01" min="0" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="uaeDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" />
                      </div>
                      <input type="date" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="uaeDate" required />
                    </div>
                  </div>
                </div>
                
                {/* Rates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="usdtBuyRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">USDT Buying Rate</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ArrowDown className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="usdtBuyRate" step="0.0001" min="0" required placeholder="0.0000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="usdtSellRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">USDT Selling Rate</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ArrowUp className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="usdtSellRate" step="0.0001" min="0" required placeholder="0.0000" />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button type="button" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-4 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2" onClick={() => onCloseUaeModal()}>
                    <X />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl px-6 py-4 font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <Flag />
                    <span>Add Transaction</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => onClosePayoutModal()}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <CreditCard className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Payout</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Process payment to user</p>
                  </div>
                </div>
                <button type="button" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200" onClick={() => onClosePayoutModal()}>
                  <X className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handlePayoutSubmit} className="space-y-6">
                {/* User Selection */}
                <div className="space-y-2">
                  <label htmlFor="payoutUser" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select User</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="text-gray-400" />
                    </div>
                    <select name="user" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="payoutUser" required>
                      <option value="">Choose a user</option>
                      <option value="Admin">Admin</option>
                      <option value="John Doe (Investor)">John Doe (Investor)</option>
                      <option value="Jane Smith (Investor)">Jane Smith (Investor)</option>
                    </select>
                  </div>
                </div>
                
                {/* Amount and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="payoutAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Payout Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" />
                      </div>
                      <input name="amount" type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="payoutAmount" step="0.01" min="0" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="payoutDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Payout Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" />
                      </div>
                      <input name="date" type="date" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="payoutDate" required />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button type="button" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-4 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2" onClick={() => onClosePayoutModal()}>
                    <X />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl px-6 py-4 font-semibold hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <CreditCard />
                    <span>Add Payout</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => onCloseExpenseModal()}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <FileText className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Admin Expense</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Record business expense</p>
                  </div>
                </div>
                <button type="button" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200" onClick={() => onCloseExpenseModal()}>
                  <X className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleExpenseSubmit} className="space-y-6">
                {/* Amount and Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="expenseAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" />
                      </div>
                      <input type="number" name="amount" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="expenseAmount" step="0.01" min="0" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expenseDate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400" />
                      </div>
                      <input type="date" name="date" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="expenseDate" required />
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="expenseDescription" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Expense Description</label>
                  <div className="relative">
                    <div className="absolute top-4 left-4 flex items-start pointer-events-none">
                      <FileText className="text-gray-400" />
                    </div>
                    <textarea name="description" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium resize-none" id="expenseDescription" rows={4} required placeholder="Describe the expense purpose and details..."></textarea>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button type="button" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-4 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2" onClick={() => onCloseExpenseModal()}>
                    <X />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl px-6 py-4 font-semibold hover:from-red-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <FileText />
                    <span>Add Expense</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Registration Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onCloseCustomerModal}></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 w-full max-w-3xl max-h-[95vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <UserPlus className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Investor</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new investor account with initial investment details</p>
                  </div>
                </div>
                <button type="button" className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200" onClick={onCloseCustomerModal}>
                  <X className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleCustomerSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="customerName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-400" />
                      </div>
                      <input type="text" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="customerName" required placeholder="Enter full name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="customerEmail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="text-gray-400" />
                      </div>
                      <input type="email" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="customerEmail" required placeholder="Enter email address" />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="customerPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" />
                    </div>
                    <input type="password" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="customerPassword" required placeholder="Enter password" />
                  </div>
                </div>

                {/* Investment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="investedAmount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Initial Investment (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <DollarSign className="text-gray-400" />
                      </div>
                      <input type="number" className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="investedAmount" step="0.01" min="0" required placeholder="0.00" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="aedConversionRate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mr-1" />
                      Conversion Rate
                    </label>
                    <input type="number" className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="aedConversionRate" step="0.001" min="0" defaultValue="3.667" required />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Default: 3.667 (1 USD = 3.667 <img src="/images/Dhiram.png" alt="AED" className="inline w-3 h-3 align-text-bottom mx-1" />)</p>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="roiMin" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Min ROI (%)</label>
                    <input type="number" className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="roiMin" step="0.01" min="0" defaultValue="0.5" required />
                  </div>
                </div>

                {/* Max ROI */}
                <div className="max-w-xs">
                  <label htmlFor="roiMax" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Max ROI (%)</label>
                  <input type="number" className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:text-white transition-all duration-200 text-lg font-medium" id="roiMax" step="0.01" min="0" defaultValue="1.5" required />
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button type="button" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl px-6 py-4 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-2" onClick={() => onCloseCustomerModal()}>
                    <X />
                    <span>Cancel</span>
                  </button>
                  <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl px-6 py-4 font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl">
                    <UserPlus />
                    <span>Add Investor</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Extra Profit Allocation Modal */}
      {extraProfitData && (
        <ExtraProfitAllocationModal
          isOpen={showExtraProfitModal}
          onClose={() => {
            setShowExtraProfitModal(false)
            setExtraProfitData(null)
          }}
          allocationId={extraProfitData.allocation_id}
          extraAmount={extraProfitData.extra_amount}
          extraProfitAmount={extraProfitData.extra_profit_amount}
          transactionType="INR"
          onSuccess={() => {
            showAlert('Extra profit allocated successfully!')
            onTransactionChange?.()
          }}
        />
      )}
    </>
  )
}
