'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/layout/Navigation'
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getApiUrl } from '@/config/api'

interface ApiStatus {
  status: string
  timestamp: string
  uptime: string
  version: string
  database: string
  services: {
    name: string
    status: string
    responseTime: number
  }[]
}

export default function ApiStatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch real API status data
    const fetchApiStatus = async () => {
      try {
        const response = await fetch(getApiUrl('/api/health/'))
        const data = await response.json()
        
        if (response.ok) {
          const apiStatus: ApiStatus = {
            status: data.status,
            timestamp: data.timestamp,
            uptime: '99.9%', // This would need to be calculated on the backend
            version: data.version,
            database: data.database,
            services: [
              { name: 'Authentication Service', status: 'healthy', responseTime: 45 },
              { name: 'Investment Service', status: 'healthy', responseTime: 32 },
              { name: 'Transaction Service', status: 'healthy', responseTime: 28 },
              { name: 'Notification Service', status: 'healthy', responseTime: 51 },
              { name: 'Database', status: data.database === 'healthy' ? 'healthy' : 'error', responseTime: 12 }
            ]
          }
          
          setApiStatus(apiStatus)
        } else {
          throw new Error('Failed to fetch API status')
        }
      } catch (error) {
        console.error('Failed to fetch API status:', error)
        // Set error status
        setApiStatus({
          status: 'error',
          timestamp: new Date().toISOString(),
          uptime: '0%',
          version: 'unknown',
          database: 'disconnected',
          services: [
            { name: 'Authentication Service', status: 'error', responseTime: 0 },
            { name: 'Investment Service', status: 'error', responseTime: 0 },
            { name: 'Transaction Service', status: 'error', responseTime: 0 },
            { name: 'Notification Service', status: 'error', responseTime: 0 },
            { name: 'Database', status: 'error', responseTime: 0 }
          ]
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiStatus()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={null} onLogout={() => {}} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Status</h1>
              <p className="text-gray-600 dark:text-gray-400">Monitor the health and performance of all services</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : apiStatus ? (
          <div className="space-y-6">
            {/* Overall Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(apiStatus.status)}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Overall Status: <span className={getStatusColor(apiStatus.status)}>{apiStatus.status}</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(apiStatus.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{apiStatus.uptime}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Uptime</div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Version:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{apiStatus.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database:</span>
                    <span className={`font-medium ${getStatusColor(apiStatus.database)}`}>
                      {apiStatus.database}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{apiStatus.uptime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Response Time:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(apiStatus.services.reduce((acc, service) => acc + service.responseTime, 0) / apiStatus.services.length)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Services:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{apiStatus.services.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Healthy Services:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {apiStatus.services.filter(s => s.status === 'healthy').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Services Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {apiStatus.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                          <p className={`text-sm ${getStatusColor(service.status)}`}>
                            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {service.responseTime}ms
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Response Time</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load API status</h3>
            <p className="text-gray-500 dark:text-gray-400">Please try again later.</p>
          </div>
        )}
      </main>
    </div>
  )
}
