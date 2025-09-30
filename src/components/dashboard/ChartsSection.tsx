'use client'

import { useState, useEffect, useRef } from 'react'
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
import { apiService } from '@/services/api'
import { Coins, BarChart3 } from 'lucide-react'

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

interface User {
  id: number
  name: string
  email: string
  role: string
  invested_amount?: number
  total_profit?: number
  profit_usdt?: number
}

interface ChartsSectionProps {
  user: User
}

export default function ChartsSection({ user }: ChartsSectionProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await apiService.getChartData()
        
        if (response.success && response.data) {
          setChartData(response.data)
        } else {
          // Fallback to mock data if API fails
          const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const roiValues = Array.from({ length: 12 }, () => Math.random() * 2 + 0.5)
          const profitValues = Array.from({ length: 12 }, () => Math.random() * 1000 + 100)
          setChartData({ roi_trend: roiValues.map((roi, i) => ({ date: labels[i], roi })), profit_trend: profitValues.map((profit, i) => ({ date: labels[i], profit })) })
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Fallback to mock data
        const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const roiValues = Array.from({ length: 12 }, () => Math.random() * 2 + 0.5)
        const profitValues = Array.from({ length: 12 }, () => Math.random() * 1000 + 100)
        setChartData({ roi_trend: roiValues.map((roi, i) => ({ date: labels[i], roi })), profit_trend: profitValues.map((profit, i) => ({ date: labels[i], profit })) })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [])

  useEffect(() => {
    // Chart refresh functionality - matches original template
    const refreshInterval = setInterval(() => {
      // Simulate chart data refresh every 5 minutes (300000ms)
      // In a real app, this would fetch new data from the API
      console.log('Refreshing chart data...')
    }, 300000) // 5 minutes

    return () => clearInterval(refreshInterval)
  }, [])

  if (isLoading || !chartData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Use real data from API
  const labels = chartData.roi_trend?.map((item: any) => item.date) || []
  const roiValues = chartData.roi_trend?.map((item: any) => item.roi) || []
  const profitValues = chartData.profit_trend?.map((item: any) => item.profit) || []
  
  // Calculate cumulative balance from ROI history
  const investedAmount = user.invested_amount || 1000
  const cumulativeBalance: number[] = []
  let runningBalance = investedAmount

  roiValues.forEach((roi: number) => {
    const dailyProfit = investedAmount * (roi / 22 / 100)
    runningBalance += dailyProfit
    cumulativeBalance.push(runningBalance)
  })

  const usdtBalanceData = {
    labels,
    datasets: [
      {
        label: 'USDT Balance (₫)',
        data: cumulativeBalance,
        borderColor: '#ffc107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const comparisonData = {
    labels,
        datasets: [
          {
            label: 'ROI (%)',
            data: roiValues,
            backgroundColor: 'rgba(0, 123, 255, 0.6)',
            borderColor: '#007bff',
            borderWidth: 1,
            yAxisID: 'y',
          },
          {
            label: 'Profit (₫)',
            data: profitValues,
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            borderColor: '#28a745',
            borderWidth: 1,
            yAxisID: 'y1',
          },
        ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: investedAmount,
        ticks: {
          stepSize: 1000,
          callback: function(value: any) {
            return '₫' + value.toLocaleString()
          },
          color: '#6b7280',
        },
        title: {
          display: true,
          text: 'USDT Balance (₫)',
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
          color: '#6b7280',
        },
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  }

  const comparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#6b7280',
        },
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'ROI (%)',
          color: '#6b7280',
        },
        ticks: {
          callback: function(value: any) {
            return value.toFixed(2) + '%'
          },
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Profit (₫)',
          color: '#6b7280',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function(value: any) {
            return '₫' + value.toFixed(2)
          },
          color: '#6b7280',
        },
      },
      x: {
        ticks: {
          color: '#6b7280',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* USDT Balance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <Coins className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            USDT Balance Trend
          </h3>
        </div>
        <div className="h-64">
          <Line data={usdtBalanceData} options={chartOptions} />
        </div>
      </div>

      {/* ROI vs Profit Comparison Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ROI vs Profit Comparison
          </h3>
        </div>
        <div className="h-64">
          <Bar data={comparisonData} options={comparisonOptions} />
        </div>
      </div>
    </div>
  )
}

