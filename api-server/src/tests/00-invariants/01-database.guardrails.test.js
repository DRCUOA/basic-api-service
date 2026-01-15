/**
 * DATABASE GUARD REJECTION TEST
 *
 * Purpose:
 * --------
 * This test exists to enforce a hard safety invariant:
 * when NODE_ENV === 'test', the application must refuse to load
 * if the configured database name does NOT clearly indicate a test database.
 *
 * Why this test is structured this way:
 * -----------------------------------
 * - The database module performs guard checks at import time.
 * - Importing it directly in the test runner would poison the process
 *   (environment variables, module cache, and side effects).
 * - To keep the test runner clean and deterministic, this test spawns
 *   a separate Node process and attempts to import the module there.
 *
 * What this test is asserting:
 * ----------------------------
 * - A non-test DB_NAME in test mode must cause a hard failure.
 * - Any successful import is considered a test failure.
 *
 * What this test is NOT doing:
 * ----------------------------
 * - It does not assert on error messages or logs.
 * - It does not verify positive (allowed) configurations.
 * - It does not perform database I/O.
 *
 * This test should fail loudly if guard logic is weakened or removed.
 * If this test ever becomes flaky, treat that as a safety regression.
 */


import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';

describe('Database Guard Rejection', () => {
  it('rejects a non-test database name in test mode', () => {
    const projectRoot = process.cwd();

    const testCode = `
      process.env.NODE_ENV = 'test';
      process.env.DB_NAME = 'production_database';
      process.env.DB_PASSWORD = 'irrelevant';
      process.env.DB_USER = 'irrelevant';

      await import('./src/data/database.js');
    `;

    let failedAsExpected = false;

    try {
      execSync(
        `node --input-type=module -e "${testCode.replace(/\n/g, ' ')}"`,
        {
          cwd: projectRoot,
          stdio: 'pipe'
        }
      );
    } catch (error) {
      // Guard should force a hard failure
      failedAsExpected = true;
    }

    assert.ok(
      failedAsExpected,
      'Expected database guard to reject non-test DB_NAME'
    );
  });
});
