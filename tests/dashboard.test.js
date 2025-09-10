import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Dashboard', () => {
  let dom
  let document
  let window

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>$0</h3>
              <p>Total Portfolio Value</p>
            </div>
          </div>
          <canvas id="portfolioChart"></canvas>
          <table class="investments-table">
            <tbody></tbody>
          </table>
        </body>
      </html>
    `)
    
    document = dom.window.document
    window = dom.window
    global.document = document
    global.window = window
  })

  describe('Portfolio Stats', () => {
    it('should calculate portfolio stats correctly', () => {
      const mockInvestments = [
        { amount: 10000, status: 'active', expected_return: 12.5, term_months: 12 },
        { amount: 5000, status: 'active', expected_return: 8.7, term_months: 6 }
      ]

      function calculatePortfolioStats(investments) {
        const stats = {
          totalValue: 0,
          activeInvestments: 0
        }

        investments.forEach(investment => {
          if (investment.status === 'active') {
            stats.totalValue += parseFloat(investment.amount)
            stats.activeInvestments++
          }
        })

        return stats
      }

      const stats = calculatePortfolioStats(mockInvestments)
      expect(stats.totalValue).toBe(15000)
      expect(stats.activeInvestments).toBe(2)
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency correctly', () => {
      function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount)
      }

      expect(formatCurrency(1000)).toBe('$1,000.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })
  })

  describe('Investment Validation', () => {
    it('should validate investment amounts', () => {
      const packages = {
        'short-term': { minAmount: 1000, maxAmount: 100000 },
        'long-term': { minAmount: 5000, maxAmount: 500000 }
      }

      function validateInvestmentAmount(amount, packageType) {
        const pkg = packages[packageType]
        if (!pkg) throw new Error('Invalid package')
        if (amount < pkg.minAmount) throw new Error('Amount too low')
        if (amount > pkg.maxAmount) throw new Error('Amount too high')
        return true
      }

      expect(() => validateInvestmentAmount(500, 'short-term')).toThrow('Amount too low')
      expect(() => validateInvestmentAmount(150000, 'short-term')).toThrow('Amount too high')
      expect(validateInvestmentAmount(5000, 'short-term')).toBe(true)
    })
  })
})