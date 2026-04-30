import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    // Recursive globs so nested node_modules under git worktrees (e.g.
    // `.claude/worktrees/agent-*/node_modules`) don't pollute the suite with
    // upstream package tests. The bare `'node_modules'` we had before only
    // matched the top-level directory.
    exclude: [
      '**/node_modules/**',
      '**/.next/**',
      '**/.claude/**',
      '**/dist/**',
    ],
    coverage: {
      include: ['app/**', 'components/**', 'lib/**', 'utils/**'],
      exclude: ['**/*.test.*', 'node_modules'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
