/**
 * Test Environment Loader
 * 
 * This module loads environment variables from .env.test when NODE_ENV=test.
 * It must be imported BEFORE any other modules that use dotenv/config.
 * 
 * Load order:
 * 1. Load .env.test if NODE_ENV=test (test-specific overrides)
 * 2. Load .env (fallback/default values)
 * 
 * This ensures test-specific values take precedence while still allowing
 * fallback to .env for values not specified in .env.test
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the api-server root directory (two levels up from this file)
const apiServerRoot = resolve(__dirname, '../../..');

// Track status of environment loading so tests can verify behavior
const testEnvLoadStatus = {
  nodeEnv: process.env.NODE_ENV,
  testEnvPath: null,
  defaultEnvPath: null,
  testEnvExists: false,
  defaultEnvExists: false,
  loadedFrom: null, // '.env.test+fallback' | '.env.test' | '.env' | 'none' | null (not run)
};

if (process.env.NODE_ENV === 'test') {
  const testEnvPath = resolve(apiServerRoot, '.env.test');
  const defaultEnvPath = resolve(apiServerRoot, '.env');

  const testEnvExists = existsSync(testEnvPath);
  const defaultEnvExists = existsSync(defaultEnvPath);

  testEnvLoadStatus.testEnvPath = testEnvPath;
  testEnvLoadStatus.defaultEnvPath = defaultEnvPath;
  testEnvLoadStatus.testEnvExists = testEnvExists;
  testEnvLoadStatus.defaultEnvExists = defaultEnvExists;

  if (testEnvExists) {
    // Load .env.test first (test-specific overrides)
    config({ path: testEnvPath });

    // Then load .env as fallback (for any values not in .env.test)
    if (defaultEnvExists) {
      config({ path: defaultEnvPath, override: false });
      testEnvLoadStatus.loadedFrom = '.env.test+fallback';
      console.log(`✓ Loaded test environment: .env.test (with .env fallback)`);
    } else {
      testEnvLoadStatus.loadedFrom = '.env.test';
      console.log(`✓ Loaded test environment from .env.test`);
    }
  } else if (defaultEnvExists) {
    // Fallback to .env if .env.test doesn't exist
    config({ path: defaultEnvPath });
    testEnvLoadStatus.loadedFrom = '.env';
    console.log(`✓ Loaded test environment from .env (no .env.test found)`);
  } else {
    testEnvLoadStatus.loadedFrom = 'none';
    console.warn(`⚠ Warning: Neither .env.test nor .env found. Using system environment variables.`);
  }
}

/**
 * Returns information about how the test environment variables were loaded.
 * This allows tests to assert that the loader behaved as expected.
 */
export function getTestEnvLoadStatus() {
  return testEnvLoadStatus;
}

// Also export the status object directly for convenience.
export { testEnvLoadStatus };
