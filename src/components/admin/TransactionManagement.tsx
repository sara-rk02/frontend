'use client'

import { ArrowRightLeft, Flag } from 'lucide-react'

interface TransactionManagementProps {
  onShowInrModal?: () => void
  onShowUaeModal?: () => void
}

export default function TransactionManagement({ onShowInrModal, onShowUaeModal }: TransactionManagementProps) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <ArrowRightLeft className="text-indigo-500 mr-2 w-5 h-5" />
          Transaction Management
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onShowInrModal}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowRightLeft className="w-5 h-5 mr-3" />
            Add INR Transaction
          </button>
          <button
            onClick={onShowUaeModal}
            className="flex items-center justify-center px-6 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-lg font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            <Flag className="w-5 h-5 mr-3" />
            Add UAE Transaction
          </button>
        </div>
      </div>
    </div>
  )
}
