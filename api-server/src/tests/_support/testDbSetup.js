/**
 * Test Database Setup and Teardown Utilities
 * 
 * This module provides utilities for managing the test database lifecycle:
 * - Creating/dropping test databases
 * - Running migrations
 * - Managing Sequelize connections
 * 
 * CRITICAL: All operations validate that we're working with a TEST database only.
 */

import { Sequelize } from 'sequelize';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Validates that the database name contains 'test'
 * @param {string} dbName - Database name to validate
 * @throws {Error} If database name doesn't contain 'test'
 */
function validateTestDatabase(dbName) {
  if (!dbName || !dbName.toLowerCase().includes('test')) {
    throw new Error(
      `FATAL: Refusing to operate on non-test database. ` +
      `Database name must contain 'test'. Got: "${dbName}"`
    );
  }
}

/**
 * Get test database configuration
 * @returns {object} Test database configuration
 */
export function getTestDbConfig() {
  const dbName = process.env.DB_NAME || 'basic_api_test';
  validateTestDatabase(dbName);
  
  return {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'testpassword123',
    database: dbName,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres'
  };
}

/**
 * Create a Sequelize instance for the postgres system database
 * Used for creating/dropping test databases
 * @returns {Sequelize} Sequelize instance connected to postgres database
 */
function getSystemSequelize() {
  const config = getTestDbConfig();
  return new Sequelize({
    username: config.username,
    password: config.password,
    database: 'postgres', // Connect to system database
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false
  });
}

/**
 * Drops the test database if it exists
 * @param {string} dbName - Name of database to drop
 */
export async function dropTestDatabase(dbName) {
  validateTestDatabase(dbName);
  
  const systemSequelize = getSystemSequelize();
  
  try {
    // Terminate all connections to the database
    await systemSequelize.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
    `);
    
    // Drop the database
    await systemSequelize.query(`DROP DATABASE IF EXISTS "${dbName}";`);
    console.log(`✓ Test database "${dbName}" dropped successfully`);
  } catch (error) {
    console.error(`Error dropping test database "${dbName}":`, error.message);
    throw error;
  } finally {
    await systemSequelize.close();
  }
}

/**
 * Creates the test database
 * @param {string} dbName - Name of database to create
 */
export async function createTestDatabase(dbName) {
  validateTestDatabase(dbName);
  
  const systemSequelize = getSystemSequelize();
  
  try {
    await systemSequelize.query(`CREATE DATABASE "${dbName}";`);
    console.log(`✓ Test database "${dbName}" created successfully`);
  } catch (error) {
    // Ignore error if database already exists
    if (error.message.includes('already exists')) {
      console.log(`✓ Test database "${dbName}" already exists`);
    } else {
      console.error(`Error creating test database "${dbName}":`, error.message);
      throw error;
    }
  } finally {
    await systemSequelize.close();
  }
}

/**
 * Runs migrations on the test database
 */
export async function runMigrations() {
  const config = getTestDbConfig();
  validateTestDatabase(config.database);
  
  try {
    const apiServerPath = path.resolve(__dirname, '../../');
    console.log(`✓ Running migrations on test database "${config.database}"...`);
    
    // Small delay to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    execSync('npx sequelize-cli db:migrate', {
      cwd: apiServerPath,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DB_NAME: config.database,
        DB_USER: config.username,
        DB_PASSWORD: config.password
      },
      stdio: 'inherit'
    });
    
    console.log(`✓ Migrations completed successfully`);
  } catch (error) {
    console.error('Error running migrations:', error.message);
    throw error;
  }
}

/**
 * Sets up the test database: drops if exists, creates, and runs migrations
 */
export async function setupTestDatabase() {
  const config = getTestDbConfig();
  const dbName = config.database;
  
  console.log('\n=== Test Database Setup ===');
  console.log(`Database: ${dbName}`);
  
  try {
    // Drop existing database for clean slate
    await dropTestDatabase(dbName);
    
    // Create fresh database
    await createTestDatabase(dbName);
    
    // Run migrations to set up schema
    await runMigrations();
    
    console.log('=== Test Database Setup Complete ===\n');
  } catch (error) {
    console.error('Failed to setup test database:', error.message);
    throw error;
  }
}

/**
 * Tears down the test database: closes connections and drops database
 * @param {Sequelize} sequelize - Sequelize instance to close (optional)
 */
export async function teardownTestDatabase(sequelize = null) {
  const config = getTestDbConfig();
  const dbName = config.database;
  
  console.log('\n=== Test Database Teardown ===');
  
  try {
    // Close Sequelize connection if provided
    if (sequelize) {
      await sequelize.close();
      console.log('✓ Sequelize connection closed');
    }
    
    // Drop the test database
    await dropTestDatabase(dbName);
    
    console.log('=== Test Database Teardown Complete ===\n');
  } catch (error) {
    console.error('Failed to teardown test database:', error.message);
    throw error;
  }
}
