import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    '.next/**',
    '.next.bak/**',
    '.next_regen_*/**',
    'node_modules/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'test-results.bak/**',
    'out/**',
    'output/**',
    'supabase/.branches/**',
    'supabase/.temp/**',
    'supabase/snippets/**',
  ]),
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      // Tests use loose typing for mocks and fixtures; explicit any is acceptable there.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
])
