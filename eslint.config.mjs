import { defineConfig } from 'eslint/config';
import config from '@flumens/eslint-config';

export default defineConfig([
  {
    files: ['**/*'],
    extends: [config],
  },
]);
