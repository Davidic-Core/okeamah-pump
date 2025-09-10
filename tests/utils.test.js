import { describe, it, expect } from 'vitest'

describe('Utility Functions', () => {
  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      function formatDate(dateString) {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }

      expect(formatDate('2025-01-15')).toBe('January 15, 2025')
      expect(formatDate('2025-12-31')).toBe('December 31, 2025')
    })
  })

  describe('Return Calculations', () => {
    it('should calculate investment returns correctly', () => {
      function calculateReturns(amount, rate, months) {
        const monthlyRate = rate / 100 / 12
        const totalReturn = amount * Math.pow(1 + monthlyRate, months)
        return {
          totalReturn: totalReturn,
          profit: totalReturn - amount,
          monthlyReturn: (totalReturn - amount) / months
        }
      }

      const result = calculateReturns(10000, 12, 12)
      expect(result.totalReturn).toBeCloseTo(11268.25, 2)
      expect(result.profit).toBeCloseTo(1268.25, 2)
    })
  })

  describe('Certificate Number Generation', () => {
    it('should generate valid certificate numbers', () => {
      function generateCertificateNumber() {
        const year = new Date().getFullYear()
        const random = Math.floor(Math.random() * 999999 + 1).toString().padStart(6, '0')
        return `OKI-${year}-${random}`
      }

      const certNumber = generateCertificateNumber()
      expect(certNumber).toMatch(/^OKI-\d{4}-\d{6}$/)
      expect(certNumber).toContain('2025')
    })
  })

  describe('Input Sanitization', () => {
    it('should sanitize user input', () => {
      function sanitizeInput(input) {
        return input.trim().replace(/[<>]/g, '')
      }

      expect(sanitizeInput('  test  ')).toBe('test')
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })
  })
})