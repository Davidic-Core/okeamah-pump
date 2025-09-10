import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.config.js',
        '**/*.config.ts'
      ]
    },
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/', 'dist/']
  }
})