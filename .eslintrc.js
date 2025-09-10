module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
    'no-console': ['warn'],
    'no-debugger': ['error'],
    'prefer-const': ['error'],
    'no-var': ['error'],
    'object-shorthand': ['error'],
    'prefer-arrow-callback': ['error'],
    'arrow-spacing': ['error'],
    'no-duplicate-imports': ['error']
  },
  globals: {
    'Chart': 'readonly',
    'AOS': 'readonly'
  }
}