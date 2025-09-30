'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, ChevronDown, X, User } from 'lucide-react'

interface SearchableSelectProps {
  options: Array<{
    id: number | string
    name: string
    email?: string
    role?: string
  }>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  maxDisplayItems?: number
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search and select...",
  label,
  required = false,
  maxDisplayItems = 10
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState<typeof options[0] | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, maxDisplayItems)

  // Find selected option when value changes
  useEffect(() => {
    const option = options.find(opt => opt.id.toString() === value)
    setSelectedOption(option || null)
  }, [value, options])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (option: typeof options[0]) => {
    onChange(option.id.toString())
    setSelectedOption(option)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = () => {
    onChange('')
    setSelectedOption(null)
    setSearchTerm('')
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm('')
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
            !selectedOption ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {selectedOption ? (
                <>
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{selectedOption.name}</div>
                    {selectedOption.email && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedOption.email}
                      </div>
                    )}
                    {selectedOption.role && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {selectedOption.role}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {selectedOption && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-3 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedOption?.id === option.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {option.name}
                        </div>
                        {option.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {option.email}
                          </div>
                        )}
                        {option.role && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {option.role}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </div>
              )}
            </div>

            {/* Show more indicator */}
            {options.length > maxDisplayItems && filteredOptions.length === maxDisplayItems && (
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-gray-700">
                Showing first {maxDisplayItems} results. Use search to find specific users.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
