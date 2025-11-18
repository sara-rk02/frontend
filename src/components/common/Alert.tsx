'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface AlertProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export default function Alert({ message, type = 'success', duration = 3000, onClose }: AlertProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsAnimating(true)
        setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, 500) // Match transition duration
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 500)
  }

  if (!isVisible) return null

  const getAlertStyles = () => {
    const baseStyles = 'fixed top-5 right-5 z-50 max-w-sm w-full mx-4 px-4 py-3 rounded-lg shadow-lg transition-all duration-500 transform'
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white border border-green-600`
      case 'error':
        return `${baseStyles} bg-red-500 text-white border border-red-600`
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white border border-yellow-600`
      case 'info':
        return `${baseStyles} bg-blue-500 text-white border border-blue-600`
      default:
        return `${baseStyles} bg-green-500 text-white border border-green-600`
    }
  }

  const getIcon = () => {
    const iconClass = 'w-5 h-5 mr-2 flex-shrink-0'
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-100`} />
      case 'error':
        return <XCircle className={`${iconClass} text-red-100`} />
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-100`} />
      case 'info':
        return <Info className={`${iconClass} text-blue-100`} />
      default:
        return <CheckCircle className={`${iconClass} text-green-100`} />
    }
  }

  return (
    <div 
      className={`${getAlertStyles()} ${
        isAnimating 
          ? 'opacity-0 translate-x-full' 
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={handleClose}
          className="ml-3 text-white hover:text-gray-200 transition-colors"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Hook for managing alerts
export function useAlert() {
  const [alert, setAlert] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  } | null>(null)

  const showAlert = (
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'success',
    duration: number = 3000
  ) => {
    setAlert({ message, type, duration })
  }

  const hideAlert = () => {
    setAlert(null)
  }

  const AlertComponent = alert ? (
    <Alert
      message={alert.message}
      type={alert.type}
      duration={alert.duration}
      onClose={hideAlert}
    />
  ) : null

  return {
    showAlert,
    hideAlert,
    AlertComponent
  }
}
