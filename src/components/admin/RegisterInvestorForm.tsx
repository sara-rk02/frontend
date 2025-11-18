'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, DollarSign, ArrowLeft, UserPlus, Building2 } from 'lucide-react'
import { getAuthUrl } from '@/config/api'
import { apiService, Broker } from '@/services/api'
import { useAlert } from '@/components/common/Alert'

interface RegisterInvestorFormProps {
  onSuccess: () => void
}

export default function RegisterInvestorForm({ onSuccess }: RegisterInvestorFormProps) {
  const { showAlert, AlertComponent } = useAlert()
  const [formData, setFormData] = useState({
    name: 'New Investor',
    email: 'new.investor@example.com',
    password: 'investor123',
    invested_amount: '15000',
    aed_conversion_rate: '3.667',
    roi_min: '0.5',
    roi_max: '1.5',
    broker_id: '',
    broker_email: '',
    broker_name: '',
    broker_password: '',
    broker_min_roi: '0.5',
    broker_max_roi: '1.5',
    broker_option: 'none' // 'none', 'existing', 'new'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [loadingBrokers, setLoadingBrokers] = useState(true)
  const router = useRouter()

  // Function to clear form
  const clearForm = () => {
    setFormData({
      name: 'New Investor',
      email: 'new.investor@example.com',
      password: 'investor123',
      invested_amount: '15000',
      aed_conversion_rate: '3.667',
      roi_min: '0.5',
      roi_max: '1.5',
      broker_id: '',
      broker_email: '',
      broker_name: '',
      broker_password: '',
      broker_min_roi: '0.5',
      broker_max_roi: '1.5',
      broker_option: 'none'
    })
    setError('')
  }

  // Load brokers on component mount
  useEffect(() => {
    const loadBrokers = async () => {
      try {
        const response = await apiService.getBrokers()
        if (response.success && response.data) {
          setBrokers(response.data)
        }
      } catch (err) {
        console.error('Failed to load brokers:', err)
      } finally {
        setLoadingBrokers(false)
      }
    }
    loadBrokers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      let brokerId = undefined

      // Handle broker creation/selection
      if (formData.broker_option === 'existing' && formData.broker_id) {
        brokerId = parseInt(formData.broker_id)
      } else if (formData.broker_option === 'new' && formData.broker_email && formData.broker_name) {
        // Create new broker first
        const brokerResponse = await apiService.createBroker({
          name: formData.broker_name,
          email: formData.broker_email,
          password: formData.broker_password,
          min_roi: parseFloat(formData.broker_min_roi),
          max_roi: parseFloat(formData.broker_max_roi)
        })

        if (brokerResponse.success && brokerResponse.data) {
          brokerId = brokerResponse.data.id
        } else {
          setError(brokerResponse.error || 'Failed to create broker')
          return
        }
      }

      // Prepare broker relationship data if broker is selected
      let brokerRelationship = undefined
      if (brokerId && formData.broker_option === 'existing') {
        brokerRelationship = {
          broker_id: brokerId,
          broker_min_roi: parseFloat(formData.broker_min_roi),
          broker_max_roi: parseFloat(formData.broker_max_roi)
        }
      } else if (brokerId && formData.broker_option === 'new') {
        brokerRelationship = {
          broker_id: brokerId,
          broker_min_roi: parseFloat(formData.broker_min_roi),
          broker_max_roi: parseFloat(formData.broker_max_roi)
        }
      }

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
          roi_max: parseFloat(formData.roi_max),
          broker_relationship: brokerRelationship
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showAlert('Investor added successfully!')
        clearForm()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        // Reset broker fields when changing option
        broker_id: '',
        broker_email: '',
        broker_name: '',
        broker_min_roi: '0.5',
        broker_max_roi: '1.5'
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
      {AlertComponent}
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

        {/* Broker Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Broker Assignment (Optional)
          </label>
          
          {/* Broker Option Radio Buttons */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="broker_none"
                name="broker_option"
                value="none"
                checked={formData.broker_option === 'none'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="broker_none" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                No Broker (Direct Investor)
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="broker_existing"
                name="broker_option"
                value="existing"
                checked={formData.broker_option === 'existing'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="broker_existing" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Select Existing Broker
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="radio"
                id="broker_new"
                name="broker_option"
                value="new"
                checked={formData.broker_option === 'new'}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label htmlFor="broker_new" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Create New Broker
              </label>
            </div>
          </div>

          {/* Existing Broker Selection */}
          {formData.broker_option === 'existing' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Broker Selection & ROI Range</h4>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="broker_id"
                  name="broker_id"
                  value={formData.broker_id}
                  onChange={handleInputChange}
                  disabled={loadingBrokers}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select a broker...</option>
                  {brokers.map((broker) => (
                    <option key={broker.id} value={broker.id}>
                      {broker.name} ({broker.email}) - Default ROI: {broker.min_roi}%-{broker.max_roi}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Broker ROI Range for this specific investor */}
              {formData.broker_id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="broker_min_roi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Broker Min ROI for this Investor (%)
                    </label>
                    <input
                      type="number"
                      id="broker_min_roi"
                      name="broker_min_roi"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.broker_min_roi}
                      onChange={handleInputChange}
                      required={formData.broker_option === 'existing'}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.5"
                    />
                  </div>
                  <div>
                    <label htmlFor="broker_max_roi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Broker Max ROI for this Investor (%)
                    </label>
                    <input
                      type="number"
                      id="broker_max_roi"
                      name="broker_max_roi"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.broker_max_roi}
                      onChange={handleInputChange}
                      required={formData.broker_option === 'existing'}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* New Broker Creation */}
          {formData.broker_option === 'new' && (
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">New Broker Details</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="broker_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Broker Name
                  </label>
                  <input
                    type="text"
                    id="broker_name"
                    name="broker_name"
                    value={formData.broker_name}
                    onChange={handleInputChange}
                    required={formData.broker_option === 'new'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter broker name"
                  />
                </div>

                <div>
                  <label htmlFor="broker_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Broker Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="broker_email"
                      name="broker_email"
                      value={formData.broker_email}
                      onChange={handleInputChange}
                      required={formData.broker_option === 'new'}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter broker email"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="broker_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Broker Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="broker_password"
                    name="broker_password"
                    value={formData.broker_password}
                    onChange={handleInputChange}
                    required={formData.broker_option === 'new'}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password for broker login"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="broker_min_roi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min ROI (%)
                  </label>
                  <input
                    type="number"
                    id="broker_min_roi"
                    name="broker_min_roi"
                    value={formData.broker_min_roi}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required={formData.broker_option === 'new'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="broker_max_roi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max ROI (%)
                  </label>
                  <input
                    type="number"
                    id="broker_max_roi"
                    name="broker_max_roi"
                    value={formData.broker_max_roi}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required={formData.broker_option === 'new'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.broker_option === 'none' && 'Investor will not be linked to any broker'}
            {formData.broker_option === 'existing' && 'Select an existing broker and specify their ROI range for this investor'}
            {formData.broker_option === 'new' && 'A new broker will be created and linked to this investor'}
          </p>
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
              <img src="/images/Dhiram.png" alt="AED" className="inline w-4 h-4 align-text-bottom mr-1" />
              Conversion Rate
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
              Default: 3.667 (1 USD = 3.667 <img src="/images/Dhiram.png" alt="AED" className="inline w-3 h-3 align-text-bottom mx-1" />)
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
