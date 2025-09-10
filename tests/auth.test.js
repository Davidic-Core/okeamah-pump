import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Authentication', () => {
  let dom
  let document
  let window

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="loginForm">
            <input type="email" name="email" required>
            <input type="password" name="password" required>
            <button type="submit">Login</button>
          </form>
          <form id="signupForm">
            <input type="text" name="firstName" required>
            <input type="text" name="lastName" required>
            <input type="email" name="email" required>
            <input type="password" name="password" required>
            <input type="password" name="confirmPassword" required>
            <input type="checkbox" name="terms" required>
            <button type="submit">Sign Up</button>
          </form>
        </body>
      </html>
    `)
    
    document = dom.window.document
    window = dom.window
    global.document = document
    global.window = window
  })

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailInput = document.querySelector('input[type="email"]')
      emailInput.value = 'invalid-email'
      
      const isValid = emailInput.checkValidity()
      expect(isValid).toBe(false)
    })

    it('should require password field', () => {
      const passwordInput = document.querySelector('input[type="password"]')
      passwordInput.value = ''
      
      const isValid = passwordInput.checkValidity()
      expect(isValid).toBe(false)
    })

    it('should validate required fields in signup form', () => {
      const form = document.getElementById('signupForm')
      const inputs = form.querySelectorAll('input[required]')
      
      inputs.forEach(input => {
        input.value = ''
        expect(input.checkValidity()).toBe(false)
      })
    })
  })

  describe('Password Strength', () => {
    it('should calculate password strength correctly', () => {
      // Mock password strength function
      function calculatePasswordStrength(password) {
        let strength = 0
        if (password.length >= 8) strength += 1
        if (password.match(/[a-z]/)) strength += 1
        if (password.match(/[A-Z]/)) strength += 1
        if (password.match(/[0-9]/)) strength += 1
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1
        return Math.min(strength, 4)
      }

      expect(calculatePasswordStrength('weak')).toBe(1)
      expect(calculatePasswordStrength('StrongPass123!')).toBe(4)
      expect(calculatePasswordStrength('Medium123')).toBe(3)
    })
  })
})