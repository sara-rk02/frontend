'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  ChevronDown, 
  Moon, 
  Sun, 
  LogOut,
  Users,
  UserPlus,
  BarChart3,
  CreditCard,
  DollarSign,
  Receipt,
  Menu,
  X
} from 'lucide-react'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface NavigationProps {
  user: User | null
  onLogout: () => void
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light'
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains('dark')
    
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDarkMode(true)
    }
  }

  const handleLogout = () => {
    onLogout()
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-3"
            >
              {/* Logo Image */}
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Investment Dashboard</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">USDT Portal</p>
              </div>
            </button>
          </div>
          
          {user && (
            <>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <X className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Navigation Links - Desktop */}
              <div className="hidden md:flex items-center space-x-8">
                {['admin', 'SUPER_ADMIN'].includes(user.role) ? (
                  <>
                    <button
                      onClick={() => router.push('/admin/dashboard')}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={() => router.push('/admin/investors')}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Investors</span>
                    </button>
                    <button
                      onClick={() => router.push('/admin/payouts')}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Payouts</span>
                    </button>
                    <button
                      onClick={() => router.push('/admin/expenses')}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <Receipt className="h-4 w-4" />
                      <span>Expenses</span>
                    </button>
                    <button
                      onClick={() => router.push('/admin/register')}
                      className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add Investor</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                )}
              </div>
              
              {/* Right side controls */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                  <button
                    onClick={toggleDarkMode}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Toggle dark mode</span>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-300 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                      {isDarkMode ? <Moon className="h-3 w-3 m-0.5" /> : <Sun className="h-3 w-3 m-0.5" />}
                    </span>
                  </button>
                </div>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span>{user.name}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                          Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Mobile menu */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              {/* Mobile Navigation Links */}
              {['admin', 'SUPER_ADMIN'].includes(user.role) ? (
                <>
                  <button
                    onClick={() => {
                      router.push('/admin/dashboard')
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/investors')
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Users className="h-5 w-5" />
                    <span>Investors</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/payouts')
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <CreditCard className="h-5 w-5" />
                    <span>Payouts</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/expenses')
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <Receipt className="h-5 w-5" />
                    <span>Expenses</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/admin/register')
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Add Investor</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push('/dashboard')
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
              )}
              
              {/* Mobile User Info and Controls */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                  </div>
                </div>
                
                {/* Mobile Dark Mode Toggle */}
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                    <button
                      onClick={toggleDarkMode}
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">Toggle dark mode</span>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-300 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                        {isDarkMode ? <Moon className="h-3 w-3 m-0.5" /> : <Sun className="h-3 w-3 m-0.5" />}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
