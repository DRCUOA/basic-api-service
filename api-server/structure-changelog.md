# Structure Files Changelog

This document tracks explicit changes between structure file versions.

## Human-Readable Format (Markdown Table)

| Version | Date | Change Type | Path | Description |
|---------|------|-------------|------|-------------|
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Added | `CHANGELOG.md` | Added at root level of api-server |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Added | `scripts/` | New directory added |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Added | `scripts/check-no-sync.sh` | New script file |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Added | `structure1_1.md` | New structure documentation file at root level |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Removed | `documentation/` | Removed from structure tree (or no longer shown) |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Removed | `logs/` | Removed from structure tree (or no longer shown) |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Removed | `map_structure.sh` | Removed from structure tree |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Removed | Key Files Description section | Removed detailed file descriptions |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Changed | Structure tree root | Now focuses on api-server directory as root |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Changed | Structure representation | Simplified (removed detailed comments about empty directories) |
| 1.0 → 1.1 | Wed 14 Jan 2026 22:00:34 NZDT | Changed | Inline comments | Removed comments like "(Sequelize CLI config)", "(Runtime Sequelize config)", etc. |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `database/migrations/` | Now contains migration files |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `database/migrations/20260114092302-create-tasks.js` | First migration file for tasks table |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/` | New test directory |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/00-setup.test.js` | Test setup file |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/database.test.js` | Database tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/databaseGuardRejection.test.js` | Database guard rejection tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/globalHooks.js` | Global test hooks |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/testDbSetup.js` | Test database setup utility |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/test/zz-teardown.test.js` | Test teardown file |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/` | New tests directory with organized subdirectories |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/_support/` | Test support files |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/00-invariants/` | Invariant tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/10-database/` | Database tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/20-domain/` | Domain layer tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/30-api/` | API layer tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Added | `src/tests/40-integration/` | Integration tests |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Removed | `structure1_1.md` | Removed from structure tree (now the current file) |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Changed | Title | Changed from "Project Structure: ." to "Project Structure: api-server" |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Changed | `database/migrations/` | Now shows as non-empty (contains migration file) |
| 1.1 → 1.2 | Fri 16 Jan 2026 09:22:48 NZDT | Changed | Structure representation | Further refined to show actual project state |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/` | Removed flat test directory structure |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/00-setup.test.js` | Moved to `src/tests/00-invariants/00-database.config.test.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/database.test.js` | Moved to `src/tests/10-database/00-database.connection.test.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/databaseGuardRejection.test.js` | Moved to `src/tests/00-invariants/01-database.guardrails.test.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/globalHooks.js` | Moved to `src/tests/_support/globalHooks.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/testDbSetup.js` | Moved to `src/tests/_support/testDbSetup.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `src/test/zz-teardown.test.js` | Moved to `src/tests/zz-teardown/zz-teardown.test.js` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Removed | `documentation/project_structure_v1.md` | Removed legacy structure documentation |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/_support/globalHooks.js` | Test support hooks moved from `src/test/` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/_support/testDbSetup.js` | Test database setup utility moved from `src/test/` |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/00-invariants/00-database.config.test.js` | Database configuration setup test |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/00-invariants/01-database.guardrails.test.js` | Database guard rejection test |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/10-database/00-database.connection.test.js` | Database connection and lifecycle tests |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/zz-teardown/` | Teardown test directory |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `src/tests/zz-teardown/zz-teardown.test.js` | Global test teardown |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Added | `documentation/structure1_3.md` | New structure documentation snapshot |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Changed | Test structure organization | Reorganized from flat `src/test/` to hierarchical `src/tests/` with numbered directories |
| 1.2 → 1.3 | Fri 16 Jan 2026 10:27:04 NZDT | Changed | Test file naming | Renamed files for clarity (e.g., `databaseGuardRejection.test.js` → `01-database.guardrails.test.js`) |
| 1.3 → 1.31 | Fri 16 Jan 2026 17:26:34 NZDT | Removed | `CHANGELOG.md` | Removed from root level of api-server |
| 1.31 → 1.32 | Fri 16 Jan 2026 17:31:56 NZDT | Added | `CHANGELOG.md` | Added back at root level of api-server |
| 1.31 → 1.32 | Fri 16 Jan 2026 17:31:56 NZDT | Added | `structure-changelog.md` | Added at root level of api-server |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `src/tests/_support/testEnvLoader.js` | Test environment loader utility for loading test configuration |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `src/tests/README-TESTS.md` | Comprehensive test documentation and guidelines |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `structure-changelog.md` | Structure changelog file now visible in structure tree |
| 1.32 → 1.4 | Sun 18 Jan 2026 12:28:13 NZDT | Added | `documentation/00-history/structure1_4.md` | New structure documentation snapshot |

## Machine-Readable Format (JSON)

```json
{
  "changelog": {
    "1.0_to_1.1": {
      "version": "1.0 → 1.1",
      "date": "Wed 14 Jan 2026 22:00:34 NZDT",
      "changes": [
        {
          "type": "added",
          "path": "CHANGELOG.md",
          "description": "Added at root level of api-server"
        },
        {
          "type": "added",
          "path": "scripts/",
          "description": "New directory added"
        },
        {
          "type": "added",
          "path": "scripts/check-no-sync.sh",
          "description": "New script file"
        },
        {
          "type": "added",
          "path": "structure1_1.md",
          "description": "New structure documentation file at root level"
        },
        {
          "type": "removed",
          "path": "documentation/",
          "description": "Removed from structure tree (or no longer shown)"
        },
        {
          "type": "removed",
          "path": "logs/",
          "description": "Removed from structure tree (or no longer shown)"
        },
        {
          "type": "removed",
          "path": "map_structure.sh",
          "description": "Removed from structure tree"
        },
        {
          "type": "removed",
          "path": "Key Files Description section",
          "description": "Removed detailed file descriptions"
        },
        {
          "type": "changed",
          "path": "Structure tree root",
          "description": "Now focuses on api-server directory as root"
        },
        {
          "type": "changed",
          "path": "Structure representation",
          "description": "Simplified (removed detailed comments about empty directories)"
        },
        {
          "type": "changed",
          "path": "Inline comments",
          "description": "Removed comments like \"(Sequelize CLI config)\", \"(Runtime Sequelize config)\", etc."
        }
      ]
    },
    "1.1_to_1.2": {
      "version": "1.1 → 1.2",
      "date": "Fri 16 Jan 2026 09:22:48 NZDT",
      "changes": [
        {
          "type": "added",
          "path": "database/migrations/",
          "description": "Now contains migration files"
        },
        {
          "type": "added",
          "path": "database/migrations/20260114092302-create-tasks.js",
          "description": "First migration file for tasks table"
        },
        {
          "type": "added",
          "path": "src/test/",
          "description": "New test directory"
        },
        {
          "type": "added",
          "path": "src/test/00-setup.test.js",
          "description": "Test setup file"
        },
        {
          "type": "added",
          "path": "src/test/database.test.js",
          "description": "Database tests"
        },
        {
          "type": "added",
          "path": "src/test/databaseGuardRejection.test.js",
          "description": "Database guard rejection tests"
        },
        {
          "type": "added",
          "path": "src/test/globalHooks.js",
          "description": "Global test hooks"
        },
        {
          "type": "added",
          "path": "src/test/testDbSetup.js",
          "description": "Test database setup utility"
        },
        {
          "type": "added",
          "path": "src/test/zz-teardown.test.js",
          "description": "Test teardown file"
        },
        {
          "type": "added",
          "path": "src/tests/",
          "description": "New tests directory with organized subdirectories"
        },
        {
          "type": "added",
          "path": "src/tests/_support/",
          "description": "Test support files"
        },
        {
          "type": "added",
          "path": "src/tests/00-invariants/",
          "description": "Invariant tests"
        },
        {
          "type": "added",
          "path": "src/tests/10-database/",
          "description": "Database tests"
        },
        {
          "type": "added",
          "path": "src/tests/20-domain/",
          "description": "Domain layer tests"
        },
        {
          "type": "added",
          "path": "src/tests/30-api/",
          "description": "API layer tests"
        },
        {
          "type": "added",
          "path": "src/tests/40-integration/",
          "description": "Integration tests"
        },
        {
          "type": "removed",
          "path": "structure1_1.md",
          "description": "Removed from structure tree (now the current file)"
        },
        {
          "type": "changed",
          "path": "Title",
          "description": "Changed from \"Project Structure: .\" to \"Project Structure: api-server\""
        },
        {
          "type": "changed",
          "path": "database/migrations/",
          "description": "Now shows as non-empty (contains migration file)"
        },
        {
          "type": "changed",
          "path": "Structure representation",
          "description": "Further refined to show actual project state"
        }
      ]
    },
    "1.2_to_1.3": {
      "version": "1.2 → 1.3",
      "date": "Fri 16 Jan 2026 10:27:04 NZDT",
      "changes": [
        {
          "type": "removed",
          "path": "src/test/",
          "description": "Removed flat test directory structure"
        },
        {
          "type": "removed",
          "path": "src/test/00-setup.test.js",
          "description": "Moved to src/tests/00-invariants/00-database.config.test.js"
        },
        {
          "type": "removed",
          "path": "src/test/database.test.js",
          "description": "Moved to src/tests/10-database/00-database.connection.test.js"
        },
        {
          "type": "removed",
          "path": "src/test/databaseGuardRejection.test.js",
          "description": "Moved to src/tests/00-invariants/01-database.guardrails.test.js"
        },
        {
          "type": "removed",
          "path": "src/test/globalHooks.js",
          "description": "Moved to src/tests/_support/globalHooks.js"
        },
        {
          "type": "removed",
          "path": "src/test/testDbSetup.js",
          "description": "Moved to src/tests/_support/testDbSetup.js"
        },
        {
          "type": "removed",
          "path": "src/test/zz-teardown.test.js",
          "description": "Moved to src/tests/zz-teardown/zz-teardown.test.js"
        },
        {
          "type": "removed",
          "path": "documentation/project_structure_v1.md",
          "description": "Removed legacy structure documentation"
        },
        {
          "type": "added",
          "path": "src/tests/_support/globalHooks.js",
          "description": "Test support hooks moved from src/test/"
        },
        {
          "type": "added",
          "path": "src/tests/_support/testDbSetup.js",
          "description": "Test database setup utility moved from src/test/"
        },
        {
          "type": "added",
          "path": "src/tests/00-invariants/00-database.config.test.js",
          "description": "Database configuration setup test"
        },
        {
          "type": "added",
          "path": "src/tests/00-invariants/01-database.guardrails.test.js",
          "description": "Database guard rejection test"
        },
        {
          "type": "added",
          "path": "src/tests/10-database/00-database.connection.test.js",
          "description": "Database connection and lifecycle tests"
        },
        {
          "type": "added",
          "path": "src/tests/zz-teardown/",
          "description": "Teardown test directory"
        },
        {
          "type": "added",
          "path": "src/tests/zz-teardown/zz-teardown.test.js",
          "description": "Global test teardown"
        },
        {
          "type": "added",
          "path": "documentation/structure1_3.md",
          "description": "New structure documentation snapshot"
        },
        {
          "type": "changed",
          "path": "Test structure organization",
          "description": "Reorganized from flat src/test/ to hierarchical src/tests/ with numbered directories"
        },
        {
          "type": "changed",
          "path": "Test file naming",
          "description": "Renamed files for clarity (e.g., databaseGuardRejection.test.js → 01-database.guardrails.test.js)"
        }
      ]
    },
    "1.3_to_1.31": {
      "version": "1.3 → 1.31",
      "date": "Fri 16 Jan 2026 17:26:34 NZDT",
      "changes": [
        {
          "type": "removed",
          "path": "CHANGELOG.md",
          "description": "Removed from root level of api-server"
        }
      ]
    },
    "1.31_to_1.32": {
      "version": "1.31 → 1.32",
      "date": "Fri 16 Jan 2026 17:31:56 NZDT",
      "changes": [
        {
          "type": "added",
          "path": "CHANGELOG.md",
          "description": "Added back at root level of api-server"
        },
        {
          "type": "added",
          "path": "structure-changelog.md",
          "description": "Added at root level of api-server"
        }
      ]
    },
    "1.3_to_1.4": {
      "version": "1.3 → 1.4",
      "date": "Sun 18 Jan 2026 12:28:13 NZDT",
      "changes": [
        {
          "type": "added",
          "path": "src/tests/_support/testEnvLoader.js",
          "description": "Test environment loader utility for loading test configuration"
        },
        {
          "type": "added",
          "path": "src/tests/README-TESTS.md",
          "description": "Comprehensive test documentation and guidelines"
        },
        {
          "type": "added",
          "path": "structure-changelog.md",
          "description": "Structure changelog file now visible in structure tree"
        },
        {
          "type": "added",
          "path": "documentation/00-history/structure1_4.md",
          "description": "New structure documentation snapshot"
        }
      ]
    }
  }
}
```
