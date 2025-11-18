'use client'

import { useState, useEffect } from 'react'
import ChartWithFilters from '@/components/common/ChartWithFilters'
import { apiService } from '@/services/api'

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
  const [balanceChartData, setBalanceChartData] = useState<any>(null)
  const [roiProfitChartData, setRoiProfitChartData] = useState<any>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [roiProfitLoading, setRoiProfitLoading] = useState(false)

  const loadChartData = async (days: number) => {
    try {
      setBalanceLoading(true)
      setRoiProfitLoading(true)

      const response = await apiService.getInvestorChartData(user.id, days)
      
      if (response.success && response.data) {
        const { balance_trend, roi_profit_comparison } = response.data
        
        // Prepare Balance Trend Chart
        if (balance_trend && typeof balance_trend === 'object') {
          const balanceDates = Object.keys(balance_trend).sort()
          const balanceValues = balanceDates.map(date => balance_trend[date])
          
          const balanceData = {
            labels: balanceDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'Total Balance',
                data: balanceValues,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
              },
            ],
          }
          setBalanceChartData(balanceData)
        }

        // Prepare ROI vs Profit Comparison Chart
        if (roi_profit_comparison && typeof roi_profit_comparison === 'object') {
          const roiProfitDates = Object.keys(roi_profit_comparison).sort()
          const roiValues = roiProfitDates.map(date => roi_profit_comparison[date]?.roi || 0)
          const profitValues = roiProfitDates.map(date => roi_profit_comparison[date]?.profit || 0)
          
          const roiProfitData = {
            labels: roiProfitDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'ROI (%)',
                data: roiValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y',
              },
              {
                label: 'Profit',
                data: profitValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                yAxisID: 'y1',
              },
            ],
          }
          setRoiProfitChartData(roiProfitData)
        }
      } else {
        console.warn('Investor chart data response failed or missing data:', response)
        // Set empty data to prevent undefined errors
        setBalanceChartData(null)
        setRoiProfitChartData(null)
      }
    } catch (error) {
      console.error('Error loading investor chart data:', error)
      // Set empty data to prevent undefined errors
      setBalanceChartData(null)
      setRoiProfitChartData(null)
    } finally {
      setBalanceLoading(false)
      setRoiProfitLoading(false)
    }
  }

  useEffect(() => {
    loadChartData(30) // Load initial data for 30 days
  }, [user.id])

  return (
    <div className="space-y-8 mb-8">
      {/* Balance Trend Chart */}
      <ChartWithFilters
        title="Balance Trend Analysis"
        chartType="line"
        data={balanceChartData}
        loading={balanceLoading}
        onRefresh={loadChartData}
        options={{
          scales: {
            y: {
              title: {
                display: true,
                text: 'Balance',
                color: '#6b7280',
              },
              ticks: {
                callback: function(value: any) {
                  return value.toLocaleString()
                },
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
                color: '#6b7280',
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
                },
              },
            },
          },
        }}
      />

      {/* ROI vs Profit Comparison Chart */}
      <ChartWithFilters
        title="ROI vs Profit Comparison"
        chartType="line"
        data={roiProfitChartData}
        loading={roiProfitLoading}
        onRefresh={loadChartData}
        options={{
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
                text: 'Profit',
                color: '#6b7280',
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function(value: any) {
                  return value.toLocaleString()
                },
                color: '#6b7280',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Date',
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
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context: any) {
                  if (context.dataset.label === 'ROI (%)') {
                    return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                  } else {
                    return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
                  }
                },
              },
            },
          },
        }}
      />
    </div>
  )
}

