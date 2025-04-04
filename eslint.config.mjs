import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect the React version
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Disable React import requirement for JSX
      'react/no-unknown-property': 'error', // Enforce using `className` instead of `class`
      'react/no-unescaped-entities': 'warn', // Warn about unescaped entities in JSX
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], // Ignore constants
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    env: {
      browser: true,
      es2021: true,
      jest: true, // Add Jest environment for test files
    },
  },
];
