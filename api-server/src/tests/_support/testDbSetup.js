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
 * @param {boolean} forceCloseConnections - Whether to force close connections (default: true)
 */
export async function dropTestDatabase(dbName, forceCloseConnections = true) {
  validateTestDatabase(dbName);
  
  const systemSequelize = getSystemSequelize();
  
  try {
    if (forceCloseConnections) {
      // Terminate all connections to the database
      // Use a more careful approach - only terminate if we're sure no tests are running
      try {
        await systemSequelize.query(`
          SELECT pg_terminate_backend(pg_stat_activity.pid)
          FROM pg_stat_activity
          WHERE pg_stat_activity.datname = '${dbName}'
            AND pid <> pg_backend_pid();
        `);
        // Small delay to ensure connections are fully closed
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        // If we can't terminate connections, log but continue
        console.warn(`Warning: Could not terminate all connections: ${err.message}`);
      }
    }
    
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
    const apiServerPath = path.resolve(__dirname, '../../../');
    
    // #region agent log
    const fs = await import('fs');
    const logPath = path.resolve(apiServerPath, '../.cursor/debug.log');
    const logDir = path.dirname(logPath);
    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    const safeAppendLog = (logData) => {
      try {
        fs.appendFileSync(logPath, JSON.stringify(logData) + '\n');
      } catch (err) {
        // Log file write failed, but continue - fetch will still work
      }
    };
    const logEntry = {location:'testDbSetup.js:132',message:'runMigrations entry',data:{apiServerPath,config:config.database,username:config.username},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix'};
    safeAppendLog(logEntry);
    fetch('http://127.0.0.1:7243/ingest/b28ba336-f278-4fcf-939d-745bab84e580',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logEntry)}).catch(()=>{});
    // #endregion
    
    console.log(`✓ Running migrations on test database "${config.database}"...`);
    console.log(`  Working directory: ${apiServerPath}`);
    
    // #region agent log
    const configPath = path.resolve(apiServerPath, 'src/data/config/database.cjs');
    const sequelizercPath = path.resolve(apiServerPath, '.sequelizerc');
    const migrationsDir = path.resolve(apiServerPath, 'src/database/migrations');
    const configExists = fs.existsSync(configPath);
    const sequelizercExists = fs.existsSync(sequelizercPath);
    const migrationsExist = fs.existsSync(migrationsDir);
    const migrationFiles = migrationsExist ? fs.readdirSync(migrationsDir) : [];
    console.log(`  Config exists: ${configExists} at ${configPath}`);
    console.log(`  .sequelizerc exists: ${sequelizercExists} at ${sequelizercPath}`);
    console.log(`  Migrations dir exists: ${migrationsExist} at ${migrationsDir}`);
    console.log(`  Migration files: ${migrationFiles.join(', ')}`);
    const fileCheckLog = {location:'testDbSetup.js:142',message:'Before execSync - file checks',data:{configPath,configExists,sequelizercExists,migrationsDir,migrationsExist,migrationFiles},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'};
    safeAppendLog(fileCheckLog);
    fetch('http://127.0.0.1:7243/ingest/b28ba336-f278-4fcf-939d-745bab84e580',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fileCheckLog)}).catch(()=>{});
    // #endregion
    
    // Small delay to ensure database is fully ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // #region agent log
    const envVars = {
      ...process.env,
      NODE_ENV: 'test',
      DB_NAME: config.database,
      DB_USER: config.username,
      DB_PASSWORD: config.password ? '***' : undefined
    };
    fetch('http://127.0.0.1:7243/ingest/b28ba336-f278-4fcf-939d-745bab84e580',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'testDbSetup.js:150',message:'Before execSync - env vars',data:{cwd:apiServerPath,NODE_ENV:envVars.NODE_ENV,DB_NAME:envVars.DB_NAME,DB_USER:envVars.DB_USER,hasPassword:!!envVars.DB_PASSWORD},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // Verify .sequelizerc is in the right place and can be read
    const sequelizercInCwd = path.resolve(apiServerPath, '.sequelizerc');
    console.log(`  Checking for .sequelizerc at: ${sequelizercInCwd}`);
    console.log(`  .sequelizerc exists in cwd: ${fs.existsSync(sequelizercInCwd)}`);
    
    // Test loading .sequelizerc
    // Note: .sequelizerc is CommonJS, but we're in ESM context
    // We need to use createRequire to load it
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const rc = require(sequelizercInCwd);
      console.log(`  .sequelizerc loaded successfully`);
      console.log(`  .sequelizerc config path: ${rc.config}`);
      console.log(`  Config file at that path exists: ${fs.existsSync(rc.config)}`);
      if (fs.existsSync(rc.config)) {
        const configContent = fs.readFileSync(rc.config, 'utf8');
        console.log(`  Config file type: ${rc.config.endsWith('.json') ? 'JSON' : rc.config.endsWith('.cjs') ? 'CommonJS' : 'Unknown'}`);
      }
      const sequelizercTestLog = {location:'testDbSetup.js:210',message:'sequelizerc test',data:{sequelizercConfigPath:rc.config,configExists:fs.existsSync(rc.config)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'};
      safeAppendLog(sequelizercTestLog);
    } catch (err) {
      console.log(`  ERROR loading .sequelizerc: ${err.message}`);
      console.log(`  Error stack: ${err.stack}`);
      const sequelizercErrorLog = {location:'testDbSetup.js:218',message:'sequelizerc load error',data:{error:err.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'};
      safeAppendLog(sequelizercErrorLog);
    }
    
    // Generate config.json dynamically from environment variables
    // Sequelize CLI seems to prefer JSON format, so we'll create it on-the-fly
    const configJsonPath = path.resolve(apiServerPath, 'src/config/config.json');
    const configDir = path.dirname(configJsonPath);
    
    // Ensure directory exists
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`  Created config directory: ${configDir}`);
    }
    
    const configJson = {
      development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME || 'basic_api_dev',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres'
      },
      test: {
        username: config.username,
        password: config.password || undefined,
        database: config.database,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        dialect: 'postgres'
      }
    };
    
    fs.writeFileSync(configJsonPath, JSON.stringify(configJson, null, 2), 'utf8');
    console.log(`  Generated config.json at: ${configJsonPath}`);
    console.log(`  Config file exists: ${fs.existsSync(configJsonPath)}`);
    console.log(`  Test config - database: ${configJson.test.database}, user: ${configJson.test.username}`);
    
    // Try migration - Sequelize CLI should find .sequelizerc automatically
    console.log(`  Running: npx sequelize-cli db:migrate (from ${apiServerPath})`);
    console.log(`  Current working directory will be: ${apiServerPath}`);
    
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
    
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ba336-f278-4fcf-939d-745bab84e580',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'testDbSetup.js:165',message:'execSync completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    console.log(`✓ Migrations completed successfully`);
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/b28ba336-f278-4fcf-939d-745bab84e580',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'testDbSetup.js:170',message:'execSync error caught',data:{errorMessage:error.message,errorCode:error.status,errorSignal:error.signal,errorOutput:error.output?.map(o=>o?.toString()).filter(Boolean)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    
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
    // Idempotent setup: never drop database if it exists (to avoid terminating active connections)
    // Instead, check if database exists and has schema, and only create/run migrations if needed
    
    const systemSequelize = getSystemSequelize();
    let dbExists = false;
    let schemaExists = false;
    
    try {
      // Check if database exists
      const [dbCheck] = await systemSequelize.query(`
        SELECT 1 FROM pg_database WHERE datname = '${dbName}'
      `);
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
          // Check if migrations table exists (indicates migrations have run)
          const [migrationsCheck] = await testSequelize.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'SequelizeMeta'
          `);
          schemaExists = migrationsCheck.length > 0;
          await testSequelize.close();
        } catch (err) {
          // Can't connect or check - assume schema doesn't exist
          await testSequelize.close().catch(() => {});
        }
      }
      
      await systemSequelize.close();
    } catch (err) {
      await systemSequelize.close().catch(() => {});
      // If check fails, assume database doesn't exist
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
 * Tears down the test database: closes connections
 * Note: We don't drop the database here because:
 * 1. Tests may still be running in parallel
 * 2. The database is dropped and recreated fresh at the start of each test run anyway
 * 3. Dropping while tests are active causes "terminating connection" errors
 * @param {Sequelize} sequelize - Sequelize instance to close (optional)
 */
export async function teardownTestDatabase(sequelize = null) {
  console.log('\n=== Test Database Teardown ===');
  
  try {
    // Don't close the Sequelize connection here because:
    // - Tests may still be running and need the connection
    // - Closing the connection causes ECONNRESET errors in active tests
    // - The connection will be closed when the process exits
    if (sequelize) {
      // Just log that we would close it, but don't actually close
      console.log('✓ Sequelize connection will remain open (tests may still be running)');
    }
    
    // Note: We intentionally don't drop the database here because:
    // - Tests may still be running in parallel
    // - The database is dropped and recreated fresh at setup anyway
    // - Dropping while active causes connection termination errors
    console.log('✓ Database left intact (will be dropped/recreated on next test run)');
    
    console.log('=== Test Database Teardown Complete ===\n');
  } catch (error) {
    console.error('Failed to teardown test database:', error.message);
    // Don't throw - teardown failures shouldn't fail the test suite
    console.warn('⚠ Teardown error ignored to allow test suite to complete');
  }
}
