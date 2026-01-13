# Project Structure: .
Generated on: Tue 13 Jan 2026 18:11:29 NZDT
Updated: Based on actual codebase analysis

```text
📁 .
├── 📁 api-server
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📁 documentation
│   │   ├── 📄 architecture-analysis.md
│   │   ├── 📄 architecture-diagram.puml
│   │   ├── 📄 class-diagram.puml
│   │   ├── 📄 project_structure_v1.md
│   │   └── 📄 sequence-diagram.puml
│   └── 📁 src
│       ├── 📁 api
│       │   ├── 📁 controllers
│       │   │   └── 📄 taskController.js
│       │   └── 📁 routes
│       │       └── 📄 routes.js
│       ├── 📁 data
│       │   ├── 📁 config
│       │   │   └── 📄 database.js (Sequelize CLI config)
│       │   ├── 📄 database.js (Runtime Sequelize config)
│       │   └── 📁 models
│       │       ├── 📄 Task.js (Sequelize model)
│       │       └── 📄 tasksDao.js (DAO implementation)
│       ├── 📁 database
│       │   ├── 📄 database.sql (SQL schema)
│       │   ├── 📁 migrations (empty - migrations not yet created)
│       │   └── 📁 seeders (empty - seeders not yet created)
│       ├── 📁 domain
│       │   └── 📄 taskService.js
│       ├── 📄 index.js (Entry point)
│       └── 📁 utils
│           └── 📄 logger.js (Winston logger)
├── 📁 logs
│   ├── 📄 combined.log
│   └── 📄 error.log
└── 📄 map_structure.sh
```

## Key Files Description

- **index.js**: Entry point that initializes Express, connects to PostgreSQL via Sequelize, and starts the server
- **routes.js**: Defines HTTP endpoints (only GET /api/tasks is active)
- **taskController.js**: Handles HTTP requests/responses for all CRUD operations
- **taskService.js**: Business logic layer with all CRUD methods implemented
- **tasksDao.js**: Data access layer using Sequelize ORM (missing `retrieveAllTasks()` function)
- **Task.js**: Sequelize model definition for tasks table
- **database.js**: Runtime Sequelize configuration with connection pooling and poisoned sync()
- **config/database.js**: Sequelize CLI configuration for migrations
- **logger.js**: Winston-based logging utility
