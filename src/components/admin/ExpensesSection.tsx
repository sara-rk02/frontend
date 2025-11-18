'use client'

import { FileText } from 'lucide-react'
import CurrencyDisplay from '../common/CurrencyDisplay'

interface Expense {
  id: number
  amt: number
  description: string
  date: string
  created_at: string
}

export default function ExpensesSection() {
  // Mock data - replace with actual API data
  const expenses: Expense[] = [
    {
      id: 1,
      amt: 500.00,
      description: 'Office rent for January',
      date: '2024-01-15',
      created_at: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      amt: 200.00,
      description: 'Software subscription fees',
      date: '2024-01-14',
      created_at: '2024-01-14 15:45:00'
    },
    {
      id: 3,
      amt: 150.00,
      description: 'Marketing campaign expenses',
      date: '2024-01-13',
      created_at: '2024-01-13 09:20:00'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <FileText className="text-red-500 mr-2 w-5 h-5" />
          Admin Expenses
        </h3>
      </div>
      <div className="p-6">
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <CurrencyDisplay amount={expense.amt} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{expense.created_at}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">Loading expenses...</p>
          </div>
        )}
      </div>
    </div>
  )
}
