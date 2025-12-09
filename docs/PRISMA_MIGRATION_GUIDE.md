# Prisma Migration Guide

## Understanding Prisma Migrations

Prisma migrations are a way to manage database schema changes over time. They track every change you make to your `schema.prisma` file and generate SQL scripts to apply those changes to your database.

## Migration Workflow

### Local Development Workflow

#### 1. Making Schema Changes
When you make changes to your `prisma/schema.prisma` file (like we did with StudentPayment), you need to create a migration:

```bash
# This creates a new migration file and applies it to your local database
npx prisma migrate dev --name <migration_name>
```

For our payment soft delete changes:
```bash
npx prisma migrate dev --name add_payment_soft_delete
```

#### 2. What Happens When You Run `migrate dev`

1. **Schema Comparison**: Prisma compares your current schema with the last migration
2. **Migration Generation**: Creates a new migration file in `prisma/migrations/`
3. **Database Update**: Applies the migration to your local database
4. **Client Generation**: Regenerates the Prisma Client with updated types

#### 3. Migration File Structure
Each migration creates a folder with:
```
prisma/migrations/
├── 20251206060000_add_payment_soft_delete/
│   └── migration.sql  # The SQL to apply the changes
└── migration_lock.toml  # Prevents concurrent migrations
```

### Important Commands

```bash
# Create and apply a new migration
npx prisma migrate dev --name <migration_name>

# Generate Prisma Client without migrating
npx prisma generate

# Reset database and reapply all migrations (dev only!)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Diff schema with database
npx prisma db pull
```

## Production Deployment Workflow

### Method 1: Using Prisma Migrate Deploy (Recommended)

#### Step 1: Create Migration in Development
```bash
# In your development environment
npx prisma migrate dev --name add_payment_soft_delete
```

#### Step 2: Test the Migration
```bash
# Test on a staging database first
npx prisma db push --preview-feature
# Or
DATABASE_URL="your_staging_db_url" npx prisma migrate deploy
```

#### Step 3: Commit Migration Files
```bash
git add prisma/migrations/
git commit -m "feat: Add soft delete to student payments"
git push
```

#### Step 4: Deploy to Production
```bash
# In your production environment
npx prisma migrate deploy
```

This command:
- Only runs migrations that haven't been applied yet
- Is safe to run multiple times
- Won't generate new migrations
- Perfect for CI/CD pipelines

### Method 2: Using `db push` (For Simple Changes)

For very simple changes without sensitive data:
```bash
# Push schema changes directly without migration file
npx prisma db push
```

**Warning**: This doesn't create migration files and can cause issues in production. Use only for:

- Development environments
- Non-critical changes
- When you don't need to track schema history

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Migrations

on:
  push:
    branches: [main]
    paths: ['prisma/migrations/**']

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm install
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Best Practices

### 1. Migration Naming
Use descriptive names:
```bash
✅ Good
npx prisma migrate dev --name add_payment_soft_delete_fields
npx prisma migrate dev --name update_user_table_add_avatar_url

❌ Bad
npx prisma migrate dev --name migration1
npx prisma migrate dev --name stuff
```

### 2. Review Generated SQL
Always check the generated SQL:
```bash
# Look at the migration file
cat prisma/migrations/<latest>/migration.sql
```

### 3. Backup Before Production
Always backup your production database before running migrations:
```sql
-- PostgreSQL backup
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 4. Test on Staging
Never run migrations on production without testing:
```bash
# On staging database
DATABASE_URL="staging_db_url" npx prisma migrate deploy
```

### 5. Handle Breaking Changes Carefully

For breaking changes that might cause downtime:
1. Create backward-compatible migrations
2. Deploy code that handles both old and new schemas
3. Run the migration
4. Deploy the final code

## Troubleshooting

### Common Issues

#### 1. Migration Already Applied
```bash
Error: The migration `20251206060000_add_payment_soft_delete` is already applied
```
**Solution**: Check migration status or reset if in development
```bash
npx prisma migrate status
# Or in dev
npx prisma migrate reset
```

#### 2. Database Schema Mismatch
```bash
Error: The database schema is not in sync with the migration history
```
**Solution**: Reset in development or sync manually
```bash
# Development only
npx prisma migrate reset

# Or manually sync
npx prisma db pull
npx prisma generate
```

#### 3. Failed Migration in Production
If a migration fails mid-way:
1. **Don't panic** - migrations are designed to be atomic
2. **Check the error** - Look at the specific SQL that failed
3. **Manual rollback** - If needed, manually revert the partial changes
4. **Fix the migration** - Update the migration SQL
5. **Mark as resolved** - Update the `_prisma_migrations` table if needed

### Migration Debugging

#### Check Applied Migrations
```sql
SELECT * FROM _prisma_migrations ORDER BY started_at DESC;
```

#### Check Current Schema
```bash
npx prisma db pull  # Pull current schema from database
npx prisma studio   # Visualize current schema
```

## Our Current Implementation

### What We've Done

1. **Schema Changes**: Added soft delete fields to `StudentPayment` model
2. **Migration Created**: `20251206060000_add_payment_soft_delete`
3. **Migration Content**:
   - Extended `DeleteReason` enum with payment-specific values
   - Added soft delete columns to `student_payments` table
   - Created indexes for performance

### Running the Migration

#### In Local Development:
```bash
# If you haven't run it yet
npx prisma migrate dev --name add_payment_soft_delete

# Or if you already generated the client
npx prisma migrate deploy
```

#### In Production:
```bash
# After deploying your code
npx prisma migrate deploy
```

### Migration File Explanation

Our migration file (`prisma/migrations/20251206060000_add_payment_soft_delete/migration.sql`):

1. **Enum Extension**: Adds new delete reasons for payments
2. **Column Addition**: Adds soft delete columns with defaults
3. **Index Creation**: Creates indexes for performance

The migration is:
- **Backward Compatible**: Uses default values
- **Atomic**: All or nothing execution
- **Production Safe**: Can be deployed without downtime

## Rollback Strategy

### Development
```bash
# Reset everything
npx prisma migrate reset
```

### Production
Rollbacks require manual intervention:

1. **Code Rollback**:
```bash
git revert <commit_hash>
```

2. **Migration Rollback**:
```sql
-- Manually reverse the migration
ALTER TABLE "student_payments" DROP COLUMN "is_deleted";
ALTER TABLE "student_payments" DROP COLUMN "deleted_at";
ALTER TABLE "student_payments" DROP COLUMN "deleted_by";
ALTER TABLE "student_payments" DROP COLUMN "delete_reason";
DROP INDEX IF EXISTS "student_payments_is_deleted_idx";
DROP INDEX IF EXISTS "student_payments_deleted_at_idx";

-- Note: You can't remove enum values in PostgreSQL
```

3. **Mark Migration as Not Applied**:
```sql
DELETE FROM _prisma_migrations
WHERE migration_name = '20251206060000_add_payment_soft_delete';
```

This guide should help you understand and manage your Prisma migrations effectively in both development and production environments.