# Quick Start: Creating Your First Super Admin

## TL;DR

```bash
# Create a super admin (recommended for first-time setup)
npm run create-super-admin
```

Follow the interactive prompts to create your first super admin user.

## What You Get

- 🔐 Super Admin account with platform-wide access
- 📧 Auto-confirmed email (ready to use immediately)
- 👤 User profile with name and role
- 🎯 Ability to manage all organizations
- ⚡ Can invite other users and assign roles

## Files Created

1. **[scripts/create-super-admin.ts](scripts/create-super-admin.ts)**
   - Interactive CLI tool to create super admins

2. **[src/lib/super-admin.ts](src/lib/super-admin.ts)**
   - Utility functions:
     - `createSuperAdminUser()` - Create super admin programmatically
     - `isSuperAdmin()` - Check if user is super admin
     - `getAllSuperAdmins()` - Get list of all super admins
     - `revokeSuperAdmin()` - Revoke super admin privileges

3. **[src/app/api/auth/check-super-admin/route.ts](src/app/api/auth/check-super-admin/route.ts)**
   - API endpoint to check super admin status
   - Usage: `GET /api/auth/check-super-admin`

4. **[docs/SUPER_ADMIN_SETUP.md](docs/SUPER_ADMIN_SETUP.md)**
   - Complete documentation with examples and best practices

## Quick Usage Examples

### Check if user is super admin (Frontend)

```typescript
// In your React component
const checkSuperAdmin = async () => {
  const response = await fetch('/api/auth/check-super-admin');
  const data = await response.json();
  
  if (data.isSuperAdmin) {
    // Show admin UI
  }
};
```

### Check if user is super admin (Backend)

```typescript
import { isSuperAdmin } from '@/lib/super-admin';

const isAdmin = await isSuperAdmin(userId);
if (isAdmin) {
  // Grant access
}
```

## Next Steps

1. ✅ Run `npm run create-super-admin` to create your first admin
2. ✅ Sign in with the credentials you created
3. ✅ Create your first organization
4. ✅ Start adding users, teachers, and students

📖 **Full Documentation:** See [docs/SUPER_ADMIN_SETUP.md](docs/SUPER_ADMIN_SETUP.md)
