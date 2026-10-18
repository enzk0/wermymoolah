import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['**/dist/', '**/node_modules/'] },

  js.configs.recommended,

  {
    files: ['server/**/*.js', '*.js', 'client/vite.config.js'],
    languageOptions: { globals: globals.node },
  },

  {
    files: ['client/src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },

  {
    files: ['client/src/**/*.{js,jsx}'],
    ...reactHooks.configs.flat.recommended,
  },
];
