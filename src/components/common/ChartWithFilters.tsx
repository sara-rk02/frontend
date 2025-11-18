'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { Calendar, RefreshCw } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ChartWithFiltersProps {
  title: string
  chartType: 'line' | 'bar'
  data: any
  options?: any
  onRefresh: (days: number) => void
  loading?: boolean
  className?: string
}

export default function ChartWithFilters({ 
  title, 
  chartType, 
  data, 
  options, 
  onRefresh, 
  loading = false,
  className = ''
}: ChartWithFiltersProps) {
  const [selectedDays, setSelectedDays] = useState(30)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh(selectedDays)
    setIsRefreshing(false)
  }

  const handleDaysChange = (days: number) => {
    setSelectedDays(days)
    onRefresh(days)
  }

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      y: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
    ...options,
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        
        <div className="flex items-center space-x-3">
          {/* Date filter buttons */}
          <div className="flex space-x-2">
            {[
              { label: '7D', days: 7 },
              { label: '30D', days: 30 },
              { label: '90D', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => handleDaysChange(days)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedDays === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading chart data...</p>
            </div>
          </div>
        ) : data && data.labels && data.labels.length > 0 ? (
          chartType === 'line' ? (
            <Line data={data} options={defaultOptions} />
          ) : (
            <Bar data={data} options={defaultOptions} />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No data available for the selected period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

