// Global API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      BROKER_LOGIN: '/api/auth/broker-login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout'
    },
    DASHBOARD: {
      SUMMARY: '/api/dashboard/summary',
      INVESTORS: '/api/investors/'
    },
    INVESTORS: {
      LIST: '/api/investors/',
      GET: '/api/investors/',
      UPDATE: '/api/investors/',
      DELETE: '/api/investors/'
    },
    TRANSACTIONS: {
      LIST: '/api/transactions/'
    },
    PAYOUTS: {
      LIST: '/api/payouts/',
      CREATE: '/api/payouts/',
      UNIFIED: '/api/add_payout'
    },
    EXPENSES: {
      LIST: '/api/expenses/',
      CREATE: '/api/expenses/',
      UPDATE: '/api/expenses/',
      DELETE: '/api/expenses/'
    },
    CHARTS: {
      DATA: '/api/charts/data'
    },
    BROKERS: {
      LIST: '/api/brokers/',
      GET: '/api/brokers/',
      CREATE: '/api/brokers/',
      UPDATE: '/api/brokers/',
      DELETE: '/api/brokers/',
      INVESTORS: '/api/brokers/',
      COMMISSION_HISTORY: '/api/brokers/',
      PAYOUT: '/api/brokers/',
      PAYOUTS: '/api/brokers/',
      DASHBOARD: '/api/dashboard/broker/'
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

// Helper function to get broker endpoints
export const getBrokerUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.BROKERS): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.BROKERS[endpoint])
}

// Helper function to get payout endpoints
export const getPayoutUrl = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.PAYOUTS): string => {
  return getApiUrl(API_CONFIG.ENDPOINTS.PAYOUTS[endpoint])
}

