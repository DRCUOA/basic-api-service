
**Option 1: Use `.env.test` (recommended)**
```bash
cd api-server
cat > .env.test << 'EOF'
DB_NAME=basic_api_test
DB_USER=test_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
EOF
```

**Option 2: Use `.env` (fallback)**
```bash
cd api-server
cat > .env << 'EOF'
DB_NAME=basic_api_test
DB_USER=test_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
EOF
```

**Option 3: Use both (`.env.test` overrides `.env`)**
- Create `.env` with default values
- Create `.env.test` with test-specific overrides
- Example: `.env` might have `DB_HOST=localhost`, `.env.test` might override with `DB_HOST=test-db-server`

**Important:** 
- Replace `your_secure_password` with the password you used when creating the PostgreSQL user
- The `DB_NAME` **must** contain "test" (this is a safety requirement)
- If both files exist, `.env.test` values take precedence

Go back to [README-TESTS](../../src/tests/README-TESTS.md)