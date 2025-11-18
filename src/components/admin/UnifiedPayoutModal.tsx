'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Calendar, User, Building2, CreditCard, UserCheck } from 'lucide-react'
import { apiService } from '@/services/api'
import { useAlert } from '@/components/common/Alert'

interface UnifiedPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function UnifiedPayoutModal({ isOpen, onClose, onSuccess }: UnifiedPayoutModalProps) {
  const { showAlert, AlertComponent } = useAlert()
  const [formData, setFormData] = useState({
    role: '',
    user_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Function to clear form
  const clearForm = () => {
    setFormData({
      role: '',
      user_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: ''
    })
    setError('')
    setUsers([])
  }

  // Load users based on selected role
  useEffect(() => {
    if (formData.role) {
      loadUsers(formData.role)
    } else {
      setUsers([])
    }
  }, [formData.role])

  const loadUsers = async (role: string) => {
    setLoadingUsers(true)
    try {
      let response
      if (role === 'investor') {
        response = await apiService.getInvestors()
      } else if (role === 'broker') {
        response = await apiService.getBrokers()
      } else if (role === 'admin') {
        // Fetch all users and filter for admins from the real database
        response = await apiService.getUsers()
        if (response && response.success && response.data) {
          // Filter to only show users with admin role
          const adminUsers = response.data.filter((user: User) => user.role === 'admin')
          setUsers(adminUsers)
        } else if (response && Array.isArray(response)) {
          // Handle direct array response
          const adminUsers = response.filter((user: User) => user.role === 'admin')
          setUsers(adminUsers)
        }
        setLoadingUsers(false)
        return
      }

      if (response && response.success && response.data) {
        setUsers(response.data)
      } else if (response && Array.isArray(response)) {
        // Handle direct array response
        setUsers(response)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (!formData.role || !formData.user_id || !formData.amount || !formData.date) {
        setError('Please fill in all required fields')
        return
      }

      const payoutData = {
        role: formData.role,
        user_id: parseInt(formData.user_id),
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note
      }

      const response = await apiService.createUnifiedPayout(payoutData)
      
      if (response.success) {
        const selectedUser = users.find(user => user.id === parseInt(formData.user_id))
        const userName = selectedUser ? selectedUser.name : 'Unknown'
        showAlert(`✅ Payout added successfully for ${formData.role}: ${userName}.`)
        clearForm()
        onSuccess()
        onClose()
      } else {
        setError(response.error || 'Failed to create payout')
      }
    } catch (err) {
      setError('Network error occurred')
      console.error('Failed to create payout:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <UserCheck className="h-4 w-4" />
      case 'investor':
        return <User className="h-4 w-4" />
      case 'broker':
        return <Building2 className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600'
      case 'investor':
        return 'text-blue-600'
      case 'broker':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {AlertComponent}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
              Add Payout
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Role
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['admin', 'investor', 'broker'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role, user_id: '' }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`flex items-center justify-center ${getRoleColor(role)}`}>
                    {getRoleIcon(role)}
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 capitalize">
                    {role}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* User Selection */}
          {formData.role && (
            <div className="space-y-2">
              <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
              </label>
              <div className="relative">
                <select
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  disabled={loadingUsers}
                  required
                  className="block w-full pl-3 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select a {formData.role}...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payout Amount (<img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mr-1" />)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payout Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              value={formData.note}
              onChange={handleInputChange}
              className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a note about this payout..."
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.role || !formData.user_id}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Payout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
