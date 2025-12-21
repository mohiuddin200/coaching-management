# Backend Architecture Guide: Coaching Management System

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [Prisma ORM Setup](#prisma-orm-setup)
4. [API Routing Architecture](#api-routing-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Route Examples](#api-route-examples)
7. [Data Validation & Error Handling](#data-validation--error-handling)
8. [Soft Delete Implementation](#soft-delete-implementation)
9. [Performance Optimizations](#performance-optimizations)
10. [Best Practices & Patterns](#best-practices--patterns)

## System Overview

The Coaching Management System backend is built using:
- **Runtime**: Node.js with Next.js 15+ (App Router)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma with PostgreSQL adapter
- **Authentication**: Supabase Auth with JWT tokens
- **Language**: TypeScript for type safety

### Architecture Flow

```
Client Request → Next.js API Route → Authentication Check → Prisma Client → PostgreSQL → Response
```

## Database Architecture

### Schema Design Principles

The database follows these key principles:

1. **Separation of Concerns**: User authentication (User table) is separate from entity profiles (Teacher, Student tables)
2. **Soft Delete Pattern**: Critical entities use soft delete with audit trail
3. **Hierarchical Structure**: Clear relationships between levels → subjects → class sections → enrollments
4. **Audit Fields**: All entities include createdAt, updatedAt, and soft delete fields where applicable

### Core Database Models

#### 1. User Management Models

```prisma
// For system access only
model User {
  id             String   @id @default(uuid())
  email          String   @unique
  role           UserRole @default(Teacher)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  teacherProfile Teacher? @relation("UserToTeacher")
}

// Teacher profiles (may or may not have User access)
model Teacher {
  id            String    @id @default(uuid())
  firstName     String
  lastName      String
  email         String?
  phoneNumber   String
  // ... other fields
  userId        String?   @unique  // Optional link to User
  isDeleted     Boolean   @default(false)
  deletedAt     DateTime?
  deletedBy     String?
  deleteReason  DeleteReason?
  user          User?     @relation("UserToTeacher", fields: [userId], references: [id])
}
```

#### 2. Academic Structure Models

```prisma
// Academic hierarchy
model Level {
  id          String    @id @default(cuid())
  name        String    @unique
  levelNumber Int       @unique
  subjects    Subject[]
  students    Student[]
}

model Subject {
  id       String   @id @default(cuid())
  name     String
  levelId  String
  level    Level    @relation(fields: [levelId], references: [id])
  classSections ClassSection[]
}

model ClassSection {
  id           String   @id @default(cuid())
  name         String
  subjectId    String
  teacherId    String
  subject      Subject  @relation(fields: [subjectId], references: [id])
  teacher      Teacher  @relation(fields: [teacherId], references: [id])
  enrollments  Enrollment[]
  attendances  Attendance[]
}
```

#### 3. Student Management Models

```prisma
model Student {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  email         String   @unique
  levelId       String
  // ... extensive profile fields
  isDeleted     Boolean  @default(false)
  deletedAt     DateTime?
  deletedBy     String?
  deleteReason  DeleteReason?
  level         Level    @relation(fields: [levelId], references: [id])
  enrollments   Enrollment[]
  attendances   Attendance[]
  payments      StudentPayment[]
}

model Enrollment {
  id             String           @id @default(cuid())
  studentId      String
  classSectionId String?
  classId        String?
  status         EnrollmentStatus @default(Active)
  student        Student          @relation(fields: [studentId], references: [id])
  classSection   ClassSection?    @relation(fields: [classSectionId], references: [id])
  class          Class?           @relation(fields: [classId], references: [id])
}
```

## Prisma ORM Setup

### Database Connection Configuration

Located at `src/lib/prisma.ts`:

```typescript
import 'dotenv/config'
import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Global singleton pattern to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PostgreSQL adapter for connection pooling
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Create or reuse Prisma instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Save instance in development for hot reload
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Key Features

1. **Connection Pooling**: Uses Prisma PostgreSQL adapter for efficient connection management
2. **Singleton Pattern**: Prevents multiple database connections in development
3. **Environment Configuration**: Database URL from environment variables
4. **Generated Client**: Type-safe database client at `src/generated/client`

### Prisma Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated"  // Custom output location
}

datasource db {
  provider  = "postgresql"
  // Connection string from environment
}
```

## API Routing Architecture

### Directory Structure

```
src/app/api/
├── admin/                    # Admin-only endpoints
│   ├── users/
│   └── invite-user/
├── archive/                  # Soft-deleted records
│   ├── students/
│   ├── teachers/
│   └── student-payments/
├── attendance/               # Attendance management
├── class-sections/          # Class management
│   └── [id]/
│       ├── schedules/
│       └── students/
├── finance/                 # Financial operations
│   ├── student-payments/
│   ├── teacher-payments/
│   ├── fee-structures/
│   ├── expenses/
│   └── stats/
├── levels/                  # Academic levels
├── students/                # Student CRUD
│   └── [id]/
│       ├── related-records/
│       ├── restore/
│       ├── check-delete/
│       └── debug/
├── teachers/                # Teacher CRUD
│   └── [id]/
│       └── invite/
└── subjects/                # Subject management
```

### Routing Patterns

#### 1. Standard CRUD Pattern

```typescript
// GET /api/students - List all students
// POST /api/students - Create new student
// GET /api/students/[id] - Get specific student
// PUT /api/students/[id] - Update student
// DELETE /api/students/[id] - Soft delete student
```

#### 2. Nested Resource Pattern

```typescript
// GET /api/class-sections/[id]/students - Get students in class
// GET /api/class-sections/[id]/schedules - Get class schedules
// POST /api/class-sections/[id]/schedules - Add schedule
```

#### 3. Action-Specific Pattern

```typescript
// POST /api/students/[id]/restore - Restore deleted student
// POST /api/students/[id]/check-delete - Check deletion constraints
// POST /api/teachers/[id]/invite - Send portal invitation
```

## Authentication & Authorization

### Supabase Client Setup

Two types of Supabase clients in `src/lib/supabase/server.ts`:

```typescript
// Regular client - respects RLS policies
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies configuration }
  );
}

// Admin client - bypasses RLS for admin operations
export async function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies configuration }
  );
}
```

### Authentication Flow

1. **Middleware Protection**: Global middleware in `src/middleware.ts` handles authentication
2. **Per-Route Authorization**: Individual routes check user permissions
3. **Role-Based Access**: Different access levels for Admin, Teacher, and Staff

### Authorization Pattern Example

```typescript
// In any protected API route
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if user is authenticated
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user role
  if (user.user_metadata.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with API logic...
}
```

## API Route Examples

### Example 1: Student CRUD Operations

File: `src/app/api/students/route.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/students - List all active students
export async function GET() {
  try {
    const students = await prisma.student.findMany({
      where: {
        isDeleted: false, // Filter out soft-deleted records
      },
      include: {
        level: true,  // Include related level data
        enrollments: {
          where: { status: "Active" },
          include: {
            classSection: {
              include: { subject: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// POST /api/students - Create new student
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { firstName, lastName, email, phoneNumber, levelId } = body;
    if (!firstName || !lastName || !email || !levelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create student with Prisma
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        levelId,
        // ... other fields
      },
      include: { level: true },
    });

    // Auto-enroll in all classes of the student's level
    if (levelId) {
      const classSections = await prisma.classSection.findMany({
        where: {
          subject: { levelId },
          status: "Scheduled",
        },
      });

      if (classSections.length > 0) {
        await prisma.enrollment.createMany({
          data: classSections.map(section => ({
            studentId: student.id,
            classSectionId: section.id,
            status: "Active",
          })),
        });
      }
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
```

### Example 2: Nested Resources - Class Students

File: `src/app/api/class-sections/[id]/students/route.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

// GET /api/class-sections/[id]/students
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = params;

    // Validate class section exists
    const classSection = await prisma.classSection.findUnique({
      where: { id },
      include: { subject: { include: { level: true } } },
    });

    if (!classSection) {
      return NextResponse.json(
        { error: "Class section not found" },
        { status: 404 }
      );
    }

    // Get all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        classSectionId: id,
        status: "Active",
      },
      include: {
        student: {
          where: { isDeleted: false },
          include: { level: true },
        },
      },
    });

    const students = enrollments.map(enrollment => enrollment.student);

    return NextResponse.json({
      classSection,
      students,
      totalStudents: students.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch class students" },
      { status: 500 }
    );
  }
}
```

### Example 3: Finance Module with Complex Queries

File: `src/app/api/finance/student-payments/route.ts`

```typescript
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const monthYear = searchParams.get('monthYear');
    const studentId = searchParams.get('studentId');

    // Build dynamic where clause
    const where: any = {
      isDeleted: false,
      ...(status && { status }),
      ...(monthYear && { monthYear }),
      ...(studentId && { studentId }),
    };

    // Get payments with student data
    const payments = await prisma.studentPayment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            level: { select: { name: true } },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    // Calculate statistics
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      payments,
      statistics: {
        total: payments.length,
        totalAmount,
        paidAmount,
        pendingAmount,
        paidCount: payments.filter(p => p.status === 'Paid').length,
        pendingCount: payments.filter(p => p.status === 'Pending').length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}
```

## Data Validation & Error Handling

### Validation Patterns

#### 1. Basic Field Validation

```typescript
// Simple required field check
if (!firstName || !lastName || !email) {
  return NextResponse.json(
    { error: "Missing required fields" },
    { status: 400 }
  );
}

// Type validation
const amount = parseFloat(body.amount);
if (isNaN(amount) || amount <= 0) {
  return NextResponse.json(
    { error: "Invalid amount" },
    { status: 400 }
  );
}
```

#### 2. Schema Validation with Zod

```typescript
import { z } from "zod";

const attendanceSchema = z.object({
  studentId: z.string().uuid(),
  classSectionId: z.string().uuid().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val))),
  status: z.enum(["Present", "Absent"]),
});

// In API route
const body = await request.json();
const validation = attendanceSchema.safeParse(body);

if (!validation.success) {
  return NextResponse.json(
    { error: "Invalid data", details: validation.error.errors },
    { status: 400 }
  );
}

const { studentId, classSectionId, date, status } = validation.data;
```

### Error Handling Patterns

#### 1. Consistent Error Response Format

```typescript
return NextResponse.json(
  {
    error: "Error message",
    details: error instanceof Error ? error.message : "Unknown error",
    timestamp: new Date().toISOString()
  },
  { status: 500 }
);
```

#### 2. Fallback Pattern for Complex Queries

```typescript
try {
  // Complex query with multiple includes
  const data = await prisma.student.findMany({
    include: { /* many relationships */ }
  });
  return NextResponse.json({ data });
} catch (error) {
  console.error("Complex query failed:", error);

  // Fallback to simpler query
  try {
    const simpleData = await prisma.student.findMany({
      select: { /* essential fields only */ }
    });
    return NextResponse.json({ data: simpleData });
  } catch (fallbackError) {
    return NextResponse.json(
      { error: "Query failed completely" },
      { status: 500 }
    );
  }
}
```

#### 3. Foreign Key Constraint Handling

```typescript
import { handleForeignKeyError } from "@/lib/error-handling";

try {
  await prisma.student.delete({ where: { id } });
} catch (error) {
  const fkError = handleForeignKeyError(error as Error, 'student', id);
  if (fkError) {
    return NextResponse.json(fkError, { status: 400 });
  }
  throw error; // Re-throw if not a foreign key error
}
```

## Soft Delete Implementation

### Soft Delete Schema Pattern

```prisma
model Student {
  id           String  @id @default(uuid())
  // ... other fields
  isDeleted    Boolean @default(false) @map("is_deleted")
  deletedAt    DateTime? @map("deleted_at")
  deletedBy    String? @map("deleted_by")
  deleteReason DeleteReason? @map("delete_reason")
}
```

### Soft Delete Utilities

File: `src/lib/soft-delete.ts`

```typescript
import { prisma } from "./prisma";
import { DeleteReason } from "@prisma/client";

// Soft delete a student with audit trail
export async function softDeleteStudent(
  id: string,
  deletedBy: string,
  reason: DeleteReason
) {
  return await prisma.student.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy,
      deleteReason: reason,
    },
  });
}

// Restore a soft-deleted student
export async function restoreStudent(id: string) {
  return await prisma.student.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      deleteReason: null,
    },
  });
}

// Permanent delete (hard delete)
export async function permanentDeleteStudent(id: string) {
  return await prisma.student.delete({
    where: { id },
  });
}
```

### API Route with Soft Delete

File: `src/app/api/students/[id]/route.ts`

```typescript
import { softDeleteStudent } from "@/lib/soft-delete";
import { checkStudentConstraints } from "@/lib/constraint-checks";

// DELETE /api/students/[id] - Soft delete with validation
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;

    // Check if student exists and is not already deleted
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    if (student.isDeleted) {
      return NextResponse.json(
        { error: "Student already deleted" },
        { status: 400 }
      );
    }

    // Check constraints before deletion
    const constraints = await checkStudentConstraints(id);
    if (constraints.hasConstraints) {
      return NextResponse.json(
        {
          error: "Cannot delete student with existing records",
          details: constraints.details,
        },
        { status: 409 }
      );
    }

    // Get deletion reason from request body
    const body = await request.json();
    const { reason } = body;

    // Perform soft delete
    const deletedStudent = await softDeleteStudent(
      id,
      body.deletedBy,
      reason
    );

    return NextResponse.json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
```

## Performance Optimizations

### 1. Query Optimization

#### Selective Field Selection

```typescript
// Instead of fetching all fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    level: { select: { name: true } },
    // Only select needed fields
  },
});
```

#### Efficient Counting

```typescript
// Use _count for efficient aggregation
const studentsWithCounts = await prisma.student.findMany({
  include: {
    _count: {
      select: {
        enrollments: true,
        attendances: true,
        payments: true,
      },
    },
  },
});
```

#### Batch Operations

```typescript
// Batch create enrollments
await prisma.enrollment.createMany({
  data: classSections.map(section => ({
    studentId: student.id,
    classSectionId: section.id,
    status: "Active",
  })),
  skipDuplicates: true, // Skip if already exists
});
```

### 2. Database Indexing

```prisma
model StudentPayment {
  id        String @id @default(cuid())
  // ... fields
  isDeleted Boolean @default(false)

  @@index([isDeleted])     // For soft delete filtering
  @@index([deletedAt])     // For date-based queries
  @@index([studentId])     // For foreign key lookups
  @@index([status])        // For status filtering
}
```

### 3. Connection Management

The Prisma client uses connection pooling via the PostgreSQL adapter:

```typescript
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
```

This provides:
- Connection pooling for better performance
- Automatic connection management
- Optimized query execution

## Best Practices & Patterns

### 1. Code Organization

```
src/
├── lib/                    # Shared utilities
│   ├── prisma.ts          # Database client
│   ├── supabase/          # Auth clients
│   ├── soft-delete.ts     # Soft delete utilities
│   └── validation.ts      # Schema validation
├── app/api/               # API routes
│   ├── students/          # Feature-based grouping
│   ├── finance/           # Domain modules
│   └── admin/             # Admin endpoints
└── generated/             # Prisma generated client
```

### 2. Naming Conventions

- **Files**: kebab-case (`student-payments.ts`)
- **Functions**: camelCase (`getStudentById`)
- **Variables**: camelCase (`studentId`)
- **Database Fields**: camelCase with mapping (`@map("is_deleted")`)

### 3. Type Safety Patterns

```typescript
// Use generated types
import type { Student, PrismaClient } from '@prisma/client';

// Type-safe API responses
type StudentResponse = {
  students: Student[];
  total: number;
};

// Type-safe route parameters
interface Params {
  params: { id: string };
}
```

### 4. Environment Variables

```typescript
// Always validate environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### 5. Security Practices

1. **Input Validation**: Always validate user input
2. **SQL Injection Prevention**: Use Prisma parameterized queries
3. **Authentication**: Verify user identity on protected routes
4. **Authorization**: Check role-based permissions
5. **Error Messages**: Don't expose sensitive information

### 6. Logging Strategy

```typescript
// Structured logging for debugging
console.log(`Fetching students - Query:`, {
  isDeleted: false,
  includeRelations: ['level', 'enrollments'],
});

// Error logging with context
console.error(`Student creation failed:`, {
  error: error.message,
  data: { email, phoneNumber },
  timestamp: new Date().toISOString(),
});
```

## Conclusion

This backend architecture demonstrates a well-structured, scalable approach to building a coaching management system. Key strengths include:

1. **Clear separation of concerns** between authentication and business entities
2. **Comprehensive soft delete system** with audit trails
3. **Type-safe database operations** with Prisma
4. **Consistent API patterns** across all modules
5. **Proper error handling** and validation
6. **Performance optimizations** for large-scale data

The architecture supports the complex needs of educational institutions while maintaining code quality, security, and scalability.