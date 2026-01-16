# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Organized test structure with numbered directories (`00-invariants/`, `10-database/`, `20-domain/`, `30-api/`, `40-integration/`, `zz-teardown/`) for clear test execution order
- Comprehensive test file header comments following detailed documentation pattern with Purpose, structure rationale, assertions, and scope boundaries
- Explicit database configuration validation requiring `DB_NAME` and `DB_USER` environment variables (no implicit defaults)
- Enhanced database guard requiring explicit `DB_NAME` in test environment before validating test database name
- Documentation reorganization with numbered directory structure (`00-history/`, `10-markdowns/`, `20-uml/`, `30-diagrams/`, `40-structure/`)
- New SVG diagram exports for architecture, class, and sequence diagrams (v1.3)
- Structure snapshot files (`structure1_31.md`, `structure1_32.md`) tracking project evolution
- Granular test scripts in package.json (`test:invariants`, `test:database`, `test:setup`, `test:teardown`) for targeted test execution
- Structure changelog moved to root level (`api-server/structure-changelog.md`) with version tracking

### Changed
- Reorganized test files from flat `src/test/` structure to hierarchical `src/tests/` with categorized subdirectories
- Moved test support files (`globalHooks.js`, `testDbSetup.js`) to `src/tests/_support/` directory
- Enhanced database guard to require explicit `DB_NAME` environment variable in test mode (removed implicit default)
- Improved `database.js` documentation comments with clearer purpose statements and separation of concerns
- Made database configuration explicit - removed all implicit defaults for `DB_NAME`, `DB_USER`, and `DB_PASSWORD`
- Reorganized documentation files into categorized directories (history, markdowns, UML, diagrams, structure)
- Updated test scripts to target specific test directories using glob patterns
- Enhanced PlantUML diagram files with improved formatting and content

### Removed
- Old flat test directory structure (`src/test/`) in favor of organized hierarchical structure
- Legacy structure documentation file (`documentation/project_structure_v1.md`)
- Documentation wishlist file (`documentation/wishlist.md`)
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
