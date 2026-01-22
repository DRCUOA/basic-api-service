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
 * Validates that the database name contains 'test' and is safe to use
 * @param {string} dbName - Database name to validate
 * @throws {Error} If database name doesn't contain 'test' or contains invalid characters
 */
function validateTestDatabase(dbName) {
  if (!dbName || !dbName.toLowerCase().includes('test')) {
    throw new Error(
      `FATAL: Refusing to operate on non-test database. ` +
      `Database name must contain 'test'. Got: "${dbName}"`
    );
  }
  
  // Additional validation: ensure database name only contains safe characters
  // Allow alphanumeric, underscores, and hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(dbName)) {
    throw new Error(
      `FATAL: Invalid database name. Database name can only contain letters, numbers, underscores, and hyphens. Got: "${dbName}"`
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
  
  const passwordEnv = process.env.DB_PASSWORD;
  const password = passwordEnv === undefined || passwordEnv === '' ? null : passwordEnv;
  if (passwordEnv === undefined || passwordEnv === '') {
    console.warn('⚠ DB_PASSWORD environment variable is not set or is empty. Using password-less authentication.');
  }
  
  return {
    username: process.env.DB_USER || 'postgres',
    password: password,
    database: dbName,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
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
 * @param {boolean} forceCloseConnections - Whether to force close connections (default: true)
 */
export async function dropTestDatabase(dbName, forceCloseConnections = true) {
  validateTestDatabase(dbName);
  
  const systemSequelize = getSystemSequelize();
  
  try {
    if (forceCloseConnections) {
      // Terminate all other connections to the test database
      // NOTE: This unconditionally forces disconnection of other clients; ensure no tests are actively using the DB before calling
      try {
        await systemSequelize.query(
          `
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = :dbName
            AND pid <> pg_backend_pid()
        `,
          { replacements: { dbName } }
        );
        // Small delay to ensure connections are fully closed
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        // If we can't terminate connections, log but continue
        console.warn(`Warning: Could not terminate all connections: ${err.message}`);
      }
    }
    
    // Drop the database - use identifier quoting for safety
    // Note: PostgreSQL doesn't support parameterized database names, so we validate and quote
    const quotedDbName = systemSequelize.queryInterface.queryGenerator.quoteIdentifier(dbName);
    await systemSequelize.query(`DROP DATABASE IF EXISTS ${quotedDbName};`);
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
    const quotedDbName = systemSequelize.queryInterface.queryGenerator.quoteIdentifier(dbName);
    await systemSequelize.query(`CREATE DATABASE ${quotedDbName};`);
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
    const apiServerPath = path.resolve(__dirname, '../../../');
    const fs = await import('fs/promises');
    
    console.log(`✓ Running migrations on test database "${config.database}"...`);
    
    // Small delay to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate config.json dynamically from environment variables
    // Sequelize CLI requires JSON format for configuration
    const configJsonPath = path.resolve(apiServerPath, 'src/config/config.json');
    const configDir = path.dirname(configJsonPath);
    
    // Ensure directory exists and is actually a directory
    try {
      const stats = await fs.stat(configDir);
      if (!stats.isDirectory()) {
        throw new Error(`Expected "${configDir}" to be a directory, but found a non-directory file.`);
      }
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        await fs.mkdir(configDir, { recursive: true });
      } else {
        throw err;
      }
    }
    
    const passwordEnv = process.env.DB_PASSWORD;
    const configJson = {
      development: {
        username: process.env.DB_USER || 'postgres',
        password: passwordEnv === undefined || passwordEnv === '' ? null : passwordEnv,
        database: process.env.DB_NAME || 'basic_api_dev',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres'
      },
      test: {
        username: config.username,
        password: config.password,
        database: config.database,
        host: config.host,
        port: config.port,
        dialect: 'postgres'
      }
    };
    
    await fs.writeFile(configJsonPath, JSON.stringify(configJson, null, 2), 'utf8');
    
    // Store config path(s) for cleanup later
    if (!global.__configJsonPaths) {
      global.__configJsonPaths = new Set();
    }
    global.__configJsonPaths.add(configJsonPath);

    // Preserve original singleton reference for backward compatibility
    if (!global.__configJsonPath) {
      global.__configJsonPath = configJsonPath;
    }
    
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
 * Sets up the test database: Idempotently creates database and runs migrations
 * Checks if database and schema exist, creates database and runs migrations only if needed
 */
export async function setupTestDatabase() {
  const config = getTestDbConfig();
  const dbName = config.database;
  
  console.log('\n=== Test Database Setup ===');
  console.log(`Database: ${dbName}`);
  
  try {
    // Idempotent setup: never drop database if it exists (to avoid terminating active connections)
    // Instead, check if database exists and has schema, and only create/run migrations if needed
    
    const systemSequelize = getSystemSequelize();
    let dbExists = false;
    let schemaExists = false;
    
    try {
      // Check if database exists using parameterized query
      const [dbCheck] = await systemSequelize.query(
        `SELECT 1 FROM pg_database WHERE datname = :dbName`,
        { replacements: { dbName } }
      );
      dbExists = dbCheck.length > 0;
      
      if (dbExists) {
        // Database exists - check if it has the right schema
        const testSequelize = new Sequelize({
          username: config.username,
          password: config.password,
          database: dbName,
          host: config.host,
          port: config.port,
          dialect: config.dialect,
          logging: false
        });
        
        try {
          await testSequelize.authenticate();
          // Check if migrations table exists and verify expected application tables exist
          const [migrationsCheck] = await testSequelize.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'SequelizeMeta'
          `);
          
          if (migrationsCheck.length > 0) {
            // SequelizeMeta exists, now verify all migrations have been applied
            // This ensures migrations actually ran successfully and weren't just partially completed
            const [migrationsApplied] = await testSequelize.query(`
              SELECT COUNT(*) as count FROM "SequelizeMeta"
            `);
            
            // Count expected migration files
            const fs = await import('fs/promises');
            const migrationsDir = path.resolve(__dirname, '../../database/migrations');
            const migrationFiles = await fs.readdir(migrationsDir);
            const expectedMigrationCount = migrationFiles.filter(f => 
              f.endsWith('.js') || f.endsWith('.cjs')
            ).length;
            
            // Schema exists only if all expected migrations have been applied
            schemaExists = migrationsApplied[0].count >= expectedMigrationCount;
          }
          
          await testSequelize.close();
        } catch (err) {
          // Can't connect or check - assume schema doesn't exist
          await testSequelize.close().catch(() => {});
        }
      }
      
      await systemSequelize.close();
    } catch (err) {
      await systemSequelize.close().catch(() => {});
      console.error('Failed to verify test database existence or schema state:', err);
      throw err;
    }
    
    if (dbExists && schemaExists) {
      console.log(`✓ Database "${dbName}" already exists with schema - setup complete`);
      console.log('=== Test Database Setup Complete ===\n');
      return; // Database is ready, nothing to do
    }
    
    // Database doesn't exist or is missing schema
    if (!dbExists) {
      // Create database (only if it doesn't exist)
      await createTestDatabase(dbName);
    }
    
    // Run migrations (will skip if already run, or create schema if missing)
    await runMigrations();
    
    console.log('=== Test Database Setup Complete ===\n');
  } catch (error) {
    console.error('Failed to setup test database:', error.message);
    throw error;
  }
}

/**
 * Tears down the test database: logs teardown status and cleans up config file
 * Note: We don't drop the database or close connections here because:
 * 1. Tests may still be running in parallel
 * 2. The database is idempotent and persists across test runs
 * 3. Dropping while tests are active causes "terminating connection" errors
 * 4. Connections will be closed when the process exits
 */
export async function teardownTestDatabase() {
  console.log('\n=== Test Database Teardown ===');
  
  // Don't close any Sequelize connections here because:
  // - Tests may still be running and need the connection
  // - Closing the connection causes ECONNRESET errors in active tests
  // - The connection will be closed when the process exits
  console.log('✓ Sequelize connections will remain open (tests may still be running)');
  
  // Note: We intentionally don't drop the database here because:
  // - Tests may still be running in parallel
  // - The database is idempotent and persists across test runs
  // - Dropping while active causes connection termination errors
  console.log('✓ Database left intact (idempotent setup on next test run)');
  
  // Clean up the dynamically generated config.json file
  if (global.__configJsonPath) {
    try {
      const fs = await import('fs/promises');
      await fs.unlink(global.__configJsonPath);
      console.log('✓ Cleaned up config.json file');
      delete global.__configJsonPath;
    } catch (err) {
      // File might not exist or already deleted, which is fine
      if (err.code !== 'ENOENT') {
        console.warn('⚠ Could not delete config.json:', err.message);
      }
    }
  }
  
  console.log('=== Test Database Teardown Complete ===\n');
}
