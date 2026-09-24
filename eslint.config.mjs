import { defineConfig } from 'eslint/config';
import config from '@flumens/eslint-config';

export default defineConfig([
  {
    files: ['**/*'],
    ignores: ['src/@types/resources.d.ts'],
    extends: [config('./src/common/translations/interface/en.json')],
    rules: {
      '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
      'no-param-reassign': 0,
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'PascalCase'],
          filter: {
            // exclude special properties and any with non-identifier characters
            regex: '^(Authorization|Content-Type|__html|@.+|\\d+|.*\\W.*)$',
            match: false,
          },
        },
        {
          selector: 'typeProperty',
          format: ['camelCase', 'PascalCase'],
          filter: {
            // exclude special properties and any with non-identifier characters
            regex: '^(Authorization|Content-Type|__html|@.+|\\d+|.*\\W.*)$',
            match: false,
          },
        },
      ],
    },
  },
]);
