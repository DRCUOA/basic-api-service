# Project Structure: api-server
Generated on: Fri 30 Jan 2026 11:23:31 NZDT

```text
📁 api-server
├── 📄 CHANGELOG.md
├── 📄 package-lock.json
├── 📄 package.json
├── 📁 scripts
│   └── 📄 check-no-sync.sh
├── 📁 src
│   ├── 📁 api
│   │   ├── 📁 controllers
│   │   │   ├── 📄 healthController.js
│   │   │   └── 📄 taskController.js
│   │   └── 📁 routes
│   │       └── 📄 routes.js
│   ├── 📁 data
│   │   ├── 📁 config
│   │   │   ├── 📄 database.cjs
│   │   │   └── 📄 database.js
│   │   ├── 📄 database.js
│   │   └── 📁 models
│   │       ├── 📄 Task.js
│   │       └── 📄 tasksDao.js
│   ├── 📁 database
│   │   ├── 📄 database.sql
│   │   └── 📁 migrations
│   │       ├── 📄 20260114092302-create-tasks.js
│   │       ├── 📄 20260122035250-seed-tasks.cjs
│   │       └── 📄 20260129205633-change-task-id-to-uuid.js
│   ├── 📁 domain
│   │   └── 📄 taskService.js
│   ├── 📄 index.js
│   ├── 📁 public
│   │   └── 📁 assets
│   │       └── 📄 basic-api-service-logo-1024-1024.png
│   ├── 📁 tests
│   │   ├── 📁 _support
│   │   │   ├── 📄 globalHooks.js
│   │   │   ├── 📄 testDbSetup.js
│   │   │   └── 📄 testEnvLoader.js
│   │   ├── 📁 00-invariants
│   │   │   ├── 📄 00-database.config.test.js
│   │   │   └── 📄 01-database.guardrails.test.js
│   │   ├── 📁 10-database
│   │   │   └── 📄 00-database.connection.test.js
│   │   ├── 📄 README-TESTS.md
│   │   └── 📁 zz-teardown
│   │       └── 📄 zz-teardown.test.js
│   └── 📁 utils
│       └── 📄 logger.js
└── 📄 structure-changelog.md
```
