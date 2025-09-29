'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { TrendingUp, BarChart3 } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function AdminCharts() {
  // Mock data - replace with actual API data
  const chartData = {
    labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5', 'Jan 6', 'Jan 7'],
    balanceUsdtValues: [1000, 1050, 1100, 1080, 1150, 1200, 1250],
    profitUsdtValues: [50, 100, 80, 70, 50, 50, 50]
  }

  const usdtBalanceData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Total USDT Balance',
        data: chartData.balanceUsdtValues,
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const profitData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Daily Profit (USDT)',
        data: chartData.profitUsdtValues,
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Total USDT Balance') {
              return 'Balance: ₫' + context.parsed.y.toLocaleString()
            } else {
              return 'Profit: ₫' + context.parsed.y.toFixed(4)
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value: any) {
            return '₫' + value.toLocaleString()
          }
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* USDT Balance Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <TrendingUp className="text-blue-500 mr-2 w-5 h-5" />
            USDT Balance Trend
          </h3>
        </div>
        <div className="h-64">
          <Line data={usdtBalanceData} options={chartOptions} />
        </div>
      </div>
      
      {/* Profit Trend Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
            <BarChart3 className="text-green-500 mr-2 w-5 h-5" />
            Profit Trend (USDT)
          </h3>
        </div>
        <div className="h-64">
          <Line data={profitData} options={chartOptions} />
        </div>
      </div>
    </div>
  )
}
