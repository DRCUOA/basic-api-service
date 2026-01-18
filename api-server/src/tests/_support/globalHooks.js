/**
 * Global Test Hooks Module
 * 
 * This module sets up global test hooks for database lifecycle management.
 * It exports hooks that will be registered by test files.
 */

// CRITICAL: Load test environment variables FIRST, before any other imports
// This ensures .env.test is loaded when NODE_ENV=test
import './testEnvLoader.js';

import { setupTestDatabase, teardownTestDatabase } from './testDbSetup.js';
import { getSequelize } from '../../data/database.js';

let setupComplete = false;
let teardownComplete = false;
let setupInProgress = false;

/**
 * Global setup function - call this before any tests run
 */
export async function globalSetup() {
  // Prevent concurrent setup calls
  if (setupInProgress) {
    // Wait for setup to complete
    while (setupInProgress) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return;
  }
  
  if (!setupComplete) {
    setupInProgress = true;
    console.log('\n🔧 Global Test Setup: Initializing test database...\n');
    
    try {
      await setupTestDatabase();
      setupComplete = true;
      console.log('✓ Test database initialized and ready\n');
    } catch (error) {
      console.error('❌ Failed to initialize test database:', error);
      throw error;
    } finally {
      setupInProgress = false;
    }
  }
}

/**
 * Global teardown function - call this after all tests complete
 */
export async function globalTeardown() {
  if (!teardownComplete) {
    console.log('\n🔧 Global Test Teardown: Cleaning up...\n');
    
    try {
      const sequelize = getSequelize();
      await teardownTestDatabase(sequelize);
      teardownComplete = true;
      console.log('✓ Test environment cleaned up\n');
    } catch (error) {
      console.error('❌ Failed to cleanup test environment:', error);
      throw error;
    }
  }
}
