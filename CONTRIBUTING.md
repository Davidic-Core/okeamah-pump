# Contributing to Okamah-Pump

Thank you for your interest in contributing to Okamah-Pump! This document provides guidelines for contributing to the project.

## Development Workflow

### 1. Fork and Clone
```bash
git clone https://github.com/yourusername/okamah-pump.git
cd okamah-pump
npm install
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint
```

### 4. Testing Requirements
- All new features must include tests
- Maintain minimum 80% code coverage
- Tests must pass before submitting PR

### 5. Code Quality
- Follow ESLint configuration
- Use meaningful commit messages
- Write clear, documented code

### 6. Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address feedback promptly

## Commit Message Format
```
type(scope): description

Examples:
feat(auth): add password strength validation
fix(dashboard): resolve chart rendering issue
docs(readme): update installation instructions
test(utils): add currency formatting tests
```

## Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- No semicolons
- Prefer const over let
- Use arrow functions where appropriate

## Testing Guidelines
- Write unit tests for utility functions
- Write integration tests for user flows
- Mock external dependencies
- Test error conditions
- Use descriptive test names

## Security Guidelines
- Never commit sensitive data
- Validate all user inputs
- Use HTTPS for all external requests
- Follow OWASP security practices

## Questions?
Open an issue or contact the maintainers.