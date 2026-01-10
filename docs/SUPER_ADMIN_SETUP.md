# Super Admin Setup Guide

This guide explains how to create and manage Super Admin users in your coaching management system.

## What is a Super Admin?

A **Super Admin** is the highest level of access in the system with these privileges:

- ✅ Access to **all organizations** across the entire platform
- ✅ Can create and manage organizations
- ✅ Can invite and manage users across all organizations
- ✅ Full access to all features (finance, academic, admin)
- ✅ Can promote/demote other admins
- ✅ Platform-wide settings and configuration

**Role Hierarchy:**
```
Super Admin (Platform Level)
    └── Organization Admin (Institute Level)
        ├── Finance Manager (Finance Only)
        └── Academic Coordinator (Academic Only)
```

---

## Creating a Super Admin

### Method 1: Using the Interactive Script (Recommended)

The easiest way to create a super admin is using the interactive CLI script:

```bash
npm run create-super-admin
```

You'll be prompted to enter:
- **Email**: Super admin's email address
- **Password**: Strong password (minimum 6 characters)
- **First Name**: Super admin's first name
- **Last Name**: Super admin's last name

**Example:**
```bash
$ npm run create-super-admin

🚀 Super Admin Creation Tool

==================================================
Enter super admin email: admin@example.com
Enter password (min 6 characters): SecurePass123!
Enter first name: John
Enter last name: Doe

📝 Creating super admin user...
✅ Created Supabase Auth user
✅ Created User record in database

==================================================
✨ Super Admin Created Successfully! ✨
==================================================

📧 Email:     admin@example.com
👤 Name:      John Doe
🔑 Role:      Super Admin
🆔 User ID:   abc123-def456-...

🎉 You can now sign in with these credentials!
```

### Method 2: Using the Utility Function (Programmatic)

You can also create a super admin programmatically using the utility function:

```typescript
import { createSuperAdminUser } from '@/lib/super-admin';

const result = await createSuperAdminUser({
  email: 'admin@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe',
});

if (result.success) {
  console.log('Super admin created:', result.userId);
} else {
  console.error('Error:', result.error);
}
```

### Method 3: Manual Database Setup

If you prefer to do it manually or via SQL:

1. **Create user in Supabase Auth** (via Supabase Dashboard):
   - Go to Authentication > Users
   - Click "Add user"
   - Enter email and password
   - Confirm email automatically

2. **Add user metadata** (in Supabase Dashboard):
   ```json
   {
     "first_name": "John",
     "last_name": "Doe",
     "full_name": "John Doe",
     "role": "SuperAdmin",
     "onboarded": true
   }
   ```

3. **Create User record** (via Prisma/SQL):
   ```sql
   INSERT INTO users (id, email, role)
   VALUES ('auth-user-id-here', 'admin@example.com', 'SuperAdmin');
   ```

4. **Create UserOrganization record** (optional):
   ```sql
   INSERT INTO user_organizations (id, user_id, organization_id, role, can_invite, is_active)
   VALUES (gen_random_uuid(), 'auth-user-id-here', 'system', 'SuperAdmin', true, true);
   ```

---

## Managing Super Admins

### Check if User is Super Admin

```typescript
import { isSuperAdmin } from '@/lib/super-admin';

const isAdmin = await isSuperAdmin(userId);
if (isAdmin) {
  // Grant super admin access
}
```

### List All Super Admins

```typescript
import { getAllSuperAdmins } from '@/lib/super-admin';

const superAdmins = await getAllSuperAdmins();
console.log('Super admins:', superAdmins);
```

### Revoke Super Admin Privileges

```typescript
import { revokeSuperAdmin } from '@/lib/super-admin';

const success = await revokeSuperAdmin(userId);
if (success) {
  console.log('Super admin privileges revoked');
}
```

---

## Security Best Practices

### 1. **Limit Super Admin Accounts**
- Create only 1-2 super admin accounts
- Use for platform management only
- Don't use for day-to-day operations

### 2. **Strong Passwords**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Use a password manager

### 3. **Email Verification**
- Use a secure, monitored email address
- Enable 2FA if available (Supabase feature)
- Don't share credentials

### 4. **Audit Logging**
- Monitor super admin actions
- Log all organization changes
- Regular security reviews

### 5. **Regular Rotation**
- Change passwords every 90 days
- Review access regularly
- Remove unused accounts

---

## Environment Variables Required

Make sure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is required for creating users programmatically. Keep it secret!

---

## Troubleshooting

### Error: "Missing environment variables"
- Ensure all required environment variables are set
- Check `.env.local` file exists and is loaded
- Restart your development server

### Error: "User already exists"
- Check if the email is already registered
- Use a different email or delete the existing user first
- Check both Supabase Auth and database

### Error: "Failed to create auth user"
- Verify Supabase service role key is correct
- Check Supabase project is active
- Verify email format is valid

### Super Admin can't access organizations
- Check `UserOrganization` table has correct records
- Verify `role` field is set to 'SuperAdmin'
- Check `isActive` is true
- Clear browser cache and cookies

---

## Integration with Middleware

Your middleware should check for super admin privileges:

```typescript
// middleware.ts
import { isSuperAdmin } from '@/lib/super-admin';
import { createClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login
  }

  const isSuperAdmin = await isSuperAdmin(user.id);

  // Super admins can access everything
  if (isSuperAdmin) {
    return NextResponse.next();
  }

  // Check organization-specific permissions...
}
```

---

## API Endpoint for Super Admin Check

Create an API endpoint to check super admin status:

```typescript
// app/api/auth/check-super-admin/route.ts
import { createClient } from '@/lib/supabase/server';
import { isSuperAdmin } from '@/lib/super-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ isSuperAdmin: false }, { status: 401 });
  }

  const isSuper = await isSuperAdmin(user.id);

  return NextResponse.json({ 
    isSuperAdmin: isSuper,
    userId: user.id 
  });
}
```

---

## First-Time Setup Workflow

For a new installation:

1. **Create First Super Admin**
   ```bash
   npm run create-super-admin
   ```

2. **Sign In**
   - Go to your app's sign-in page
   - Use the credentials you just created

3. **Create Your First Organization**
   - Navigate to admin panel
   - Create organization for your first coaching institute

4. **Add Organization Admin**
   - Invite users to the organization
   - Assign Organization Admin role

5. **Continue with Regular Setup**
   - Add teachers, students, classes, etc.

---

## Next Steps

After creating your super admin:

1. ✅ Sign in with super admin credentials
2. ✅ Create your first organization
3. ✅ Set up organization admin users
4. ✅ Configure organization settings
5. ✅ Begin onboarding staff and students

---

## Support

If you encounter issues:
- Check the troubleshooting section above
- Review Supabase logs
- Check database logs
- Contact platform support

---

**Last Updated:** January 11, 2026  
**Version:** 1.0.0
