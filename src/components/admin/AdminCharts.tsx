'use client'

import { useState, useEffect } from 'react'
import ChartWithFilters from '@/components/common/ChartWithFilters'
import { apiService } from '@/services/api'

export default function AdminCharts() {
  const [balanceChartData, setBalanceChartData] = useState<any>(null)
  const [profitChartData, setProfitChartData] = useState<any>(null)
  const [roiChartData, setRoiChartData] = useState<any>(null)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [profitLoading, setProfitLoading] = useState(false)
  const [roiLoading, setRoiLoading] = useState(false)

  const loadChartData = async (days: number) => {
    try {
      setBalanceLoading(true)
      setProfitLoading(true)
      setRoiLoading(true)

      const response = await apiService.getAdminChartData(days)
      
      if (response.success && response.data) {
        const { balance_trend, profit_trend, roi_comparison } = response.data
        
        // Prepare Balance Trend Chart
        if (balance_trend && typeof balance_trend === 'object') {
          const balanceDates = Object.keys(balance_trend).sort()
          const balanceValues = balanceDates.map(date => balance_trend[date])
          
          const balanceData = {
            labels: balanceDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'Total Balance (AED)',
                data: balanceValues,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
              },
            ],
          }
          setBalanceChartData(balanceData)
        }

        // Prepare Profit Trend Chart
        if (profit_trend && typeof profit_trend === 'object') {
          const profitDates = Object.keys(profit_trend).sort()
          const profitValues = profitDates.map(date => profit_trend[date])
          
          const profitData = {
            labels: profitDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'Daily Profit (AED)',
                data: profitValues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
              },
            ],
          }
          setProfitChartData(profitData)
        }

        // Prepare ROI Comparison Chart
        if (roi_comparison && typeof roi_comparison === 'object' && roi_comparison.uae && roi_comparison.inr) {
          const roiDates = Object.keys(roi_comparison.uae).sort()
          const uaeRoiValues = roiDates.map(date => roi_comparison.uae[date] || 0)
          const inrRoiValues = roiDates.map(date => roi_comparison.inr[date] || 0)
          
          const roiData = {
            labels: roiDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
              {
                label: 'UAE ROI (%)',
                data: uaeRoiValues,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
              },
              {
                label: 'INR ROI (%)',
                data: inrRoiValues,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
              },
            ],
          }
          setRoiChartData(roiData)
        }
      } else {
        console.warn('Admin chart data response failed or missing data:', response)
        // Set empty data to prevent undefined errors
        setBalanceChartData(null)
        setProfitChartData(null)
        setRoiChartData(null)
      }
    } catch (error) {
      console.error('Error loading admin chart data:', error)
      // Set empty data to prevent undefined errors
      setBalanceChartData(null)
      setProfitChartData(null)
      setRoiChartData(null)
    } finally {
      setBalanceLoading(false)
      setProfitLoading(false)
      setRoiLoading(false)
    }
  }

  useEffect(() => {
    loadChartData(30) // Load initial data for 30 days
  }, [])

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
                text: 'Balance (AED)',
                color: '#6b7280',
              },
              ticks: {
                callback: function(value: any) {
                  return value.toLocaleString() + ' AED'
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
                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} AED`
                },
              },
            },
          },
        }}
      />

      {/* Profit Trend Chart */}
      <ChartWithFilters
        title="Profit Trend Analysis"
        chartType="line"
        data={profitChartData}
        loading={profitLoading}
        onRefresh={loadChartData}
        options={{
          scales: {
            y: {
              title: {
                display: true,
                text: 'Profit (AED)',
                color: '#6b7280',
              },
              ticks: {
                callback: function(value: any) {
                  return value.toLocaleString() + ' AED'
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
                  return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} AED`
                },
              },
            },
          },
        }}
      />

      {/* ROI Comparison Chart */}
      <ChartWithFilters
        title="ROI Comparison: UAE vs INR"
        chartType="line"
        data={roiChartData}
        loading={roiLoading}
        onRefresh={loadChartData}
        options={{
          scales: {
            y: {
              title: {
                display: true,
                text: 'ROI (%)',
                color: '#6b7280',
              },
              ticks: {
                callback: function(value: any) {
                  return value.toFixed(2) + '%'
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
                  return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
                },
              },
            },
          },
        }}
      />
    </div>
  )
}
