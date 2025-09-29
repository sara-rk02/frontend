'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, DollarSign, ArrowLeft, UserPlus } from 'lucide-react'
import { getAuthUrl } from '@/config/api'

interface RegisterInvestorFormProps {
  onSuccess: () => void
}

export default function RegisterInvestorForm({ onSuccess }: RegisterInvestorFormProps) {
  const [formData, setFormData] = useState({
    name: 'New Investor',
    email: 'new.investor@example.com',
    password: 'investor123',
    invested_amount: '15000',
    aed_conversion_rate: '3.667',
    roi_min: '0.5',
    roi_max: '1.5'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Call the actual API endpoint
      const response = await fetch(getAuthUrl('REGISTER'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          invested_amount: parseFloat(formData.invested_amount),
          aed_conversion_rate: parseFloat(formData.aed_conversion_rate),
          roi_min: parseFloat(formData.roi_min),
          roi_max: parseFloat(formData.roi_max)
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onSuccess()
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.')
      console.error('Registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add New Investor
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a new investor account with initial investment details
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="invested_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Initial Investment (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="invested_amount"
                name="invested_amount"
                value={formData.invested_amount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="aed_conversion_rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AED Conversion Rate
            </label>
            <input
              type="number"
              id="aed_conversion_rate"
              name="aed_conversion_rate"
              value={formData.aed_conversion_rate}
              onChange={handleInputChange}
              step="0.001"
              min="0"
              required
              className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Default: 3.667 (1 USD = 3.667 AED)
            </p>
          </div>

          <div>
            <label htmlFor="roi_min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Min ROI (%)
            </label>
            <input
              type="number"
              id="roi_min"
              name="roi_min"
              value={formData.roi_min}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              required
              className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Max ROI */}
        <div className="max-w-xs">
          <label htmlFor="roi_max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Max ROI (%)
          </label>
          <input
            type="number"
            id="roi_max"
            name="roi_max"
            value={formData.roi_max}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding Investor...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Investor
              </div>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard')}
            className="flex-1 sm:flex-none bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <div className="flex items-center justify-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Admin Panel
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}
