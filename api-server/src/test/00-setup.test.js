/**
 * Global Test Setup
 * 
 * This file runs before all tests to set up the test database.
 * It ensures a clean, isolated test environment.
 */

import { before } from 'node:test';
import { globalSetup } from './globalHooks.js';

// Global test setup - runs once before all tests in this file
before(async () => {
  await globalSetup();
});
