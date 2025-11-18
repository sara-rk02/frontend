'use client'

import Image from 'next/image'

interface CurrencyDisplayProps {
  amount: number | null | undefined
  className?: string
  showSymbol?: boolean
  decimals?: number
}

export default function CurrencyDisplay({ 
  amount, 
  className = '', 
  showSymbol = true,
  decimals = 2 
}: CurrencyDisplayProps) {
  // Handle null, undefined, or invalid amounts
  const safeAmount = amount ?? 0
  
  const formattedAmount = safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return (
    <span className={`inline-flex items-center ${className}`}>
      {showSymbol && (
        <Image
          src="/images/Dhiram.png"
          alt="AED"
          width={16}
          height={16}
          className="inline w-4 h-4 align-text-bottom mr-1"
        />
      )}
      {formattedAmount}
    </span>
  )
}
