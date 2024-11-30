
import reactConfig from 'eslint-config-vshift/configs/react.mjs';


export default [
  ...reactConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
        log: 'off',
      },
    },
    rules: {
      'react/jsx-uses-react': 'warn',
    },
  },
  {
    files: [
      '**/*.jsx',
    ],
  },
  {
    ignores: [
      'pnpm-lock.yaml',
      'dist',
      'pub',
    ],
  },
];

