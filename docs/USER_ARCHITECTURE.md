# User Management Architecture - Decision Document

## Problem Statement

During onboarding, we encountered this error:
```
Unknown argument `firstName`. Available options are marked with ?.
```

This occurred because the `User` table in our Prisma schema doesn't have `firstName` and `lastName` fields, but the onboarding action was trying to store them.

## Question: Should we use Supabase Auth directly instead of duplicating user data?

**Answer: Yes, but with a hybrid approach that fits your architecture.**

## Recommended Architecture

### Three-Layer User System

#### 1. **Supabase Auth** (Authentication Layer)
- **Purpose**: Authentication, email verification, password management
- **Storage**: user_metadata for quick profile info (firstName, lastName, role, onboarded status)
- **Access**: Admin API for listing all users in the frontend

#### 2. **User Table** (Access Control Layer)
- **Purpose**: Track who has portal access
- **Fields**: `id`, `email`, `role`, `createdAt`, `updatedAt`
- **Relation**: Links to Teacher via `teacherProfile`
- **Philosophy**: Minimal sync table - only for system access, not business data

#### 3. **Teacher/Student Tables** (Business Entity Layer)
- **Purpose**: Store complete profile information
- **Fields**: All business-related data (names, phone, qualifications, etc.)
- **Relation**: Teacher has optional `userId` - only set when they have portal access

## Why This Architecture?

### ✅ Advantages

1. **Clean Separation of Concerns**
   - Auth ≠ Business Entity
   - Teachers can exist without portal access
   - Students never need portal access

2. **Flexibility**
   - Grant portal access to existing teachers anytime
   - Revoke access without deleting business records
   - Future-proof for student portals

3. **Performance**
   - Authentication queries only scan small User table
   - Business queries optimized separately
   - No bloated auth table

4. **Security**
   - Smaller attack surface
   - Auth data separate from business data
   - Easy to audit who has system access

5. **Scalability**
   - Supabase Auth handles scale automatically
   - Business tables can grow independently
   - Easy to add new roles

## Data Flow

### Onboarding Flow (Fixed)
```typescript
1. User clicks invite link → Supabase Auth creates user
2. User fills onboarding form (firstName, lastName, password)
3. Update Supabase Auth:
   - Set password
   - Store metadata: { first_name, last_name, full_name, onboarded: true }
4. Sync to User table: { id, email, role }
5. If Teacher role: Create/Update Teacher profile { firstName, lastName, ... }
```

### User Listing Flow
```typescript
1. Admin visits /admin/users
2. Frontend calls /api/admin/users
3. API uses Supabase Admin client to list all auth users
4. Display with data from user_metadata
```

## Implementation Changes Made

### 1. Fixed `onboarding/actions.ts`
- ✅ Removed firstName/lastName from User table operations
- ✅ Added Teacher profile creation for Teacher role
- ✅ Names stored in Supabase metadata + Teacher table

### 2. Created `/admin/users` page
- ✅ Lists all users from Supabase Auth
- ✅ Shows data from user_metadata
- ✅ No need for separate User table queries

### 3. Created `/api/admin/users` endpoint
- ✅ Uses Supabase Admin API
- ✅ Returns all auth users with metadata
- ✅ Paginated (can handle 1000+ users)

## Alternative Approaches Considered

### ❌ Option A: Store names in User table
**Rejected because:**
- Duplicates data already in Teacher table
- Violates single source of truth principle
- Requires syncing between User and Teacher tables

### ❌ Option B: No User table at all
**Rejected because:**
- Prisma relations need User table for foreign keys
- Harder to query "which teachers have portal access"
- Supabase Auth queries are separate from Prisma

### ✅ Option C: Hybrid (Chosen)
**Why this works:**
- User table = minimal sync (id, email, role)
- Names in Supabase metadata for quick UI access
- Full profile data in Teacher/Student tables
- Best of both worlds

## Migration Path

### Current State
- User table has: id, email, role, timestamps, teacherProfile relation
- Teacher table has: all profile fields + optional userId
- Onboarding was broken (trying to store names in User table)

### After Fix
- User table unchanged (no firstName/lastName added)
- Onboarding stores names in Supabase metadata + Teacher profile
- Admin can list all users from Supabase Auth directly

### No Database Migration Needed! ✅
Your current schema is already correct for this architecture.

## Usage Examples

### Display User Name in UI
```typescript
// Option 1: From Supabase metadata (fast)
const { data: { user } } = await supabase.auth.getUser();
const name = user.user_metadata.full_name;

// Option 2: From Teacher profile (if needed for business logic)
const teacher = await prisma.teacher.findUnique({
  where: { userId: user.id }
});
const name = `${teacher.firstName} ${teacher.lastName}`;
```

### Check if User is Onboarded
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user.user_metadata.onboarded) {
  redirect('/auth/onboarding');
}
```

### Grant Portal Access to Existing Teacher
```typescript
// 1. Send invite (creates Supabase Auth user)
// 2. User completes onboarding
// 3. Link to existing Teacher profile
await prisma.teacher.update({
  where: { email: user.email },
  data: { userId: user.id }
});
```

## Security Considerations

1. **Supabase Admin Client**
   - Only use in API routes (server-side)
   - Never expose admin credentials to frontend
   - Use for: listing users, updating metadata

2. **RLS (Row Level Security)**
   - Enable on Teacher/Student tables
   - Users can only read their own linked profiles
   - Admins have full access

3. **Metadata Validation**
   - Always validate user_metadata before trusting
   - Don't use for authorization decisions
   - Use User.role from database for permissions

## Future Enhancements

1. **Student Portal**
   - Add `Student.userId` field (optional)
   - Students can view attendance, grades
   - No code changes to auth system needed

2. **Parent Portal**
   - New `Parent` table with optional `userId`
   - Parents can see multiple students
   - Same auth pattern

3. **Audit Logs**
   - Track when portal access granted/revoked
   - Log User record creation/deletion
   - Supabase Auth already logs auth events

## Conclusion

**The fix is simple:** Don't store firstName/lastName in User table. Use Supabase metadata for UI display and Teacher/Student tables for business data.

**The architecture is correct:** Your current three-table design (User, Teacher, Student) perfectly supports the separation of authentication and business entities.

**No migration needed:** The schema you have is already optimal for this pattern.
