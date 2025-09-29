// Global API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout'
    },
    DASHBOARD: {
      SUMMARY: '/api/dashboard/summary',
      INVESTORS: '/api/dashboard/investors'
    },
    CHARTS: {
      DATA: '/api/charts/data'
    },
    EXPENSES: {
      LIST: '/api/expenses/',
      CREATE: '/api/expenses/',
      UPDATE: '/api/expenses/',
      DELETE: '/api/expenses/'
    },
    HEALTH: '/api/health/'
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get auth endpoints
export const getAuthUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.AUTH): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.AUTH[endpoint])
}

// Helper function to get dashboard endpoints
export const getDashboardUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.DASHBOARD): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.DASHBOARD[endpoint])
}

// Helper function to get chart endpoints
export const getChartUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.CHARTS): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.CHARTS[endpoint])
}

// Helper function to get expenses endpoints
export const getExpensesUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.EXPENSES): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.EXPENSES[endpoint])
}

