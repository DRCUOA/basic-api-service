# Running Tests

## Prerequisites Checklist

Before running tests, verify these prerequisites are met:

### ✅ 1. Node.js and npm Installed

**Check:**
```bash
node --version   # Should show v18+ or v20+
npm --version    # Should show version number
```

**If missing:**
- **macOS**: Install via [Homebrew](https://brew.sh/): `brew install node`
- **Linux**: Install via package manager: `sudo apt install nodejs npm` (Ubuntu/Debian)
- **Windows**: Download from [nodejs.org](https://nodejs.org/)

### ✅ 2. Dependencies Installed

**Check:**
```bash
cd api-server
ls node_modules  # Should show many directories
```

**If missing:**
```bash
cd api-server
npm install
```

### ✅ 3. PostgreSQL Server Running

**Check:**
```bash
# Try connecting to PostgreSQL
psql -U postgres -c "SELECT version();"
# OR
pg_isready
```

**If PostgreSQL is not installed:**
- **macOS**: `brew install postgresql@14` then `brew services start postgresql@14`
- **Linux**: `sudo apt install postgresql postgresql-contrib` then `sudo systemctl start postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

**If PostgreSQL is installed but not running:**
- **macOS**: `brew services start postgresql@14`
- **Linux**: `sudo systemctl start postgresql`
- **Windows**: Start PostgreSQL service from Services panel

### ✅ 4. PostgreSQL Test User Created

**Check:**
```bash
psql -U postgres -c "\du test_user"
# Should show the user exists
```

**If missing, create the user:**
```bash
psql -U postgres
```

Then run in PostgreSQL:
```sql
CREATE USER test_user WITH PASSWORD 'your_secure_password' CREATEDB SUPERUSER;
\q
```

**Note:** Replace `your_secure_password` with a secure password you'll use in the `.env` file.

### ✅ 5. Environment Variables Configured

The test infrastructure supports two environment files:

1. **`.env.test`** (recommended for tests) - Test-specific configuration
2. **`.env`** - Fallback/default configuration

**How it works:**
- When `NODE_ENV=test`, the test loader loads `.env.test` first
- Then it loads `.env` as a fallback for any values not in `.env.test`
- Values in `.env.test` take precedence over `.env`

**Check if files exist:**
```bash
cd api-server
ls -la .env*  # Should show .env and/or .env.test
```
**If not:**  
See [How to set env vars for tests](../../documentation/50-testing/setup_testenv.md)


## Running Tests

Once all prerequisites are met:

### Run All Tests
```bash
cd api-server
npm test
```

### Run Tests in Watch Mode (auto-rerun on file changes)
```bash
cd api-server
npm run test:watch
```

### Run Specific Test Suites
```bash
npm run test:setup      # Verify test setup only
npm run test:database   # Run database layer tests only
npm run test:invariants # Run safety guard tests only
```

## Troubleshooting

### Error: "DB_NAME must be explicitly set"
**Solution:** Create `.env.test` or `.env` file with `DB_NAME=basic_api_test` (see Prerequisite #5)

### Error: "FATAL: Test environment MUST use a database with 'test' in the name"
**Solution:** Ensure `DB_NAME` in `.env.test` or `.env` contains "test" (e.g., `basic_api_test`)

### Error: "password authentication failed"
**Solution:** 
1. Verify PostgreSQL user exists: `psql -U postgres -c "\du test_user"`
2. Check password in `.env.test` (or `.env` if `.env.test` doesn't exist) matches the user's password
3. Reset password if needed: `ALTER USER test_user WITH PASSWORD 'new_password';`

### Error: "could not connect to server"
**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check `DB_HOST` and `DB_PORT` in `.env.test` or `.env` file
3. Start PostgreSQL if stopped (see Prerequisite #3)

### Environment Variable Resolution
**Question:** Which file is used when both `.env.test` and `.env` exist?
**Answer:** `.env.test` is loaded first and takes precedence. `.env` is used as a fallback for any variables not defined in `.env.test`.

### Error: "permission denied to create database"
**Solution:** Grant CREATEDB permission: `ALTER USER test_user CREATEDB;`

---

## Environment Variable Loading

When tests run with `NODE_ENV=test`, the test infrastructure automatically:

1. **Loads `.env.test`** (if it exists) - Test-specific configuration
2. **Loads `.env`** (as fallback) - Default configuration for any values not in `.env.test`
3. **Resolves conflicts** - Values in `.env.test` take precedence

This happens automatically via `src/tests/_support/testEnvLoader.js`, which is imported at the start of the first test file (`00-database.config.test.js`).

**Best Practice:** Use `.env.test` for test-specific values and `.env` for shared defaults.

---

# Test Execution Flow

## Critical: Three Distinct Phases

**These phases must NOT leak into each other:**

1. **Node Module Evaluation (Imports)**
   - Happens immediately when test files are loaded
   - No hooks have run yet
   - No DB setup has occurred
   - ✅ Safe: Import modules, define guards, create Sequelize instances (not connected)
   - ❌ Unsafe: Call `sequelize.authenticate()`, query database, access schema

2. **Test Setup Lifecycle**
   - `before()` hooks execute
   - Test database is created
   - Migrations are run
   - Schema is established
   - ✅ Safe: Setup operations, create/drop database, run migrations

3. **Test Execution**
   - Test cases (`it()`) execute
   - Application code may safely connect to database
   - Schema may be verified
   - Database queries are safe
   - ✅ Safe: All database operations, queries, connections

**Why this matters:** Importing `database.js` triggers guard checks and creates a Sequelize instance, but the database doesn't exist until Phase 2. Attempting to connect or query in Phase 1 will fail.

## Visual Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Execution Starts                    │
│                  (NODE_ENV=test set)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   00-invariants/               │
         │   (Safety & Setup)             │
         ├────────────────────────────────┤
         │ • Validate environment         │
         │ • Validate DB name contains    │
         │   "test" (safety guard)        │
         │ • Drop existing test DB        │
         │ • Create fresh test DB         │
         │ • Run migrations (create       │
         │   schema: tables, etc.)        │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   10-database/                 │
         │   (Database Layer Tests)       │
         ├────────────────────────────────┤
         │ • Verify connection            │
         │ • Verify schema exists         │
         │ • Test database operations     │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   20-domain/                   │
         │   (Business Logic Tests)       │
         ├────────────────────────────────┤
         │ • Test domain services         │
         │ • Test business rules          │
         │ • No HTTP layer                │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   30-api/                      │
         │   (API/Controller Tests)       │
         ├────────────────────────────────┤
         │ • Test controllers             │
         │ • Test request/response        │
         │ • Uses real test database      │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   40-integration/              │
         │   (End-to-End Tests)           │
         ├────────────────────────────────┤
         │ • Full stack tests             │
         │ • Request → Response flow      │
         │ • Complete system validation   │
         └───────────────┬────────────────┘
                         │
                         ▼
         ┌────────────────────────────────┐
         │   zz-teardown/                 │
         │   (Cleanup)                    │
         ├────────────────────────────────┤
         │ • Close database connections   │
         │ • Drop test database           │
         │ • Clean up resources           │
         └───────────────┬────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Test Execution Complete                    │
└─────────────────────────────────────────────────────────────┘
```

## Text Version

NODE_ENV=test
↓
00-invariants/
  → validate env
  → validate DB name
  → drop + create test DB
  → run migrations
↓
10-database/
  → verify connection, schema
↓
20-domain/
  → test business logic (no HTTP)
↓
30-api/
  → test controllers (mock or real DB)
↓
40-integration/
  → full stack request → response
↓
zz-teardown/
  → close connections
  → drop test DB
