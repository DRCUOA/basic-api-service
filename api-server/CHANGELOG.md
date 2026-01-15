# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Made `sequelize.sync()` override unconditional - removed environment-based conditional check per GH issue 5. The sync() method now throws an error in all environments (dev, test, prod) to prevent accidental runtime schema mutations.
## [1.1.0] - 2026-01-14

### Added
- Sequelize migration for creating tasks table (`20260114092302-create-tasks.js`)
- Schema verification function `verifySchema()` in `database.js` to check required tables exist at startup
- Startup schema validation in application initialization to ensure database schema is properly set up before accepting requests

### Changed
- Application startup now verifies database schema integrity before starting the server
- Enhanced defensive programming: schema verification complements the poisoned `sync()` method

## [1.0.0] - 2026-01-13

### Added
- Initial Express.js API server implementation with task management endpoints
- PostgreSQL database integration using Sequelize ORM
- Layered architecture pattern: routes, controllers, services, and DAOs
- Task CRUD operations (Create, Read, Update, Delete)
- Winston-based logging system with file and console output
- Migration-only schema control with poisoned `sync()` method for safety
- Sequelize CLI configuration for database migrations
- Comprehensive architecture documentation with PlantUML diagrams
- Database connection pooling and error handling
- Environment-based configuration via dotenv

### Fixed
- Implemented missing `retrieveAllTasks()` function in `tasksDao.js` to fix bug where `taskService.listTasks()` was calling a non-existent DAO method

### Technical Details
- Node.js ES modules (type: "module")
- Express 5.2.1 framework
- Sequelize 6.37.7 ORM with PostgreSQL adapter
- Winston 3.19.0 for structured logging
- Defensive programming: runtime schema mutation prevention
