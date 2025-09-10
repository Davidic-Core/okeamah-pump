// Investment page functionality
import { PaymentProcessor, investmentPackages, formatCurrency, calculateReturns, validateInvestmentAmount } from './payment.js'
import { auth } from './supabase.js'

class InvestmentPage {
  constructor() {
    this.selectedPackage = null
    this.paymentProcessor = new PaymentProcessor()
    this.currentAmount = 0
    this.init()
  }

  async init() {
    // Check authentication
    await this.checkAuth()
    
    // Initialize event listeners
    this.initializeEventListeners()
    
    // Check for URL parameters (e.g., pre-selected package)
    this.checkUrlParameters()
  }

  async checkAuth() {
    const { user } = await auth.getUser()
    if (!user) {
      window.location.href = 'login.html'
      return
    }
  }

  checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search)
    const packageType = urlParams.get('package')
    
    if (packageType && investmentPackages[packageType]) {
      this.selectPackage(packageType)
    }
  }

  initializeEventListeners() {
    // Package selection
    const packageCards = document.querySelectorAll('.package-card')
    packageCards.forEach(card => {
      card.addEventListener('click', () => {
        const packageType = card.dataset.package
        this.selectPackage(packageType)
      })
    })

    // Amount input
    const amountInput = document.getElementById('investmentAmount')
    amountInput.addEventListener('input', (e) => {
      this.updateAmount(parseFloat(e.target.value) || 0)
    })

    // Payment button
    const paymentButton = document.getElementById('paymentButton')
    paymentButton.addEventListener('click', () => {
      this.processPayment()
    })
  }

  selectPackage(packageType) {
    if (!investmentPackages[packageType]) return

    this.selectedPackage = packageType
    const packageData = investmentPackages[packageType]

    // Update UI
    document.querySelectorAll('.package-card').forEach(card => {
      card.classList.remove('selected')
    })
    document.querySelector(`[data-package="${packageType}"]`).classList.add('selected')

    // Show investment form
    const form = document.getElementById('investmentForm')
    form.classList.add('active')

    // Update preset amounts
    this.updatePresetAmounts(packageData)

    // Update summary
    this.updateSummary()

    // Initialize payment form
    this.initializePaymentForm()
  }

  updatePresetAmounts(packageData) {
    const presetsContainer = document.getElementById('amountPresets')
    const presets = [
      packageData.minAmount,
      Math.round(packageData.minAmount * 2),
      Math.round(packageData.minAmount * 5),
      Math.round(packageData.minAmount * 10)
    ].filter(amount => amount <= packageData.maxAmount)

    presetsContainer.innerHTML = presets.map(amount => 
      `<button type="button" class="preset-btn" data-amount="${amount}">
        ${formatCurrency(amount)}
      </button>`
    ).join('')

    // Add event listeners to preset buttons
    presetsContainer.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseFloat(btn.dataset.amount)
        document.getElementById('investmentAmount').value = amount
        this.updateAmount(amount)
      })
    })
  }

  updateAmount(amount) {
    this.currentAmount = amount
    this.updateSummary()
    this.validateForm()
  }

  updateSummary() {
    if (!this.selectedPackage) return

    const packageData = investmentPackages[this.selectedPackage]
    const amount = this.currentAmount

    // Update summary fields
    document.getElementById('summaryPackage').textContent = packageData.name
    document.getElementById('summaryAmount').textContent = formatCurrency(amount)
    document.getElementById('summaryReturn').textContent = `${packageData.expectedReturn}% Annual`
    document.getElementById('summaryTerm').textContent = `${packageData.termMonths} Months`

    // Calculate returns
    if (amount > 0) {
      const returns = calculateReturns(amount, packageData.expectedReturn, packageData.termMonths)
      document.getElementById('summaryMaturity').textContent = formatCurrency(returns.totalReturn)
    } else {
      document.getElementById('summaryMaturity').textContent = '$0'
    }
  }

  validateForm() {
    const paymentButton = document.getElementById('paymentButton')
    
    if (!this.selectedPackage || this.currentAmount <= 0) {
      paymentButton.disabled = true
      return false
    }

    try {
      validateInvestmentAmount(this.currentAmount, this.selectedPackage)
      paymentButton.disabled = false
      return true
    } catch (error) {
      paymentButton.disabled = true
      this.showNotification(error.message, 'error')
      return false
    }
  }

  async initializePaymentForm() {
    if (!this.selectedPackage) return

    const packageData = investmentPackages[this.selectedPackage]
    
    try {
      await this.paymentProcessor.createPaymentForm('payment-element', {
        amount: this.currentAmount || packageData.minAmount,
        investmentType: packageData.type,
        investmentName: packageData.name,
        termMonths: packageData.termMonths,
        expectedReturn: packageData.expectedReturn
      })
    } catch (error) {
      console.error('Error initializing payment form:', error)
      this.showNotification('Failed to initialize payment form', 'error')
    }
  }

  async processPayment() {
    if (!this.validateForm()) return

    const paymentButton = document.getElementById('paymentButton')
    const originalContent = paymentButton.innerHTML

    try {
      // Show loading state
      paymentButton.disabled = true
      paymentButton.innerHTML = '<div class="loading-spinner"></div> Processing Payment...'

      // Create new payment intent with current amount
      const packageData = investmentPackages[this.selectedPackage]
      await this.paymentProcessor.createPaymentForm('payment-element', {
        amount: this.currentAmount,
        investmentType: packageData.type,
        investmentName: packageData.name,
        termMonths: packageData.termMonths,
        expectedReturn: packageData.expectedReturn
      })

      // Process payment
      const result = await this.paymentProcessor.processPayment(
        `${window.location.origin}/dashboard.html?payment=success`
      )

      if (result.success) {
        this.showNotification('Investment successful! Redirecting to dashboard...', 'success')
        
        // Redirect to dashboard with success message
        setTimeout(() => {
          window.location.href = `dashboard.html?investment=${result.investmentId}&certificate=${result.certificateNumber}`
        }, 2000)
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      this.showNotification(error.message || 'Payment failed. Please try again.', 'error')
      
      // Reset button
      paymentButton.disabled = false
      paymentButton.innerHTML = originalContent
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `

    // Add to page
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add('show')
    }, 100)

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification)
    }, 5000)

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close')
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification)
    })
  }

  removeNotification(notification) {
    notification.classList.remove('show')
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }
}

// Initialize investment page
document.addEventListener('DOMContentLoaded', () => {
  new InvestmentPage()
})

// Add notification styles
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-left: 4px solid var(--primary-color);
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
  }
  
  .notification.show {
    transform: translateX(0);
  }
  
  .notification-success {
    border-left-color: #10B981;
  }
  
  .notification-error {
    border-left-color: #EF4444;
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
  }
  
  .notification-content i {
    color: #4F46E5;
  }
  
  .notification-success .notification-content i {
    color: #10B981;
  }
  
  .notification-error .notification-content i {
    color: #EF4444;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: #9CA3AF;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    transition: all 0.3s ease;
  }
  
  .notification-close:hover {
    background: #F3F4F6;
    color: #1F2937;
  }
`

// Inject notification styles
const styleSheet = document.createElement('style')
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)