module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', '@typescript-eslint', 'react-hooks'],
  rules: {
    // Configuration
    '@typescript-eslint/no-unused-vars': [
      'warn',
      // process.env.ENV !== 'dev' ? 'error' : 'warn',
      {
        vars: 'all',
        args: 'none',
        ignoreRestSiblings: false
      }
    ]
  }
}