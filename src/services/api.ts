// API service for communicating with the Flask backend

import { getApiUrl, getAuthUrl, getDashboardUrl, getChartUrl, getBrokerUrl, getPayoutUrl } from '@/config/api'

// Request deduplication and caching
const requestCache = new Map<string, { data: any; timestamp: number }>()
const pendingRequests = new Map<string, Promise<any>>()
const CACHE_TTL = 60000 // 1 minute

// Helper function to create cache key
function createCacheKey(url: string, options?: RequestInit): string {
  return `${url}_${JSON.stringify(options || {})}`
}

// Helper function to check if cache is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL
}

// Optimized fetch with caching and deduplication
async function optimizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const cacheKey = createCacheKey(url, options)
  
  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey)!
  }
  
  // Make the request
  const requestPromise = fetch(url, options)
  pendingRequests.set(cacheKey, requestPromise)
  
  try {
    const response = await requestPromise
    
    // Don't consume the response body here - let the caller handle it
    return response
  } finally {
    pendingRequests.delete(cacheKey)
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  error_type?: string
}

interface ExtraProfitAllocationResponse {
  success: boolean
  user_name?: string
  message?: string
  error?: string
}

interface TransactionResponse {
  success: boolean
  data?: any
  extra_profit?: boolean
  extra_amount?: number
  extra_profit_amount?: number
  allocation_id?: number
  message?: string
  error?: string
}

interface LoginRequest {
  email: string
  password: string
  role: string
}

interface LoginResponse {
  user: {
    id: number
    name: string
    email: string
    role: string
    invested_amount?: number
    total_profit?: number
    profit_usdt?: number
  }
  token: string
}

interface RegisterInvestorRequest {
  name: string
  email: string
  password: string
  invested_amount: number
  aed_conversion_rate: number
  roi_min: number
  roi_max: number
  broker_relationship?: {
    broker_id: number
    broker_min_roi: number
    broker_max_roi: number
  }
}

interface Broker {
  id: number
  name: string
  email: string
  min_roi: number
  max_roi: number
  total_commission_aed: number
  active: boolean
  created_at: string
}

interface CreateBrokerRequest {
  name: string
  email: string
  password: string
  min_roi: number
  max_roi: number
}

interface BrokerCommissionHistory {
  id: number
  broker_id: number
  investor_id: number
  date: string
  daily_rate: number
  commission_aed: number
  created_at: string
}

interface BrokerPayout {
  id: number
  amount: number
  admin_name: string
  date: string
  created_at: string
}

interface BrokerDashboardData {
  broker: Broker
  statistics: {
    total_investors: number
    total_invested_aed: number
    total_commission_aed: number
    average_investment_aed: number
  }
  investors: {
    id: number
    name: string
    email: string
    invested_amount_aed: number
    total_profit: number
    balance_usdt: number
    roi_min: number
    roi_max: number
    broker_min_roi?: number
    broker_max_roi?: number
    daily_commission: number
    active: boolean
  }[]
  daily_commissions: Record<string, number>
  recent_commissions: BrokerCommissionHistory[]
}

interface ChartData {
  labels: string[]
  roi_values: number[]
  profit_values: number[]
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.arbitrageyield.com'
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(getAuthUrl('LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to parse error response
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP ${response.status}: ${response.statusText}` }
        }
        return { 
          success: false, 
          error: errorData.message || `Login failed with status ${response.status}`,
          error_type: errorData.error_type
        }
      }

      const data = await response.json()

      if (data.success) {
        // Backend returns { success, user, token, message }
        // Frontend expects { success, data: { user, token } }
        // Note: Backend may not return token, so we'll create a simple one
        return { 
          success: true, 
          data: {
            user: data.user,
            token: data.token || `user_token_${data.user.id}` // Fallback token if not provided
          }
        }
      } else {
        return { 
          success: false, 
          error: data.message || 'Login failed',
          error_type: data.error_type
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error occurred' 
      }
    }
  }

  async registerInvestor(investorData: RegisterInvestorRequest): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getAuthUrl('REGISTER'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(investorData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Registration failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getChartData(): Promise<ApiResponse<ChartData>> {
    try {
      const response = await fetch(getChartUrl('DATA'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch chart data' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getInvestors(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(getDashboardUrl('INVESTORS'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch investors' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getUsers(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch users' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getDashboardData(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getDashboardUrl('SUMMARY'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch dashboard data' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async logout(): Promise<void> {
    // JWT tokens are stateless, so logout is handled client-side
    // Just remove the token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('token_timestamp')
    }
  }

  // Broker methods
  async getBrokers(): Promise<ApiResponse<Broker[]>> {
    try {
      const response = await fetch(getBrokerUrl('LIST'), {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch brokers' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async createBroker(brokerData: CreateBrokerRequest): Promise<ApiResponse<Broker>> {
    try {
      const response = await fetch(getBrokerUrl('CREATE'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(brokerData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to create broker' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getBrokerInvestors(brokerId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${getBrokerUrl('INVESTORS')}${brokerId}/investors`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch broker investors' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getBrokerCommissionHistory(brokerId: number): Promise<ApiResponse<BrokerCommissionHistory[]>> {
    try {
      const response = await fetch(`${getBrokerUrl('COMMISSION_HISTORY')}${brokerId}/commission-history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch commission history' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Broker Authentication
  async brokerLogin(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(getAuthUrl('BROKER_LOGIN'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        return { 
          success: true, 
          data: {
            user: data.user,
            token: data.token
          }
        }
      } else {
        return { success: false, error: data.message || 'Broker login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Broker Dashboard
  async getBrokerDashboard(brokerId: number): Promise<ApiResponse<BrokerDashboardData>> {
    try {
      const response = await fetch(`${getBrokerUrl('DASHBOARD')}${brokerId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch broker dashboard' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Commission Payouts
  async createBrokerPayout(brokerId: number, amount: number, adminName: string = 'System'): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getBrokerUrl('PAYOUT')}${brokerId}/payout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount, admin_name: adminName }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Failed to create payout' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async createUnifiedPayout(payoutData: {
    role: string
    user_id: number
    amount: number
    date: string
    note?: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getPayoutUrl('UNIFIED'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payoutData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Failed to create payout' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getBrokerPayouts(brokerId: number): Promise<ApiResponse<BrokerPayout[]>> {
    try {
      const response = await fetch(`${getBrokerUrl('PAYOUTS')}${brokerId}/payouts`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data.payouts }
      } else {
        return { success: false, error: data.message || 'Failed to fetch payouts' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Transaction methods
  async createInrTransaction(transactionData: {
    amount: number
    date: string
    aed_to_usdt: number
    inr_to_aed: number
    usdt_selling_inr: number
  }): Promise<TransactionResponse> {
    try {
      const response = await fetch(getApiUrl('/api/transactions/inr/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transactionData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data, extra_profit: data.extra_profit, extra_amount: data.extra_amount, extra_profit_amount: data.extra_profit_amount, allocation_id: data.allocation_id }
      } else {
        return { success: false, error: data.message || 'Failed to create INR transaction' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async createUaeTransaction(transactionData: {
    amount: number
    date: string
    usdt_buy_rate: number
    usdt_sell_rate: number
  }): Promise<TransactionResponse> {
    try {
      const response = await fetch(getApiUrl('/api/transactions/uae/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(transactionData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data, extra_profit: data.extra_profit, extra_amount: data.extra_amount, extra_profit_amount: data.extra_profit_amount, allocation_id: data.allocation_id }
      } else {
        return { success: false, error: data.message || 'Failed to create UAE transaction' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }


  async getInitialInvestment(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl('/api/transactions/initial_investment/'), {
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Failed to get initial investment' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async setInitialInvestment(amountUsd: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(getApiUrl('/api/transactions/initial_investment/'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount_usd: amountUsd }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.message || 'Failed to set initial investment' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Expense methods
  async createExpense(expenseData: {
    amount: number
    description: string
    expense_date: string
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/expenses/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          amount: expenseData.amount,
          description: expenseData.description,
          date: expenseData.expense_date
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Backend returns expense object directly, not wrapped in success/data
        return { success: true, data: data }
      } else {
        return { success: false, error: data.message || 'Failed to create expense' }
      }
    } catch (error) {
      console.error('Error creating expense:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Transaction methods
  async deleteInrTransaction(transactionId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getApiUrl('/api/transactions/inr/')}${transactionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data }
      } else {
        return { success: false, error: data.message || 'Failed to delete INR transaction' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async deleteUaeTransaction(transactionId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getApiUrl('/api/transactions/uae/')}${transactionId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data }
      } else {
        return { success: false, error: data.message || 'Failed to delete UAE transaction' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Chart Data APIs
  async getAdminChartData(days: number = 30): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getApiUrl('/api/dashboard/charts/admin')}?days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch admin chart data' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getInvestorChartData(investorId: number, days: number = 30): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getApiUrl('/api/dashboard/charts/investor/')}${investorId}?days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch investor chart data' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  async getBrokerChartData(brokerId: number, days: number = 30): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${getApiUrl('/api/dashboard/charts/broker/')}${brokerId}?days=${days}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch broker chart data' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Dashboard methods
  async getDashboardSummary(): Promise<ApiResponse<any>> {
    try {
      const cacheKey = createCacheKey(`${this.baseUrl}/api/dashboard/summary`, { method: 'GET' })
      
      // Check cache first
      const cached = requestCache.get(cacheKey)
      if (cached && isCacheValid(cached.timestamp)) {
        return { success: true, data: cached.data }
      }
      
      const response = await optimizedFetch(`${this.baseUrl}/api/dashboard/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders()),
        },
      })
      
      if (response.ok) {
        // Clone the response before consuming to avoid "body stream already read" errors
        const clonedResponse = response.clone()
        const data = await clonedResponse.json()
        
        // Cache the successful response
        requestCache.set(cacheKey, { data, timestamp: Date.now() })
        
        return { success: true, data }
      } else {
        const errorData = await response.text()
        console.error('Dashboard summary error:', errorData)
        return { success: false, error: 'Failed to fetch dashboard summary' }
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Extra Profit Allocation
  async allocateExtraProfit(allocationId: number, userId: number, allocatedAmount: number): Promise<ExtraProfitAllocationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions/extra-profit-allocation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.getAuthHeaders()),
        },
        body: JSON.stringify({
          allocation_id: allocationId,
          user_id: userId,
          allocated_amount: allocatedAmount
        })
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, ...data }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to allocate profit' }))
        return { success: false, error: errorData.message || 'Failed to allocate profit' }
      }
    } catch (error) {
      console.error('Error allocating extra profit:', error)
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Payouts methods
  async getPayouts(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payouts/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data || data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch payouts' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }

  // Expenses methods
  async getExpenses(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/expenses/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.data || data }
      } else {
        return { success: false, error: data.message || 'Failed to fetch expenses' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
    }
  }
}

export const apiService = new ApiService()
export type { LoginRequest, LoginResponse, RegisterInvestorRequest, ChartData, Broker, BrokerCommissionHistory, CreateBrokerRequest, BrokerPayout, BrokerDashboardData, ExtraProfitAllocationResponse, TransactionResponse }
