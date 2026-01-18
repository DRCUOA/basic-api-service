# Test Strategy and Implementation

## Overview

This document outlines the testing strategy and how it maintains consistency and scalability as the codebase grows.

## Core Principles

### 0. Three Distinct Execution Phases

*Note: This section intentionally uses zero-based numbering to model the execution lifecycle starting at phase 0 during module evaluation.*
**Critical: These phases must NOT leak into each other:**

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

**Why this matters:** Importing `database.js` triggers guard checks and creates a Sequelize instance, but the database doesn't exist until Phase 2. Attempting to connect or query in Phase 1 will fail. The guard test (`01-database.guardrails.test.js`) specifically avoids importing `database.js` directly to prevent "poisoning" the test process.

### 1. Layered Test Organization

Tests are organized by architectural layer using numeric prefixes to enforce execution order:

```
00-invariants/     # Safety guards and global setup
10-database/       # Database layer tests
20-domain/         # Business logic tests
30-api/            # API/controller tests
40-integration/    # End-to-end integration tests
zz-teardown/       # Global cleanup
```

**Why this scales:**
- Clear separation of concerns makes it easy to locate tests
- Execution order is guaranteed without complex configuration
- New layers can be added without disrupting existing tests
- Developers know exactly where to add new tests

### 2. Safety-First Approach

**Hard Guards in Production Code**

The application code itself enforces test safety:

```javascript
// database.js enforces test database naming
if (process.env.NODE_ENV === "test") {
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error("FATAL: Test environment MUST use a database with 'test' in the name");
  }
}

// Prevents accidental schema changes
sequelize.sync = () => {
  throw new Error("sequelize.sync() is forbidden. Use migrations via sequelize-cli.");
};
```

**Why this scales:**
- Prevents accidents at the source, not just in tests
- Guards cannot be bypassed or forgotten
- New developers are protected automatically
- Production code becomes self-documenting about constraints

### 3. Centralized Lifecycle Management

**Global Setup/Teardown Pattern**

All test lifecycle is managed through reusable hooks:

- `_support/globalHooks.js` - Orchestrates setup/teardown
- `_support/testDbSetup.js` - Database lifecycle utilities
- Setup runs once before all tests (00-invariants)
- Teardown runs once after all tests (zz-teardown)

**Why this scales:**
- Single source of truth for test infrastructure
- Changes to setup/teardown logic happen in one place
- Consistent test environment across all test suites
- Easy to add new lifecycle steps (e.g., seed data, cache warming)

### 4. Migration-Based Schema Management

**No Runtime Schema Changes**

- Schema changes only through migrations (`sequelize-cli`)
- `sequelize.sync()` is explicitly forbidden
- Test database schema matches production exactly
- Migrations run automatically during test setup

**Important Distinction:**

- **Must Pre-Exist**: PostgreSQL server, user with permissions, connection credentials
- **Created Automatically**: The test database itself (`basic_api_test`) and all schema (tables)
- **Each Test Run**: Drops existing test database → Creates fresh database → Runs migrations → Executes tests → Drops database

**Why this scales:**
- Schema changes are versioned and reviewable
- Test database always reflects production structure
- No drift between test and production schemas
- New migrations automatically apply to tests
- No manual database or schema setup required

### 5. Test Isolation Through Fresh Database

**Each Test Run Gets a Clean Slate**

1. Drop existing test database
2. Create fresh database
3. Run all migrations
4. Execute tests
5. Drop database on completion

**Why this scales:**
- No test pollution between runs
- Tests can run in parallel safely
- No manual cleanup required
- Deterministic test results

### 6. Self-Documenting Tests

**Every Test File Documents:**

- **Purpose**: What the test validates
- **Why this structure**: Architectural decisions
- **What it asserts**: Specific behaviors tested
- **What it doesn't do**: Clear boundaries

**Why this scales:**
- New team members understand tests quickly
- Prevents test duplication and overlap
- Makes test maintenance easier
- Documents architectural decisions

## Scalability Mechanisms

### Adding New Test Suites

**Pattern for New Layer Tests:**

1. Create directory: `src/tests/XX-newlayer/`
2. Use numeric prefix for execution order
3. Import shared utilities from `_support/`
4. Follow existing test documentation pattern
5. Tests automatically inherit global setup/teardown

**Example:**
```javascript
// src/tests/25-cache/cache.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
// Database already set up by 00-invariants
// Can use getSequelize() from database.js
```

### Adding New Safety Guards

**Pattern for New Guards:**

1. Add guard logic to production code (not test code)
2. Create invariant test in `00-invariants/` to verify guard
3. Guard prevents accidents; test ensures guard works

**Example:**
```javascript
// Production code guard
if (process.env.NODE_ENV === "test" && someCondition) {
  throw new Error("Safety violation");
}

// Test verifies guard
// 00-invariants/02-some-guard.test.js
```

### Extending Test Infrastructure

**Adding New Support Utilities:**

1. Add to `_support/` directory
2. Export reusable functions
3. Import in test files as needed
4. Document purpose and usage

**Why this scales:**
- Shared utilities reduce duplication
- Consistent patterns across test suites
- Easy to extend without breaking existing tests

## Consistency Enforcement

### 1. Execution Order Guarantees

- Numeric prefixes ensure deterministic execution
- No configuration files needed
- Alphabetical ordering is predictable
- Easy to reason about test dependencies

### 2. Standardized Test Structure

**Every test file follows this pattern:**

```javascript
/**
 * [Purpose section]
 * [Why structured this way]
 * [What it asserts]
 * [What it doesn't do]
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
// ... imports

describe('Test Suite', () => {
  // Tests
});
```

### 3. Environment Configuration

- Single `.env` file for all test configuration
- Environment variables validated at startup
- No magic values or hardcoded configs
- Consistent across all test suites

### 4. Database Configuration

- Single source: `src/data/config/database.js`
- Test configuration inherits from base config
- Guards ensure test database naming
- Consistent connection pooling

## Maintaining Consistency as Code Grows

### Adding New Features

**When adding a new feature:**

1. **Database changes**: Create migration → automatically tested
2. **Domain logic**: Add tests to `20-domain/` → inherits setup
3. **API endpoints**: Add tests to `30-api/` → inherits setup
4. **Integration**: Add tests to `40-integration/` → inherits setup

**No special setup required** - infrastructure handles it.

### Adding New Layers

**When adding a new architectural layer:**

1. Create `XX-newlayer/` directory
2. Add tests following existing patterns
3. Use shared utilities from `_support/`
4. Document following standard format

**Infrastructure scales automatically.**

### Team Growth

**As team grows:**

- New developers follow existing patterns
- Safety guards prevent common mistakes
- Documentation in tests explains decisions
- Shared utilities reduce learning curve
- Consistent structure makes code review easier

## Test Execution

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:setup    # Verify setup only
npm run test:database # Run database layer only
```

### Test Execution Flow

1. **00-invariants**: Safety checks and global setup
2. **10-database**: Database layer validation
3. **20-domain**: Business logic tests
4. **30-api**: API/controller tests
5. **40-integration**: End-to-end tests
6. **zz-teardown**: Cleanup

**Each layer builds on previous layers** - failures cascade appropriately.

## Key Benefits

### For Development

- **Fast feedback**: Tests run quickly with isolated database
- **Safe refactoring**: Guards prevent accidents
- **Clear structure**: Easy to find and add tests
- **Consistent patterns**: Predictable test organization

### For Scaling

- **No infrastructure changes**: Adding tests doesn't require setup changes
- **Parallel execution**: Isolated tests can run in parallel
- **Maintainable**: Centralized lifecycle management
- **Self-documenting**: Tests explain themselves

### For Team

- **Onboarding**: Clear patterns and documentation
- **Code review**: Consistent structure aids review
- **Collaboration**: Shared understanding of test organization
- **Confidence**: Safety guards prevent production accidents

## Conclusion

This test strategy maintains consistency through:

1. **Structural patterns** (layered organization)
2. **Safety guards** (hard-coded protections)
3. **Centralized infrastructure** (shared utilities)
4. **Self-documentation** (tests explain themselves)
5. **Migration-based schema** (versioned, consistent)

As the codebase grows, these mechanisms ensure tests remain:
- **Consistent** in structure and execution
- **Safe** from common mistakes
- **Maintainable** through centralized management
- **Scalable** without infrastructure changes
