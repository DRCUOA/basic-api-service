# Project Structure: api-server
Generated on: Fri 16 Jan 2026 10:27:04 NZDT

```text
📁 api-server
├── 📄 CHANGELOG.md
├── 📄 package-lock.json
├── 📄 package.json
├── 📁 scripts
│   └── 📄 check-no-sync.sh
└── 📁 src
    ├── 📁 api
    │   ├── 📁 controllers
    │   │   └── 📄 taskController.js
    │   └── 📁 routes
    │       └── 📄 routes.js
    ├── 📁 data
    │   ├── 📁 config
    │   │   └── 📄 database.js
    │   ├── 📄 database.js
    │   └── 📁 models
    │       ├── 📄 Task.js
    │       └── 📄 tasksDao.js
    ├── 📁 database
    │   ├── 📄 database.sql
    │   ├── 📁 migrations
    │   │   └── 📄 20260114092302-create-tasks.js
    │   └── 📁 seeders
    ├── 📁 domain
    │   └── 📄 taskService.js
    ├── 📄 index.js
    ├── 📁 tests
    │   ├── 📁 _support
    │   │   ├── 📄 globalHooks.js
    │   │   └── 📄 testDbSetup.js
    │   ├── 📁 00-invariants
    │   │   ├── 📄 00-database.config.test.js
    │   │   └── 📄 01-database.guardrails.test.js
    │   ├── 📁 10-database
    │   │   └── 📄 00-database.connection.test.js
    │   ├── 📁 20-domain
    │   ├── 📁 30-api
    │   ├── 📁 40-integration
    │   └── 📁 zz-teardown
    │       └── 📄 zz-teardown.test.js
    └── 📁 utils
        └── 📄 logger.js
```
