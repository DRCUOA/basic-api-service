/**
 * GLOBAL TEST SETUP
 *
 * Purpose:
 * --------
 * This file runs before all tests to set up the test database configuration
 * and ensure a clean, isolated test environment. It executes in the
 * 00-invariants directory to ensure it runs first (alphabetically before
 * all other tests).
 *
 * Why this test is structured this way:
 * -----------------------------------
 * - Uses Node.js test runner's `before` hook to run once before all tests.
 * - Placed in 00-invariants directory to guarantee execution order.
 * - Delegates actual setup logic to globalHooks.js for reusability.
 * - No test cases are needed; the hook itself is the setup mechanism.
 *
 * What this test is asserting:
 * ----------------------------
 * - The setup process completes without errors.
 * - Test database is created and configured correctly.
 * - Migrations are applied successfully.
 * - Database is ready for test execution.
 *
 * What this test is NOT doing:
 * ----------------------------
 * - It does not verify the database configuration details (that's for
 *   00-database.connection.test.js).
 * - It does not test individual setup operations in isolation.
 * - It does not assert on specific setup outcomes (that's handled by
 *   the globalSetup implementation).
 *
 * This file establishes the test environment foundation.
 * If setup fails, all subsequent tests will fail or behave unpredictably.
 */

import { before } from 'node:test';
import { globalSetup } from '../_support/globalHooks.js';

// Global test setup - runs once before all tests in this file
before(async () => {
  await globalSetup();
});
