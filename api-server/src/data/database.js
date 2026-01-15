// runtime configuration for Sequelize
import { Sequelize } from "sequelize";
import logger from "../utils/logger.js";

/**
 * HARD GUARD: Prevent tests from running against non-test databases
 * Tests MUST use a database with 'test' in its name
 */
if (process.env.NODE_ENV === 'test') {
  const dbName = process.env.DB_NAME || 'basic_api_test';
  if (!dbName.toLowerCase().includes('test')) {
    throw new Error(
      `FATAL: Test environment MUST use a database with 'test' in the name. ` +
      `Current DB_NAME: "${dbName}". This guard prevents accidental use of dev/prod databases.`
    );
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME || (process.env.NODE_ENV === 'test' ? 'basic_api_test' : undefined),
  process.env.DB_USER || (process.env.NODE_ENV === 'test' ? 'postgres' : undefined),
  process.env.DB_PASSWORD || (process.env.NODE_ENV === 'test' ? 'testpassword123' : undefined),
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
 * HARD BLOCK: prevent schema mutation at runtime (per GH issue 5)
 */
sequelize.sync = () => {
  throw new Error(
    "sequelize.sync() is forbidden. Use migrations via sequelize-cli."
  );
};


/* Commented out per GH issue 5: Explicitly requested to avoid any conditionals on throwing this error
// Environment-based hard rule for extra safety
if (process.env.NODE_ENV === "production") 
  {sequelize.sync = () => 
    throw new Error("sync() forbidden in production");
  };
}
*/


export async function testConnection() {
  await sequelize.authenticate();
  logger.info("Database connection established successfully.");
}

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
 * Export ONLY what the app needs
 */
export function getSequelize() {
  return sequelize;
}
