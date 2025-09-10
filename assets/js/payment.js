// Payment processing with Stripe
import { loadStripe } from '@stripe/stripe-js'
import { payments, auth } from './supabase.js'

// Initialize Stripe (you'll need to add your publishable key to .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...')

class PaymentProcessor {
  constructor() {
    this.stripe = null
    this.elements = null
    this.paymentElement = null
    this.currentPaymentIntent = null
    this.init()
  }

  async init() {
    this.stripe = await stripePromise
  }

  async createPaymentForm(containerId, paymentData) {
    if (!this.stripe) {
      throw new Error('Stripe not initialized')
    }

    try {
      // Create payment intent
      const { clientSecret, investmentId, certificateNumber } = await payments.createPaymentIntent(paymentData)
      
      this.currentPaymentIntent = {
        clientSecret,
        investmentId,
        certificateNumber,
        amount: paymentData.amount
      }

      // Create Elements instance
      this.elements = this.stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#4F46E5',
            colorBackground: '#ffffff',
            colorText: '#1F2937',
            colorDanger: '#EF4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px'
          }
        }
      })

      // Create payment element
      this.paymentElement = this.elements.create('payment')
      this.paymentElement.mount(`#${containerId}`)

      return {
        investmentId,
        certificateNumber,
        amount: paymentData.amount
      }
    } catch (error) {
      console.error('Error creating payment form:', error)
      throw error
    }
  }

  async processPayment(returnUrl) {
    if (!this.stripe || !this.elements || !this.currentPaymentIntent) {
      throw new Error('Payment form not initialized')
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: returnUrl
        },
        redirect: 'if_required'
      })

      if (error) {
        throw new Error(error.message)
      }

      // Confirm payment on backend
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await payments.confirmPayment(paymentIntent.id)
        return {
          success: true,
          paymentIntent,
          investmentId: this.currentPaymentIntent.investmentId,
          certificateNumber: this.currentPaymentIntent.certificateNumber
        }
      }

      return { success: false, error: 'Payment not completed' }
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  getPaymentStatus() {
    return this.currentPaymentIntent
  }

  destroy() {
    if (this.paymentElement) {
      this.paymentElement.destroy()
    }
    this.elements = null
    this.paymentElement = null
    this.currentPaymentIntent = null
  }
}

// Investment packages configuration
export const investmentPackages = {
  'short-term-growth': {
    name: 'Growth Fund A',
    type: 'short-term',
    minAmount: 1000,
    maxAmount: 100000,
    expectedReturn: 12.5,
    termMonths: 8,
    description: 'High-yield short-term investment with flexible terms'
  },
  'long-term-wealth': {
    name: 'Wealth Builder Pro',
    type: 'long-term',
    minAmount: 5000,
    maxAmount: 500000,
    expectedReturn: 18.3,
    termMonths: 24,
    description: 'Long-term wealth building with compound growth'
  },
  'secure-income': {
    name: 'Secure Income',
    type: 'short-term',
    minAmount: 500,
    maxAmount: 50000,
    expectedReturn: 8.7,
    termMonths: 6,
    description: 'Conservative investment with guaranteed returns'
  }
}

// Utility functions
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function calculateReturns(amount, rate, months) {
  const monthlyRate = rate / 100 / 12
  const totalReturn = amount * Math.pow(1 + monthlyRate, months)
  return {
    totalReturn: totalReturn,
    profit: totalReturn - amount,
    monthlyReturn: (totalReturn - amount) / months
  }
}

export function validateInvestmentAmount(amount, packageType) {
  const pkg = investmentPackages[packageType]
  if (!pkg) {
    throw new Error('Invalid investment package')
  }
  
  if (amount < pkg.minAmount) {
    throw new Error(`Minimum investment amount is ${formatCurrency(pkg.minAmount)}`)
  }
  
  if (amount > pkg.maxAmount) {
    throw new Error(`Maximum investment amount is ${formatCurrency(pkg.maxAmount)}`)
  }
  
  return true
}

// Export payment processor
export { PaymentProcessor }

// Global payment processor instance
window.paymentProcessor = new PaymentProcessor()