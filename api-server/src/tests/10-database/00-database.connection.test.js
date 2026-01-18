/**
 * DATABASE CONNECTION AND LIFECYCLE TESTS
 *
 * Purpose:
 * --------
 * These tests validate that the database guard prevents accidental use of
 * non-test databases and that the test database lifecycle works correctly.
 * They ensure the test environment is properly isolated and configured.
 *
 * Why this test is structured this way:
 * -----------------------------------
 * - These tests run after the global setup (00-database.config.test.js)
 *   has initialized the test database.
 * - They verify both configuration correctness and runtime behavior.
 * - They check that migrations have been applied and the database is
 *   in the expected initial state.
 *
 * What this test is asserting:
 * ----------------------------
 * - The database name contains "test" (guard validation).
 * - The database configuration matches test environment requirements.
 * - Authentication with the test database succeeds.
 * - Required tables (tasks, SequelizeMeta) exist from migrations.
 * - The create-tasks migration has been recorded.
 * - The tasks table starts empty (clean state).
 * - The sync() method is forbidden (prevents accidental schema changes).
 *
 * What this test is NOT doing:
 * ----------------------------
 * - It does not test database operations on tasks (that's for other test suites).
 * - It does not verify migration rollback or complex migration scenarios.
 * - It does not test database connection pooling or performance.
 *
 * This test suite establishes the foundation for all other database tests.
 * If these tests fail, the test environment is not properly configured.
 */

// CRITICAL: Load test environment variables FIRST, before any other imports
// This ensures .env.test is loaded when NODE_ENV=test
import '../_support/testEnvLoader.js';

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { getSequelize } from '../../data/database.js';
import { getTestDbConfig } from '../_support/testDbSetup.js';


describe('Database Guard and Test Lifecycle', () => {
  let sequelize;
  
  before(() => {
    // Database should already be set up by 00-setup.test.js
    sequelize = getSequelize();
  });
  
  it('should connect to a database with "test" in the name', async () => {
    const config = sequelize.config;
    const dbName = config.database;
    
    assert.ok(
      dbName.toLowerCase().includes('test'),
      `Database name must contain "test", got: ${dbName}`
    );
  });
  
  it('should have the correct test database configuration', async () => {
    const config = getTestDbConfig();
    
    assert.ok(config.database, 'Database name must be defined');
    assert.ok(
      config.database.toLowerCase().includes('test'),
      'Database name must contain "test"'
    );
    assert.strictEqual(config.dialect, 'postgres', 'Dialect must be postgres');
  });
  
  it('should successfully authenticate with the test database', async () => {
    await assert.doesNotReject(
      async () => {
        await sequelize.authenticate();
      },
      'Should be able to authenticate with test database'
    );
  });
  
  it('should have the tasks table created by migrations', async () => {
    try {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'tasks'
      `);
      
      assert.strictEqual(results.length, 1, 'Tasks table should exist');
      assert.strictEqual(results[0].table_name, 'tasks');
    } catch (error) {
      // Log detailed error for debugging
      console.error('Error querying tasks table:', error.message);
      console.error('Error details:', {
        name: error.name,
        parent: error.parent?.message,
        original: error.original?.message,
        sql: error.sql
      });
      throw error;
    }
  });
  
  it('should have SequelizeMeta table (migrations tracking)', async () => {
    try {
      const [results] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'SequelizeMeta'
      `);
      
      assert.strictEqual(results.length, 1, 'SequelizeMeta table should exist');
    } catch (error) {
      console.error('Error querying SequelizeMeta table:', error.message);
      console.error('Error details:', {
        name: error.name,
        parent: error.parent?.message,
        original: error.original?.message
      });
      throw error;
    }
  });
  
  it('should have run the create-tasks migration', async () => {
    try {
      const [results] = await sequelize.query(`
        SELECT name 
        FROM "SequelizeMeta"
        WHERE name LIKE '%create-tasks%'
      `);
      
      assert.strictEqual(results.length, 1, 'create-tasks migration should be recorded');
    } catch (error) {
      console.error('Error querying SequelizeMeta for migration:', error.message);
      console.error('Error details:', {
        name: error.name,
        parent: error.parent?.message,
        original: error.original?.message
      });
      throw error;
    }
  });
  
  it('should start with an empty tasks table', async () => {
    try {
      const [results] = await sequelize.query(`
        SELECT COUNT(*) as count FROM tasks
      `);
      
      assert.strictEqual(
        parseInt(results[0].count), 
        0, 
        'Tasks table should be empty at test start'
      );
    } catch (error) {
      console.error('Error querying tasks count:', error.message);
      console.error('Error details:', {
        name: error.name,
        parent: error.parent?.message,
        original: error.original?.message
      });
      throw error;
    }
  });
  
  it('should prevent sync() from being called', async () => {
    assert.throws(
      () => {
        sequelize.sync();
      },
      /forbidden/i,
      'sync() should throw an error containing "forbidden"'
    );
  });
});
