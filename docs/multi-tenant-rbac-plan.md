# Multi-Tenant RBAC Implementation Plan

## Overview
Implement a multi-tenant role-based access control (RBAC) system for the coaching management SaaS application with support for multiple organizations and granular role-based permissions.

---

## System Architecture

### Hierarchy
```
Super Admin (Platform)
  └── Organization 1 (Coaching Institute A)
        ├── Organization Admin
        ├── Finance Manager (finance pages only)
        └── Academic Coordinator (academic pages only)
  └── Organization 2 (Coaching Institute B)
        └── ...
```

### Roles & Permissions

| Role | Description | Access |
|------|-------------|--------|
| **Super Admin** | Platform administrator | All organizations, full access, create/manage orgs |
| **Organization Admin** | Institute administrator | Full access within their organization, can invite users |
| **Finance Manager** | Finance staff | Finance pages only (fees, payments, salaries, expenses) |
| **Academic Coordinator** | Academic staff | Students, teachers, classes, attendance, exams (no finance) |

---

## Implementation Plan

### Phase 1: Database Schema (2-3 days)

#### 1.1 Add New Prisma Models

**File**: `/prisma/schema.prisma`

```prisma
// New Organization Model
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  email       String?
  phone       String?
  address     String?
  logo        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       UserOrganization[]
  teachers    Teacher[]
  students    Student[]
  levels      Level[]
  classSections ClassSection[]
  exams       Exam[]
  feeStructures FeeStructure[]
  studentPayments StudentPayment[]
  teacherPayments TeacherPayment[]
  expenses    Expense[]

  @@map("organizations")
}

// New UserOrganization Junction Table
model UserOrganization {
  id             String    @id @default(cuid())
  userId         String
  organizationId String
  role           SystemRole @default(AcademicCoordinator)
  canInvite      Boolean   @default(false)
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@index([userId])
  @@index([organizationId])
  @@map("user_organizations")
}

// New SystemRole Enum
enum SystemRole {
  SuperAdmin
  OrganizationAdmin
  FinanceManager
  AcademicCoordinator
}
```

#### 1.2 Update Existing Models

Add `organizationId` to these existing models:
- Teacher
- Student
- Level
- ClassSection
- Exam
- FeeStructure
- StudentPayment
- TeacherPayment
- Expense

Example for Teacher:
```prisma
model Teacher {
  // ... existing fields ...
  userId        String?   @unique
  organizationId String   // NEW

  user          User?            @relation("UserToTeacher", fields: [userId], references: [id])
  organization  Organization     @relation(fields: [organizationId], references: [id]) // NEW

  @@map("teachers")
}
```

#### 1.3 Update User Model

Add relationship to UserOrganization:
```prisma
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  role           UserRole @default(Teacher) // DEPRECATED (keep for transition)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  teacherProfile Teacher? @relation("UserToTeacher")

  organizations  UserOrganization[] // NEW

  @@map("users")
}
```

#### 1.4 Migration Steps

```bash
# Reset database (development mode)
npx prisma migrate reset --force

# Or push schema directly
npx prisma db push
```

**No data migration needed** - database will be reset.

---

### Phase 2: Permission System (2-3 days)

#### 2.1 Permission Configuration

**Create**: `/src/lib/permissions/config.ts`

Define page-to-role mappings:

```typescript
export const PAGE_PERMISSIONS = [
  { path: "/dashboard", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager", "AcademicCoordinator"] },

  // Academic pages
  { path: "/students", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/teachers", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/levels", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/classes", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/attendance", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },
  { path: "/exams", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "AcademicCoordinator"] },

  // Finance pages
  { path: "/finance", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/fees", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/payments", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/salaries", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },
  { path: "/finance/expenses", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager"] },

  // Admin
  { path: "/admin", allowedRoles: ["SuperAdmin"] },

  // Settings
  { path: "/settings", allowedRoles: ["SuperAdmin", "OrganizationAdmin", "FinanceManager", "AcademicCoordinator"] },
];
```

#### 2.2 Permission Utilities

**Create**: `/src/lib/permissions/utils.ts`

```typescript
export function canAccessPage(userRole: string, path: string): boolean { ... }
export function filterMenuByPermissions(items, userRole): T[] { ... }
export function canInviteUsers(userRole, canInviteFlag): boolean { ... }
```

#### 2.3 Server-Side Auth Helpers

**Create**: `/src/lib/permissions/server.ts`

```typescript
export async function getCurrentUserContext(): Promise<UserContext | null> { ... }
export async function requireAuth(): Promise<UserContext> { ... }
export async function requirePageAccess(path: string): Promise<UserContext> { ... }
export async function requireInvitePermission(): Promise<UserContext> { ... }
```

#### 2.4 Client-Side Hook

**Create**: `/src/lib/permissions/client.ts`

```typescript
export function useUserContext(): ClientUserContext { ... }
export function useCanAccessPage(path: string): boolean { ... }
```

---

### Phase 3: Authentication Updates (2 days)

#### 3.1 Update Middleware

**File**: `/src/middleware.ts`

Changes:
- Fetch user's organization and role from UserOrganization table
- Check page access based on SystemRole
- Redirect to dashboard if insufficient permissions

**Key Logic**:
```typescript
// Get user context from API endpoint
const contextResponse = await fetch(`${request.nextUrl.origin}/api/auth/context`, {
  headers: { cookie: request.headers.get('cookie') || '' }
});
const context = await contextResponse.json();

// Check page access
if (!canAccessPage(context.role, pathname)) {
  return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', request.url));
}
```

#### 3.2 Update User Metadata Structure

**New metadata fields**:
```typescript
{
  // Legacy (keep for backward compatibility)
  role: "Teacher",
  onboarded: boolean,
  teacherId: string,

  // New
  organizationId: string,
  systemRole: "SuperAdmin" | "OrganizationAdmin" | "FinanceManager" | "AcademicCoordinator",
  canInvite: boolean
}
```

---

### Phase 4: API Updates (3-4 days)

#### 4.1 Create User Context Endpoint

**Create**: `/src/app/api/auth/context/route.ts`

Returns current user's organization, role, and permissions.

#### 4.2 Update Invitation System

**File**: `/src/app/api/teachers/[id]/invite/route.ts`

Changes:
- Accept `role` parameter in request body
- Create UserOrganization record with specified role
- Set `canInvite: true` for OrganizationAdmin role
- Link user to organization

**New request format**:
```typescript
POST /api/teachers/{id}/invite
Body: { role: "FinanceManager" | "AcademicCoordinator" | "OrganizationAdmin" }
```

#### 4.3 Update Onboarding Flow

**File**: `/src/app/auth/onboarding/actions.ts`

Changes:
- Create UserOrganization record during onboarding
- Link teacher profile to user
- Ensure organization context is established

#### 4.4 Add Organization Scoping to All APIs

Update all API routes to filter by `organizationId`:

**Examples**:
- `/api/students-simple` - Filter: `where: { organizationId: context.organizationId }`
- `/api/teachers` - Filter by organization
- `/api/finance/*` - Filter by organization
- All CRUD operations - Include organizationId

**Pattern**:
```typescript
// At start of API route
const context = await requirePageAccess("/students");

// In queries
const students = await prisma.student.findMany({
  where: { organizationId: context.organizationId }
});
```

---

### Phase 5: UI/UX Changes (3-4 days)

#### 5.1 Update Sidebar Navigation

**File**: `/src/components/sidebar/app-sidebar.tsx`

Changes:
- Use `useUserContext()` hook to get current role
- Filter menu items using `filterMenuByPermissions()`
- Hide Finance menu for Academic Coordinators
- Hide Academic menu items for Finance Managers

#### 5.2 Create Role Selection Dialog

**Create**: `/src/components/teachers/invite-teacher-dialog.tsx`

Features:
- Dropdown to select role during invitation
- Show role descriptions
- Display role permissions preview

**UI**:
```
Invite Teacher to Portal
├─ Teacher: John Doe (john@example.com)
└─ Select Role:
    [dropdown]
    ├── Finance Manager
    │   └─ Access to finance features only
    ├── Academic Coordinator
    │   └─ Access to students, teachers, classes, attendance, exams
    └─ Organization Admin
        └─ Full access within organization

[Cancel] [Send Invitation]
```

#### 5.3 Update Teacher Actions

**File**: `/src/components/teachers/teacher-actions.tsx`

Add role selection when sending invitation:
```typescript
<InviteTeacherDialog
  teacherId={teacher.id}
  teacherEmail={teacher.email}
  teacherName={teacher.fullName}
/>
```

#### 5.4 Organization Context (Optional)

**File**: `/src/components/sidebar/site-header.tsx`

Can add organization name in header (optional):
```typescript
<Building2 className="h-5 w-5" />
<span className="text-sm font-medium">{organizationName}</span>
```

---

### Phase 6: Admin Panel (2-3 days)

#### 6.1 Create Organization Management

**Create**: `/src/app/admin/organizations/page.tsx`

Super Admin only - basic CRUD for organizations:
- Create new organization
- View all organizations
- Activate/deactivate organizations
- See user counts per org

**Simple UI**:
```
Organizations
[+ New Organization]

┌─────────────────────────────┐
│ ABC Coaching Institute      │
│ Users: 5 | Students: 120    │
│ [Edit] [Deactivate]         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ XYZ Academy                 │
│ Users: 3 | Students: 45     │
│ [Edit] [Deactivate]         │
└─────────────────────────────┘
```

#### 6.2 Create Organization Users Management

**Create**: `/src/app/admin/organizations/[id]/users/page.tsx`

Super Admin only - manage users within an organization:
- View all users in organization
- Change user roles
- Grant/revoke invite permission
- Activate/deactivate users

---

### Phase 7: Testing (2-3 days)

#### 7.1 Test Scenarios

**Permission Tests**:
- ✅ Finance Manager cannot access `/students`
- ✅ Academic Coordinator cannot access `/finance`
- ✅ Organization Admin can access all pages
- ✅ Super Admin can manage organizations

**Data Isolation Tests**:
- ✅ User from Org A cannot see Org B's students
- ✅ All API queries filter by organizationId
- ✅ Cross-org API requests fail

**Invitation Tests**:
- ✅ Invitation includes role assignment
- ✅ Onboarding creates UserOrganization record
- ✅ User has correct permissions after onboarding

**UI Tests**:
- ✅ Sidebar filters correctly based on role
- ✅ Restricted pages show unauthorized message
- ✅ Role selection dialog works

---

## Critical Files to Modify/Create

### Must Modify (Existing)
1. `/prisma/schema.prisma` - Add Organization, UserOrganization models
2. `/src/middleware.ts` - Add role-based route protection
3. `/src/app/api/teachers/[id]/invite/route.ts` - Add role selection
4. `/src/app/auth/onboarding/actions.ts` - Create UserOrganization record
5. `/src/components/sidebar/app-sidebar.tsx` - Filter navigation by role
6. All API routes in `/src/app/api/` - Add organization scoping

### Must Create (New)
1. `/src/lib/permissions/config.ts` - Permission configuration
2. `/src/lib/permissions/utils.ts` - Permission utilities
3. `/src/lib/permissions/server.ts` - Server-side auth helpers
4. `/src/lib/permissions/client.ts` - Client-side hooks
5. `/src/app/api/auth/context/route.ts` - User context endpoint
6. `/src/components/teachers/invite-teacher-dialog.tsx` - Role selection dialog
7. `/src/app/admin/organizations/page.tsx` - Organization management
8. `/src/app/admin/organizations/[id]/users/page.tsx` - User management

---

## Database Reset Instructions (Development)

Since you're resetting the database:

```bash
# 1. Stop dev server
# Ctrl+C

# 2. Reset database
npx prisma migrate reset --force

# Or drop and recreate
npx prisma db push --force-reset

# 3. Create initial organization manually via Prisma Studio
npx prisma studio

# Or create via seed script
```

**Initial Data Needed**:
- 1 Organization (e.g., "Demo Coaching Institute")
- 1 Super Admin user
- Organization Admin for the organization

---

## Success Criteria

✅ **Database**:
- Organization and UserOrganization tables created
- All existing models have organizationId foreign key
- Foreign key constraints enforced

✅ **Authentication**:
- Users have organization context in session
- Middleware enforces role-based access
- Invitation flow assigns roles correctly

✅ **Authorization**:
- Finance managers only see finance pages
- Academic coordinators only see academic pages
- Organization admins see all pages in their org
- Data isolation between organizations

✅ **UI/UX**:
- Sidebar navigation filters by role
- Invitation dialog includes role selection
- Admin can manage organizations
- Clean, intuitive user experience

---

## Implementation Order (Recommended)

1. **Week 1**: Database schema + Permission system foundation
2. **Week 2**: Authentication + Middleware updates
3. **Week 3**: API updates + Organization scoping
4. **Week 4**: UI/UX changes (sidebar, dialogs)
5. **Week 5**: Admin panel + Testing
6. **Week 6**: Polish, documentation, deployment prep

---

## Future Enhancements (Out of Scope)

- Custom roles per organization
- Row-level security in PostgreSQL
- Advanced permission hierarchy
- Student portal access
- Parent portal access
- Audit logging for permission changes
- Organization branding/themes
- Multi-language support

---

## Notes

- **No data migration needed** - database will be reset
- **Role not prominently displayed** - only in user profile/settings
- **Basic Super Admin panel** - simple org management, not full-featured
- **Standardized roles** - same roles across all organizations
- **Page-level permissions** - not feature-level (simpler implementation)
