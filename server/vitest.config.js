import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'server',
    include: ['test/**/*.test.js'],
    globalSetup: ['test/globalSetup.js'],
    setupFiles: ['test/setup.js'],
    // Every file shares one database, so run them one at a time.
    fileParallelism: false,
  },
});
