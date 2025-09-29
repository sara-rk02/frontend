// API service for communicating with the Flask backend

import { getApiUrl, getAuthUrl, getDashboardUrl, getChartUrl } from '@/config/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
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
}

interface ChartData {
  labels: string[]
  roi_values: number[]
  profit_values: number[]
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
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

      const data = await response.json()

      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' }
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
    try {
      await fetch(getAuthUrl('LOGOUT'), {
        method: 'POST',
        headers: this.getAuthHeaders(),
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

export const apiService = new ApiService()
export type { LoginRequest, LoginResponse, RegisterInvestorRequest, ChartData }
