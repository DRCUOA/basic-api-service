/**
 * Global Test Teardown
 * 
 * This file runs after all tests to tear down the test database.
 * It ensures proper cleanup of test resources.
 */

import { after } from 'node:test';
import { globalTeardown } from './globalHooks.js';

// Global test teardown - runs once after all tests in this file
after(async () => {
  await globalTeardown();
});
