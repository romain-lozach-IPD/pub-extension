import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import sveltePlugin from 'eslint-plugin-svelte'

export default [
  // Règles TypeScript sur les fichiers .ts
  {
    files: ['src/**/*.ts', 'background.ts'],
    plugins: { '@typescript-eslint': tsPlugin },
    languageOptions: { parser: tsParser },
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'function',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        }
      ]
    }
  },
  // Règles Svelte sur les fichiers .svelte
  ...sveltePlugin.configs['flat/recommended'],
  {
    files: ['src/**/*.svelte'],
    languageOptions: {
      parserOptions: { parser: tsParser }
    },
    rules: {
      // {#each} sans clé est un warning de perf, pas une erreur bloquante
      'svelte/require-each-key': 'warn',
      // {@html} est utilisé intentionnellement (highlight syntaxique, rendu OpenAPI)
      'svelte/no-at-html-tags': 'off'
    }
  },
  // Exclusions
  {
    ignores: ['dist/**', 'node_modules/**', 'src/test/**', 'scripts/**']
  }
]
