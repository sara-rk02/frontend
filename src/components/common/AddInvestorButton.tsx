'use client'

import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'

interface AddInvestorButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onModalOpen?: () => void
  className?: string
}

export default function AddInvestorButton({ 
  variant = 'primary', 
  size = 'md',
  onModalOpen,
  className = ''
}: AddInvestorButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onModalOpen) {
      // If modal handler is provided, use it (for admin dashboard)
      onModalOpen()
    } else {
      // Otherwise, navigate to register page (for navigation)
      router.push('/admin/register')
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
      case 'secondary':
        return 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      default:
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'md':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'md':
        return 'h-4 w-4'
      case 'lg':
        return 'h-5 w-5'
      default:
        return 'h-4 w-4'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      default:
        return 'text-sm'
    }
  }

  const baseClasses = variant === 'primary' 
    ? 'inline-flex items-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
    : 'flex items-center space-x-2 w-full text-left rounded-md transition-colors'

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      <UserPlus className={`${getIconSize()} ${variant === 'primary' ? 'mr-2' : ''}`} />
      <span className={getTextSize()}>
        {variant === 'primary' ? 'Add New Investor' : 'Add Investor'}
      </span>
    </button>
  )
}
