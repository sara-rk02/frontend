'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Mail, Lock, Shield, User, TrendingUp, Building2 } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function AuthLoginPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (newRole: string) => {
    // Auto-fill credentials based on role selection
    const credentials = {
      admin: { email: 'admin@example.com', password: 'admin123' },
      investor: { email: 'john.smith@example.com', password: 'investor123' },
      broker: { email: 'alpha@brokerage.com', password: 'broker123' }
    }
    
    setFormData({ 
      ...formData, 
      role: newRole,
      email: credentials[newRole as keyof typeof credentials].email,
      password: credentials[newRole as keyof typeof credentials].password
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const result = await login(formData.email, formData.password, formData.role)
      if (!result.success) {
        // Show specific error messages
        if (result.error?.includes('Invalid email or password')) {
          setError('Invalid email or password. Please check your credentials.')
        } else if (result.error?.includes('Invalid role')) {
          setError('Invalid role selection. Please select the correct role.')
        } else if (result.error?.includes('deactivated')) {
          setError('Account is deactivated. Please contact administrator.')
        } else {
          setError(result.error || 'Login failed. Please try again.')
        }
      }
    } catch (error) {
      setError('Network error. Please check if the backend server is running.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative h-36 w-36 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logo.png"
                alt="Arbitrage Yield Logo"
                width={144}
                height={144}
                className="object-contain hover:scale-110 transition-transform duration-200"
                priority
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to your investment dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 rounded-xl p-4 mb-6 flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">Login As</label>
              <div className="grid grid-cols-3 gap-3">
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="sr-only peer"
                  />
                  <div className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'admin'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <Shield className={`text-red-500 mr-2 w-4 h-4`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="investor"
                    checked={formData.role === 'investor'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="sr-only peer"
                  />
                  <div className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'investor'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <User className={`text-green-500 mr-2 w-4 h-4`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Investor</span>
                  </div>
                </label>
                <label className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="broker"
                    checked={formData.role === 'broker'}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="sr-only peer"
                  />
                  <div className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'broker'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <Building2 className={`text-blue-500 mr-2 w-4 h-4`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Broker</span>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            {/* Login Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Lock className="w-5 h-5 mr-2" />
              Sign In
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg border border-blue-200 dark:border-gray-600">
            <div className="flex items-center mb-3">
              <Shield className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Demo Credentials</h3>
            </div>
            <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Admin:</span>
                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                >
                  admin@example.com / admin123
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Investor:</span>
                <button
                  type="button"
                  onClick={() => handleRoleChange('investor')}
                  className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
                >
                  john.smith@example.com / investor123
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Broker:</span>
                <button
                  type="button"
                  onClick={() => handleRoleChange('broker')}
                  className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
                >
                  alpha@brokerage.com / broker123
                </button>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                💡 <strong>Tip:</strong> Click any credential button above to auto-fill the form
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Other Investors:</strong> sarah.johnson@example.com, michael.brown@example.com (all use password: investor123)
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                <strong>Other Brokers:</strong> beta@financial.com, gamma@investments.com (all use password: broker123)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
