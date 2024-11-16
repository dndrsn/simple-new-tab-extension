
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const flatCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});


export default [
  ...flatCompat.extends('vshift/configs/react'),
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

