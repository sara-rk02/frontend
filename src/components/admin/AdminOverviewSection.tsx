'use client'

import { PieChart } from 'lucide-react'

export default function AdminOverviewSection() {
  // Mock data - replace with actual API data
  const overviewData = {
    totalTransactionProfit: 25000.00,
    adminsProfit: 12500.00,
    adminAShare: 6250.00,
    adminBShare: 6250.00,
    adminAAvailable: 5000.00,
    adminBAvailable: 5000.00
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <PieChart className="text-purple-500 mr-2 w-5 h-5" />
          Admin Overview
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Transactions Profit */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              ₫{overviewData.totalTransactionProfit.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Transactions Profit
            </p>
          </div>
          
          {/* Admins Profit */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              ₫{overviewData.adminsProfit.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admins Profit
            </p>
          </div>
          
          {/* Admin A Share */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              ₫{overviewData.adminAShare.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admin A Share (50%)
            </p>
          </div>
          
          {/* Admin B Share */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-1">
              ₫{overviewData.adminBShare.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admin B Share (50%)
            </p>
          </div>
        </div>
        
        {/* Available Balances Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Admin A Available Balance */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
              ₫{overviewData.adminAAvailable.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admin A Available Balance
            </p>
          </div>
          
          {/* Admin B Available Balance */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
              ₫{overviewData.adminBAvailable.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admin B Available Balance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
