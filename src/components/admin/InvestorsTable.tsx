'use client'

import { useState } from 'react'
import { Users, Eye, Edit, Trash2, Plus } from 'lucide-react'

export default function InvestorsTable() {
  const [investors, setInvestors] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      investedAmount: 10000,
      totalProfit: 2500,
      profitUsdt: 1500,
      joinDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      investedAmount: 15000,
      totalProfit: 3750,
      profitUsdt: 2250,
      joinDate: '2024-01-10',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@example.com',
      investedAmount: 5000,
      totalProfit: 1250,
      profitUsdt: 750,
      joinDate: '2024-01-20',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      investedAmount: 20000,
      totalProfit: 5000,
      profitUsdt: 3000,
      joinDate: '2024-01-05',
      status: 'Active'
    }
  ])

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this investor?')) {
      setInvestors(investors.filter(investor => investor.id !== id))
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Investors Management
            </h3>
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Investor</span>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Invested
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Profit
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor) => (
                <tr key={investor.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {investor.name}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Joined: {investor.joinDate}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {investor.email}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      ${investor.investedAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ₫{investor.totalProfit.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        USDT: ₫{investor.profitUsdt.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      {investor.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(investor.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
