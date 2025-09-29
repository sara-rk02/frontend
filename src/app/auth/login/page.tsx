'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Shield, User, TrendingUp } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function AuthLoginPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const [formData, setFormData] = useState({
    email: 'admin.a@usdtportal.com',
    password: 'admin123',
    role: 'admin'
  })
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (newRole: string) => {
    setFormData({ ...formData, role: newRole })
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
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="text-white text-2xl" />
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
              <div className="grid grid-cols-2 gap-3">
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
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo Credentials:</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Admin:</strong> admin.a@usdtportal.com / admin123</p>
              <p><strong>Investor:</strong> john.doe@example.com / investor123</p>
              <p><strong>Other Investors:</strong> jane.smith@example.com, sarah.johnson@example.com, etc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
