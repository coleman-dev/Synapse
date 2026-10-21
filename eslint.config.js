const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { ignores: ['.tools/**', '.expo/**', 'dist/**', 'test-results/**', 'playwright-report/**'] },
]);
