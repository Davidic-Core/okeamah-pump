// Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Authentication helpers
export const auth = {
  async signUp(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/dashboard.html`
        }
      })
      
      if (error) throw error
      
      // Store user session locally for immediate access
      if (data.user) {
        const sessionData = {
          user: data.user,
          session: data.session,
          loginTime: new Date().toISOString(),
          ...userData
        }
        localStorage.setItem('userSession', JSON.stringify(sessionData))
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      // Store user session locally
      if (data.user && data.session) {
        const sessionData = {
          user: data.user,
          session: data.session,
          loginTime: new Date().toISOString(),
          firstName: data.user.user_metadata?.first_name || '',
          lastName: data.user.user_metadata?.last_name || '',
          phone: data.user.user_metadata?.phone || ''
        }
        localStorage.setItem('userSession', JSON.stringify(sessionData))
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      // Clear local storage
      localStorage.removeItem('userSession')
      localStorage.removeItem('rememberUser')
      
      return { error }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    }
  },

  async getUser() {
    try {
      // First check local storage
      const localSession = localStorage.getItem('userSession')
      if (localSession) {
        const sessionData = JSON.parse(localSession)
        
        // Check if session is still valid (24 hours)
        const loginTime = new Date(sessionData.loginTime)
        const now = new Date()
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)
        
        if (hoursSinceLogin < 24) {
          return { user: sessionData.user, error: null }
        }
      }
      
      // Fallback to Supabase
      const { data: { user }, error } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error('Get user error:', error)
      return { user: null, error }
    }
  },

  async getSession() {
    try {
      // Check local storage first
      const localSession = localStorage.getItem('userSession')
      if (localSession) {
        const sessionData = JSON.parse(localSession)
        return { session: sessionData.session, error: null }
      }
      
      // Fallback to Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error('Get session error:', error)
      return { session: null, error }
    }
  },

  // Check if user is authenticated
  async isAuthenticated() {
    const { user } = await this.getUser()
    return !!user
  }
}

// Investment helpers (mock implementation for now)
export const investments = {
  async getUserInvestments() {
    // Mock data for demonstration
    const mockInvestments = [
      {
        id: '1',
        investment_type: 'short-term',
        investment_name: 'Growth Fund A',
        amount: 25000,
        expected_return: 12.5,
        term_months: 8,
        status: 'active',
        created_at: '2025-01-15T00:00:00Z',
        maturity_date: '2025-09-15T00:00:00Z',
        certificate_number: 'OKI-2025-001234'
      },
      {
        id: '2',
        investment_type: 'long-term',
        investment_name: 'Wealth Builder Pro',
        amount: 50000,
        expected_return: 18.3,
        term_months: 24,
        status: 'active',
        created_at: '2024-12-01T00:00:00Z',
        maturity_date: '2026-12-01T00:00:00Z',
        certificate_number: 'OKI-2025-001235'
      }
    ]
    
    return { data: mockInvestments, error: null }
  },

  async getInvestmentById(id) {
    const { data: investments } = await this.getUserInvestments()
    const investment = investments.find(inv => inv.id === id)
    return { data: investment, error: investment ? null : new Error('Investment not found') }
  },

  async createInvestment(investmentData) {
    // Mock creation
    const newInvestment = {
      id: Date.now().toString(),
      ...investmentData,
      created_at: new Date().toISOString(),
      certificate_number: `OKI-${new Date().getFullYear()}-${Math.random().toString().substr(2, 6)}`
    }
    
    return { data: newInvestment, error: null }
  }
}

// Payment helpers (mock implementation)
export const payments = {
  async createPaymentIntent(paymentData) {
    // Mock payment intent creation
    return {
      clientSecret: 'pi_mock_client_secret',
      investmentId: Date.now().toString(),
      certificateNumber: `OKI-${new Date().getFullYear()}-${Math.random().toString().substr(2, 6)}`
    }
  },

  async confirmPayment(paymentIntentId) {
    // Mock payment confirmation
    return { success: true }
  }
}

// Real-time subscriptions (mock)
export const subscriptions = {
  subscribeToInvestments(callback) {
    return {
      unsubscribe: () => console.log('Unsubscribed from investments')
    }
  },

  subscribeToPayments(callback) {
    return {
      unsubscribe: () => console.log('Unsubscribed from payments')
    }
  }
}