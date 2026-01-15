// src/data/database.js
// Runtime configuration for Sequelize (application DB only)

import { Sequelize } from "sequelize";
import logger from "../utils/logger.js";

/**
 * HARD GUARD: Prevent tests from running against non-test databases
 * Tests MUST use a database with 'test' in its name
 */
if (process.env.NODE_ENV === "test") {
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error(
      "DB_NAME must be explicitly set in test environment"
    );
  }

  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(
      `FATAL: Test environment MUST use a database with 'test' in the name. ` +
      `Current DB_NAME: "${dbName}". This guard prevents accidental use of dev/prod databases.`
    );
  }
}

/**
 * HARD INVARIANTS: No implicit database identity
 */
if (!process.env.DB_NAME) {
  throw new Error("DB_NAME must be explicitly set");
}

if (!process.env.DB_USER) {
  throw new Error("DB_USER must be explicitly set");
}

/**
 * Sequelize runtime instance (NOT for admin / test DB creation)
 * Admin DB access must use a separate Sequelize instance
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: (msg) => logger.info(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * HARD BLOCK: prevent schema mutation at runtime
 * All schema changes MUST be performed via migrations
 */
sequelize.sync = () => {
  throw new Error(
    "sequelize.sync() is forbidden. Use migrations via sequelize-cli."
  );
};

/**
 * Verify database connectivity
 */
export async function testConnection() {
  await sequelize.authenticate();
  logger.info("Database connection established successfully.");
  return sequelize;
}

/**
 * Verify required schema exists (migration safety check)
 */
export async function verifySchema() {
  const [results] = await sequelize.query(
    `
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'tasks'
    `
  );

  if (results[0].count === "0") {
    throw new Error('Required table "tasks" does not exist');
  }
}

/**
 * Export ONLY what the application needs
 */
export function getSequelize() {
  return sequelize;
}
