/**
 * GLOBAL TEST TEARDOWN
 *
 * Purpose:
 * --------
 * This file runs after all tests to tear down the test database and
 * ensure proper cleanup of test resources. It executes in the zz-teardown
 * directory to ensure it runs last (alphabetically after all other tests).
 *
 * Why this test is structured this way:
 * -----------------------------------
 * - Uses Node.js test runner's `after` hook to run once after all tests.
 * - Placed in zz-teardown directory to guarantee execution order.
 * - Delegates actual teardown logic to globalHooks.js for reusability.
 * - No test cases are needed; the hook itself is the test mechanism.
 *
 * What this test is asserting:
 * ----------------------------
 * - The teardown process completes without errors.
 * - Test database resources are properly cleaned up.
 * - No lingering connections or resources remain after test execution.
 *
 * What this test is NOT doing:
 * ----------------------------
 * - It does not verify the state of the database before teardown.
 * - It does not test individual cleanup operations in isolation.
 * - It does not assert on specific cleanup outcomes (that's handled by
 *   the globalTeardown implementation).
 *
 * This file ensures test isolation by cleaning up after each test run.
 * If teardown fails, subsequent test runs may encounter state pollution.
 */

import { after } from 'node:test';
import { globalTeardown } from '../_support/globalHooks.js';


// Global test teardown - runs once after all tests in this file
after(async () => {
  await globalTeardown();
});
