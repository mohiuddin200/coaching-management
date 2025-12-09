# Deployment Checklist: Payment Soft Delete Feature

## Pre-Deployment Checklist

### 1. Local Testing ✅
- [ ] Run migration locally: `npx prisma migrate dev --name add_payment_soft_delete`
- [ ] Test all payment endpoints:
  - [ ] GET `/api/finance/student-payments` (filters deleted payments)
  - [ ] POST `/api/finance/student-payments`
  - [ ] PUT `/api/finance/student-payments` (bulk update)
  - [ ] GET `/api/finance/student-payments/[id]`
  - [ ] PUT `/api/finance/student-payments/[id]`
  - [ ] DELETE `/api/finance/student-payments/[id]` (soft delete)
  - [ ] DELETE `/api/finance/student-payments/[id]?permanent=true`
- [ ] Test archive endpoints:
  - [ ] GET `/api/archive/student-payments`
  - [ ] POST `/api/archive/student-payments/[id]/restore`
  - [ ] DELETE `/api/archive/student-payments/[id]`
- [ ] Verify payment utilities work correctly
- [ ] Run full test suite

### 2. Staging Environment
- [ ] Deploy code to staging
- [ ] Backup staging database
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Verify migration success
- [ ] Test all endpoints on staging
- [ ] Performance test with large datasets

### 3. Production Preparation
- [ ] Schedule maintenance window (if needed)
- [ ] Notify stakeholders about deployment
- [ ] Backup production database
- [ ] Prepare rollback plan

## Deployment Steps

### Step 1: Code Deployment
```bash
# 1. Ensure all changes are committed
git add .
git commit -m "feat: Add soft delete functionality to student payments"
git push origin main

# 2. Deploy your application code
# (This depends on your deployment platform)
# - Vercel: Automatic on push
# - Railway: Automatic on push
# - AWS: Run deployment script
# - Docker: Build and push new image
```

### Step 2: Database Migration
```bash
# After code deployment, run the migration
npx prisma migrate deploy
```

### Step 3: Verify Deployment
```bash
# Check migration status
npx prisma migrate status

# Verify schema is updated
npx prisma db pull
npx prisma generate
```

## Post-Deployment Verification

### 1. Smoke Tests
```bash
# Test basic functionality
curl -X GET "https://your-domain.com/api/finance/student-payments"
curl -X POST "https://your-domain.com/api/finance/student-payments" \
  -H "Content-Type: application/json" \
  -d '{"studentId":"test","amount":100,"paymentDate":"2024-01-15","dueDate":"2024-01-31","monthYear":"2024-01"}'
```

### 2. Monitor Application Health
- [ ] Check error logs
- [ ] Monitor database performance
- [ ] Verify API response times
- [ ] Check authentication/authorization

### 3. Functional Testing
- [ ] Create a test payment
- [ ] Try soft deleting it
- [ ] Verify it doesn't appear in regular queries
- [ ] Verify it appears in archive
- [ ] Test restore functionality
- [ ] Test permanent deletion

## Rollback Plan

### If Code Deployment Fails
```bash
# Roll back to previous commit
git revert <commit_hash>
git push origin main
```

### If Migration Fails
```sql
-- Connect to production database
-- Manually reverse changes if needed
ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "is_deleted";
ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "deleted_at";
ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "deleted_by";
ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "delete_reason";
DROP INDEX IF EXISTS "student_payments_is_deleted_idx";
DROP INDEX IF EXISTS "student_payments_deleted_at_idx";

-- Mark migration as not applied
DELETE FROM _prisma_migrations
WHERE migration_name = '20251206060000_add_payment_soft_delete';
```

### Complete Rollback
1. Roll back code changes
2. Reverse database changes
3. Restore database from backup if needed
4. Restart application services
5. Verify everything works as before

## Monitoring

### Key Metrics to Monitor Post-Deployment
1. **API Response Times**: Should remain stable
2. **Error Rates**: No increase in 500 errors
3. **Database Performance**: Query times shouldn't increase
4. **Memory Usage**: No significant memory leaks

### Log Patterns to Watch For
```bash
# Success patterns
"PAYMENT_SOFT_DELETE: Successfully soft deleted payment"
"PAYMENT_RESTORE: Successfully restored student payment"

# Error patterns
"Failed to soft delete student payment"
"Student payment not found"
"Foreign key constraint violation"
```

## Database Specific Considerations

### PostgreSQL
- Migration uses `ALTER TYPE` for enum extension
- Enum values cannot be removed, only added
- Index creation is non-blocking

### Supabase (if using)
- Migration runs through SQL editor or API
- Need appropriate permissions
- May need to disable RLS temporarily

### Connection Pooling
- Database migrations might need direct connection
- Ensure migration can bypass connection pooler
- Use `DIRECT_URL` if necessary

## Security Considerations

### Sensitive Data
- Payment deletion logs might contain sensitive information
- Ensure logs are properly secured
- Audit trail is preserved

### Access Control
- Only Admin users can delete payments
- Verify this is enforced in production
- Test with different user roles

## Documentation Updates

After successful deployment:
- [ ] Update API documentation
- [ ] Update user manual
- [ ] Add to release notes
- [ ] Communicate changes to team

## Frequently Asked Questions

### Q: Will this affect existing payment data?
A: No. Existing payments will have `isDeleted: false` by default.

### Q: Can this be rolled back?
A: Yes, but removing enum values requires database recreation or workarounds.

### Q: Will this slow down payment queries?
A: Minimal impact. Added indexes for performance.

### Q: What happens to payments created before the migration?
A: They'll have `isDeleted: false` and work normally.

## Contact Information

For deployment issues:
- Database Administrator: [contact]
- Development Team: [contact]
- DevOps Team: [contact]

Remember: It's better to delay deployment than to deploy untested changes.