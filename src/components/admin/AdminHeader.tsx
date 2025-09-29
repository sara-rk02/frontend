'use client'

import { useRouter } from 'next/navigation'
import { Users, UserPlus, DollarSign, FileText } from 'lucide-react'

interface AdminHeaderProps {
  onShowPayoutModal?: () => void
  onShowExpenseModal?: () => void
  onShowCustomerModal?: () => void
}

export default function AdminHeader({ onShowPayoutModal, onShowExpenseModal, onShowCustomerModal }: AdminHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-3">
              <Users className="text-white w-5 h-5" />
            </div>
            Admin Panel
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage all investors and their investment parameters
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <button
            onClick={onShowCustomerModal}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Investor
          </button>
          <button
            onClick={onShowPayoutModal}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Add Payout
          </button>
          <button
            onClick={onShowExpenseModal}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Admin Expense
          </button>
        </div>
      </div>
    </div>
  )
}
