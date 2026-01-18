# Test Database Infrastructure Setup Guide

## Overview

This document provides instructions for setting up the PostgreSQL test database infrastructure required for the test suite. The test infrastructure automatically creates, migrates, and tears down test databases, but requires proper PostgreSQL server configuration and user permissions.

## What You Must Set Up vs. What Gets Created Automatically

### ✅ Must Be Set Up (Infrastructure)

**These are the ONLY things the database engineer needs to configure:**

1. **PostgreSQL Server** - Installed, running, and accessible
2. **PostgreSQL User** - Created with proper permissions (`CREATEDB`, ability to connect to `postgres` system database)
3. **Environment Variables** - Configured in `.env` file (connection credentials)

### ❌ Created Automatically (Do NOT Set Up Manually)

**The test infrastructure handles these automatically - do NOT create them manually:**

1. **Test Database** (`basic_api_test`) - Created and dropped automatically on each test run
2. **Database Schema** (tables) - Created via migrations automatically on each test run
3. **Test Data** - Tests manage their own data

**Why this matters:** Creating the test database or schema manually is unnecessary and can cause conflicts. The test infrastructure ensures a clean, fresh database for each test run.

## PostgreSQL Server Requirements

### 1. PostgreSQL Installation
- **Version**: PostgreSQL 9.6 or higher (recommended: PostgreSQL 12+)
- **Server**: Must be accessible from the test execution environment
- **Default Port**: 5432 (configurable via `DB_PORT` environment variable)

### 2. System Database Access
The test infrastructure requires access to the PostgreSQL **system database** (`postgres`) to perform administrative operations:
- Creating test databases
- Dropping test databases
- Terminating active connections

## Database User Setup

### Required User Permissions

Create a PostgreSQL user with the following permissions:

```sql
-- Create the test user (if it doesn't exist)
CREATE USER test_user WITH PASSWORD 'your_secure_password';

-- Grant necessary permissions
-- 1. Ability to create databases
ALTER USER test_user CREATEDB;

-- 2. Ability to connect to the postgres system database
GRANT CONNECT ON DATABASE postgres TO test_user;

-- 3. Ability to terminate connections (required for clean database drops)
-- Note: This requires superuser privileges or specific function grants
-- Option A: Grant superuser (simplest, but less secure)
ALTER USER test_user WITH SUPERUSER;

-- Option B: Grant specific permissions (more secure, PostgreSQL 9.6+)
-- Grant ability to terminate backend processes
GRANT pg_signal_backend TO test_user;
-- Grant ability to query pg_stat_activity
GRANT pg_monitor TO test_user;
```

### Recommended Approach

For test environments, granting `CREATEDB` and `SUPERUSER` privileges is acceptable:

```sql
CREATE USER test_user WITH PASSWORD 'your_secure_password' CREATEDB SUPERUSER;
```

**Security Note**: This user should ONLY be used for test environments, never for production.

## Database Naming Convention

### Critical Requirement: Database Name Must Contain "test"

The test infrastructure includes a **hard safety guard** that prevents tests from running against non-test databases. The database name **MUST** contain the word "test" (case-insensitive).

**Valid examples:**
- `basic_api_test`
- `test_basic_api`
- `basic_api_testing`
- `my_test_db`

**Invalid examples:**
- `basic_api_dev` ❌
- `basic_api_prod` ❌
- `basic_api` ❌

### Default Database Name

The test infrastructure defaults to: `basic_api_test`

This can be overridden via the `DB_NAME` environment variable, but it must still contain "test".

## Connection Configuration

### Environment Variables

The test infrastructure uses the following environment variables (set in `api-server/.env`):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_NAME` | **Yes** | `basic_api_test` | Database name (must contain "test") |
| `DB_USER` | **Yes** | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | No | `testpassword123` | PostgreSQL password |
| `DB_HOST` | No | `localhost` | PostgreSQL server hostname |
| `DB_PORT` | No | `5432` | PostgreSQL server port |

### Example `.env` Configuration

```bash
DB_NAME=basic_api_test
DB_USER=test_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
```

## Test Database Lifecycle

### Automatic Management

The test infrastructure **automatically manages** the test database lifecycle:

1. **Setup Phase** (before tests run):
   - Connects to `postgres` system database
   - Terminates any existing connections to the test database
   - Drops the test database if it exists
   - Creates a fresh test database
   - Runs migrations to create schema (creates `tasks` table and `SequelizeMeta` table)
   - Verifies database is ready

2. **Test Execution Phase**:
   - Tests run against the clean test database
   - Each test run starts with an empty database

3. **Teardown Phase** (after tests complete):
   - Closes all database connections
   - Drops the test database
   - Cleans up resources

### What You DON'T Need to Do

**Do NOT perform these actions - they are handled automatically:**

- ❌ **DO NOT** manually create the test database (tests create it automatically)
- ❌ **DO NOT** manually run migrations (tests run them automatically)
- ❌ **DO NOT** manually drop the database (tests clean it up automatically)
- ❌ **DO NOT** create any tables manually (migrations handle schema)
- ❌ **DO NOT** seed test data manually (tests manage their own data)

**The test infrastructure creates a fresh database and schema on every test run.** Any manual setup will be overwritten and can cause conflicts.

## Schema Requirements

### Tables Created by Migrations

The test infrastructure expects the following tables to be created via migrations:

1. **`tasks` table**:
   - `id` (INTEGER, PRIMARY KEY, AUTO_INCREMENT)
   - `title` (STRING(255), NOT NULL)
   - `description` (TEXT, nullable)
   - `completed` (BOOLEAN, default: false)
   - `createdAt` (DATE, NOT NULL)
   - `updatedAt` (DATE, NOT NULL)

2. **`SequelizeMeta` table**:
   - Created automatically by Sequelize CLI
   - Tracks which migrations have been applied
   - Required for migration management

### Migration Location

Migrations are located in: `api-server/src/database/migrations/`

The test infrastructure automatically runs migrations during setup.

## Verification Steps

### 1. Verify PostgreSQL Server is Running

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"
```

### 2. Verify User Permissions

```bash
# Connect as the test user
psql -U test_user -d postgres

# Verify CREATEDB privilege
\du test_user

# Test creating a database
CREATE DATABASE test_permissions_check;
DROP DATABASE test_permissions_check;
```

### 3. Verify Connection from Test Environment

```bash
# From the api-server directory
psql -h localhost -p 5432 -U test_user -d postgres -c "SELECT 1;"
```

### 4. Run Test Setup Verification

```bash
cd api-server
npm run test:setup
```

This will verify:
- Database connection works
- User has permissions to create/drop databases
- Migrations can run successfully
- Database name contains "test"

## Troubleshooting

### Common Issues

#### 1. "FATAL: Refusing to operate on non-test database"
**Cause**: Database name doesn't contain "test"  
**Solution**: Ensure `DB_NAME` environment variable contains "test" (e.g., `basic_api_test`)

#### 2. "permission denied to create database"
**Cause**: User lacks `CREATEDB` privilege  
**Solution**: Grant `CREATEDB` to the test user:
```sql
ALTER USER test_user CREATEDB;
```

#### 3. "database already exists" or connection termination errors
**Cause**: Previous test run didn't clean up properly  
**Solution**: The test infrastructure handles this automatically, but you can manually clean up:
```sql
-- Connect to postgres database
psql -U test_user -d postgres

-- Terminate connections
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'basic_api_test'
  AND pid <> pg_backend_pid();

-- Drop database
DROP DATABASE IF EXISTS basic_api_test;
```

#### 4. "password authentication failed"
**Cause**: Incorrect password or user doesn't exist  
**Solution**: Verify user exists and password matches `.env` file:
```sql
-- Check if user exists
\du test_user

-- Reset password if needed
ALTER USER test_user WITH PASSWORD 'new_password';
```

#### 5. "could not connect to server"
**Cause**: PostgreSQL server not running or wrong host/port  
**Solution**: 
- Verify PostgreSQL is running: `pg_isready`
- Check `DB_HOST` and `DB_PORT` in `.env` file
- Verify firewall rules allow connections

## Security Considerations

### Test Environment Only

⚠️ **IMPORTANT**: The test user should have elevated permissions (`CREATEDB`, `SUPERUSER`) **ONLY** in test environments. Never use this configuration in production.

### Production vs Test Separation

- Use different users for production and test environments
- Use different database names (production: `basic_api`, test: `basic_api_test`)
- Use different passwords
- Consider network isolation between test and production databases

## Summary Checklist

**Infrastructure Setup (Required):**
- [ ] PostgreSQL server installed and running
- [ ] Test user created with `CREATEDB` privilege
- [ ] Test user can connect to `postgres` system database
- [ ] Test user can create and drop databases
- [ ] `.env` file configured with correct credentials
- [ ] `DB_NAME` contains "test" (e.g., `basic_api_test`)
- [ ] Connection verified from test environment

**Verification (Automatic):**
- [ ] Test setup verification passes (`npm run test:setup`)

**Note:** The test database and schema will be created automatically during test execution. Do NOT create them manually.

## Additional Resources

- Migration files: `api-server/src/database/migrations/`
- Test setup code: `api-server/src/tests/_support/testDbSetup.js`
- Database configuration: `api-server/src/data/config/database.js`
- Test guard logic: `api-server/src/data/database.js`
