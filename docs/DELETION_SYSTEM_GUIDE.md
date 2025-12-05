# Complete Guide to Deletion System in Coaching Management

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Deletion Flows](#deletion-flows)
   - [Soft Delete Flow](#soft-delete-flow)
   - [Hard Delete Flow](#hard-delete-flow)
   - [Restore Flow](#restore-flow)
5. [API Endpoints](#api-endpoints)
6. [Auto-Generated Enrollment Handling](#auto-generated-enrollment-handling)
7. [Implementation Details](#implementation-details)
8. [Error Handling](#error-handling)
9. [Security & Permissions](#security--permissions)
10. [Usage Examples](#usage-examples)
11. [Testing & Troubleshooting](#testing--troubleshooting)


## Key Findings:

  1. Student Deletion Flow (src/app/api/students/[id]/route.ts):
    - Implements sophisticated auto-generated enrollment cleanup
    - Distinguishes between auto-generated (based on student's level) and manual enrollments
    - Allows soft delete (archive) even with payments or attendance records
    - Supports cascade deletion for permanent removal of all related data
  2. Teacher Deletion Flow (src/app/api/teachers/[id]/route.ts):
    - Allows soft delete even with related records (classes, class sections, payments)
    - Supports cascade deletion for complete removal
    - Logs related record counts for informational purposes
  3. Core Soft Delete Functions (src/lib/soft-delete.ts):
    - Provides clean separation between soft delete and restore operations
    - Includes permanent delete functions for data cleanup
    - Implements archive listing with pagination
  4. Utility Functions (src/lib/soft-delete-utils.ts):
    - Handles complex enrollment analysis and categorization
    - Provides comprehensive error handling and logging
    - Validates permissions and extracts request parameters

## Overview

The coaching management system implements a comprehensive deletion system that provides three distinct deletion strategies:

1. **Soft Delete**: Marks records as deleted while preserving them for audit and restore purposes
2. **Hard Delete (Cascade)**: Permanently removes records and all related data
3. **Restore**: Recovers soft-deleted records to active status

The system is designed to handle complex relationships between students, teachers, classes, attendance records, and payments while maintaining data integrity and providing clear user feedback.

## Architecture

### Core Components

1. **Database Layer**: Soft delete fields in Student and Teacher models
2. **Utility Layer**: Helper functions for validation, cleanup, and logging
3. **API Layer**: RESTful endpoints handling deletion operations
4. **Business Logic Layer**: Soft delete operations with proper validation

### Key Design Principles

- **Data Preservation by Default**: Soft delete is the default operation
- **Explicit Hard Delete**: Requires explicit `cascade=true` parameter
- **Audit Trail**: All operations are logged with user attribution
- **Related Record Awareness**: System understands and handles relationships
- **Auto-Cleanup**: Automatically removes system-generated records that block deletion

## Database Schema

### Soft Delete Fields

Both Student and Teacher models include these fields:

```prisma
model Student {
  id          String    @id @default(cuid())
  // ... other fields
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedBy   String?
  deleteReason DeleteReason?
  @@index([isDeleted])
  @@index([deletedAt])
}

model Teacher {
  id          String    @id @default(cuid())
  // ... other fields
  isDeleted   Boolean   @default(false)
  deletedAt   DateTime?
  deletedBy   String?
  deleteReason DeleteReason?
  @@index([isDeleted])
  @@index([deletedAt])
}
```

### Delete Reason Enumeration

```prisma
enum DeleteReason {
  RESIGNED      // For teachers who resigned
  TERMINATED    // For teachers who were terminated
  REASSIGNED    // For teachers transferred to other departments
  GRADUATED     // For students who completed studies
  TRANSFERRED   // For students who moved to other institutes
  ERROR         // For data entry errors
  OTHER         // Miscellaneous reasons
}
```

## Deletion Flows

### Soft Delete Flow

#### Student Soft Delete Flow

1. **Permission Validation**
   - Verify user is authenticated
   - Confirm user has Admin role
   - Log validation attempt

2. **Entity Existence Check**
   - Verify student exists in database
   - Check if already soft deleted
   - Return appropriate errors if invalid

3. **Related Records Analysis**
   - Get comprehensive count of related records
   - Distinguish between auto-generated and manual enrollments
   - Categorize records to determine blocking factors

4. **Auto-Generated Enrollment Cleanup**
   - If auto-generated enrollments exist, remove them automatically
   - Log cleanup operation with deleted count
   - Handle cleanup failures gracefully

5. **Related Records Check**
   - Check for manual enrollments, payments, and attendance records
   - Log related records count for informational purposes
   - Note: Soft delete (archive) is allowed even with payments and attendance records

6. **Soft Delete Execution**
   - Update student record with deletion metadata
   - Set `isDeleted: true`, `deletedAt`, `deletedBy`, `deleteReason`
   - Log successful deletion

#### Teacher Soft Delete Flow

1. **Permission Validation** (same as student)
2. **Entity Existence Check** (same as student)
3. **Related Records Analysis**
   - Count class sections, classes, and payments
   - Unlike students, teachers can be soft deleted even with related records
4. **Soft Delete Execution**
   - Update teacher record with deletion metadata
   - Log related records count for informational purposes

### Hard Delete Flow

Both students and teachers follow this flow for hard deletion:

1. **Validation** (same as soft delete)
2. **Cascade Parameter Verification**
   - Requires `cascade=true` query parameter
   - Prevents accidental permanent deletion
3. **Sequential Related Record Deletion**
   - Delete in order respecting foreign key constraints
   - Log each deletion step
4. **Permanent Record Deletion**
   - Delete the primary entity
   - Log completion

### Restore Flow

1. **Permission Validation**
2. **Soft-Deleted Entity Check**
   - Verify entity exists and is soft deleted
3. **Metadata Cleanup**
   - Set `isDeleted: false`
   - Clear `deletedAt`, `deletedBy`, `deleteReason`
4. **Success Logging**

## API Endpoints

### Delete Endpoints

#### Soft Delete (Default)
```http
DELETE /api/students/[id]?deleteReason=GRADUATED
DELETE /api/teachers/[id]?deleteReason=RESIGNED
```

#### Hard Delete (Cascade)
```http
DELETE /api/students/[id]?cascade=true&deleteReason=ERROR
DELETE /api/teachers/[id]?cascade=true&deleteReason=ERROR
```

### Restore Endpoints
```http
POST /api/students/[id]/restore
POST /api/teachers/[id]/restore
```

### Archive/Listing Endpoints
```http
GET /api/archive/students?page=1&limit=10
GET /api/archive/teachers?page=1&limit=10
```

## Auto-Generated Enrollment Handling

### Problem Solved

When students are created with a `levelId`, the system automatically creates enrollments in all class sections of that level. These auto-generated enrollments were preventing soft deletion.

### Solution Implementation

1. **Intelligent Detection**
   - System identifies auto-generated enrollments by matching student's level with class section's subject level
   - Distinguishes between system-created and user-created enrollments

2. **Automatic Cleanup**
   - Before attempting soft delete, auto-generated enrollments are automatically removed
   - Manual enrollments in different levels are preserved
   - Cleanup is logged for audit purposes

3. **Safe Deletion Process**
   - Step 1: Identify auto-generated enrollments
   - Step 2: Delete only system-generated enrollments
   - Step 3: Re-check for blocking records
   - Step 4: Proceed with soft delete if no blocking records remain

### Code Implementation

```typescript
// From soft-delete-utils.ts
export async function cleanupAutoGeneratedEnrollments(studentId: string) {
  // Get student's level
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { levelId: true }
  });

  // Find enrollments matching student's level
  const autoGeneratedEnrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      classSection: {
        subject: {
          levelId: student.levelId
        }
      }
    }
  });

  // Delete only auto-generated enrollments
  const deleteResult = await prisma.enrollment.deleteMany({
    where: {
      studentId,
      classSection: {
        subject: {
          levelId: student.levelId
        }
      }
    }
  });

  return { success: true, deletedCount: deleteResult.count };
}
```

## Implementation Details

### File Structure

```
src/
├── app/api/
│   ├── students/[id]/route.ts    # Student deletion API
│   └── teachers/[id]/route.ts    # Teacher deletion API
├── lib/
│   ├── soft-delete.ts           # Core soft delete functions
│   └── soft-delete-utils.ts     # Utility functions
```

### Key Functions

#### Core Soft Delete Functions (soft-delete.ts)

```typescript
// Main soft delete operations
softDeleteStudent(id, options)
softDeleteTeacher(id, options)

// Restore operations
restoreStudent(id)
restoreTeacher(id)

// Permanent deletion (for cleanup)
permanentDeleteStudent(id)
permanentDeleteTeacher(id)

// Archive listing
getSoftDeletedStudents(page, limit)
getSoftDeletedTeachers(page, limit)
```

#### Utility Functions (soft-delete-utils.ts)

```typescript
// Related record analysis
getStudentRelatedRecords(id)
getTeacherRelatedRecords(id)

// Auto-generated enrollment cleanup
cleanupAutoGeneratedEnrollments(id)

// Error handling and logging
createDeletionError(entityType, records)
logDeletionAttempt(entityType, id, action, details)
handleForeignKeyError(error, entityType, id)

// Validation
validateDeletionPermission(user, entityType)
extractDeletionParams(request)
```

### Query Helpers

The system provides Prisma query helpers that automatically exclude soft-deleted records:

```typescript
// These would be implemented to automatically filter
const activeStudents = await studentFindMany({ where: { status: 'Active' } });
const archivedStudents = await getSoftDeletedStudents();
```

## Error Handling

### Comprehensive Logging

All deletion operations log:

- Entity type and ID
- Action type (attempt, success, error)
- User performing the action
- Timestamp
- Related record counts
- Error details (if applicable)
- Cleanup operation details

### Foreign Key Handling

- Proactive checking before deletion attempts
- Clear error messages with specific record counts
- Cascade delete option for complete removal
- Proper deletion order to respect constraints

### Error Response Format

```json
{
  "error": "Cannot delete student: Student has related records",
  "details": {
    "attendances": 15,
    "enrollments": 2,
    "payments": 5,
    "autoGeneratedEnrollments": 3
  },
  "message": "Please remove all related records before deletion or use cascade=true"
}
```

## Security & Permissions

### Role-Based Access Control

1. **Admin Only**: Only Admin role users can delete/restore records
2. **Authentication Required**: All operations require valid authentication
3. **Audit Trail**: All actions logged with user ID
4. **Server-Side Validation**: Permissions checked server-side for security

### Data Protection

- **Soft Delete Default**: Prevents accidental data loss
- **Confirmation Required**: Cascade deletion requires explicit parameter
- **Reason Tracking**: All deletions require categorization
- **Comprehensive Logging**: Full audit trail maintained

## Usage Examples

### Soft Delete a Student

```javascript
// Request
DELETE /api/students/student123?deleteReason=GRADUATED

// Success Response (even with payments and attendance)
{
  "message": "Student soft deleted successfully"
}

// Note: Soft delete (archive) succeeds even if student has:
// - Payment records
// - Attendance records
// - Manual enrollments (automatically cleaned up)
// All related data is preserved for historical records
```

### Hard Delete with Cascade

```javascript
// Request
DELETE /api/students/student123?cascade=true&deleteReason=ERROR

// Success Response
{
  "message": "Student and all related records deleted permanently"
}
```

### Restore a Student

```javascript
// Request
POST /api/students/student123/restore

// Success Response
{
  "message": "Student restored successfully"
}
```

## Testing & Troubleshooting

### Common Scenarios

1. **Student with Auto-Generated Enrollments Only**
   - Auto-generated enrollments are cleaned up automatically
   - Soft delete succeeds

2. **Student with Manual Enrollments**
   - Manual enrollments are deleted automatically during soft delete
   - Soft delete succeeds (enrollments can be recreated if restored)

3. **Student with Payments and Attendance**
   - Soft delete (archive) succeeds
   - All related data is preserved for historical records
   - Use cascade delete to permanently remove all data

4. **Teacher with Related Classes**
   - Soft delete succeeds (related records don't block)
   - Related records remain for historical data

4. **Cascade Deletion**
   - All related records deleted in correct order
   - Permanent deletion complete

### Debug Mode

Enable detailed logging by setting environment:

```bash
NODE_ENV=development
```

This will show detailed deletion information in console logs.

### Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Permission denied | User not Admin | Verify user role in auth metadata |
| Foreign key error | Related records exist | Use cascade=true or manually clean up |
| Auto-generated enrollments blocking | Level-based enrollments present | System should auto-clean, check logs |
| Entity not found | Incorrect ID | Verify entity exists in database |
| Already deleted | Attempting to delete soft-deleted record | Check entity status first |

### Test Cases

Use these test scenarios to verify functionality:

1. Create student with level → verify auto-enrollments created
2. Soft delete student → verify auto-enrollments cleaned up
3. Create manual enrollments → verify soft delete blocked
4. Cascade delete → verify all records removed
5. Restore student → verify record restored with metadata cleared

## Payment Soft Delete Implementation

### Overview

The payment soft delete system extends the existing deletion architecture to handle financial records with the same level of care and auditability. Financial records require special handling due to regulatory compliance and audit requirements.

### Database Schema Changes

#### StudentPayment Model Updates

```prisma
model StudentPayment {
  id          String        @id @default(cuid())
  studentId   String
  amount      Float
  paymentDate DateTime
  dueDate     DateTime
  status      PaymentStatus @default(Pending)
  monthYear   String
  description String?
  receiptNo   String?
  isDeleted   Boolean       @default(false) @map("is_deleted")
  deletedAt   DateTime?     @map("deleted_at")
  deletedBy   String?       @map("deleted_by")
  deleteReason DeleteReason? @map("delete_reason")
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  student     Student       @relation(fields: [studentId], references: [id])

  @@index([isDeleted])
  @@index([deletedAt])
  @@map("student_payments")
}
```

#### Extended Delete Reasons

The `DeleteReason` enum has been extended with payment-specific reasons:

```prisma
enum DeleteReason {
  RESIGNED      // For teachers who resigned
  TERMINATED    // For teachers who were terminated
  REASSIGNED    // For teachers transferred to other departments
  GRADUATED     // For students who completed studies
  TRANSFERRED   // For students who moved to other institutes
  ERROR         // For data entry errors
  OTHER         // Miscellaneous reasons
  DUPLICATE     // Duplicate payment records
  REFUND        // Refunded payments
  CANCELLED     // Cancelled transactions
  WRONG_ENTRY   // Incorrect data entry
}
```

### API Endpoints

#### Payment Management Endpoints

**List Payments (Updated)**
```http
GET /api/finance/student-payments?studentId=xxx&status=Paid&monthYear=2024-01
```
- Automatically filters out soft-deleted payments
- Supports filtering by student, status, and month/year
- Auto-updates overdue status

**Create Payment**
```http
POST /api/finance/student-payments
```

**Bulk Update Payments**
```http
PUT /api/finance/student-payments
Content-Type: application/json

{
  "paymentIds": ["id1", "id2", "id3"],
  "updates": {
    "status": "Paid",
    "paymentDate": "2024-01-15"
  }
}
```

**Get Single Payment**
```http
GET /api/finance/student-payments/[id]
```
- Returns 404 for soft-deleted payments

**Update Single Payment**
```http
PUT /api/finance/student-payments/[id]
```

**Soft Delete Payment**
```http
DELETE /api/finance/student-payments/[id]?deleteReason=DUPLICATE
```

**Hard Delete Payment**
```http
DELETE /api/finance/student-payments/[id]?permanent=true
```

#### Archive Management Endpoints

**List Archived Payments**
```http
GET /api/archive/student-payments?page=1&limit=10
```

**Restore Archived Payment**
```http
POST /api/archive/student-payments/[id]/restore
```

**Permanent Delete Archived Payment**
```http
DELETE /api/archive/student-payments/[id]
```

### Implementation Details

#### Payment Soft Delete Flow

1. **Permission Validation**
   - Verify user is authenticated
   - Confirm user has Admin role
   - Log validation attempt

2. **Payment Existence Check**
   - Verify payment exists in database
   - Check if already soft deleted
   - Return appropriate errors if invalid

3. **Soft Delete Execution**
   - Update payment record with deletion metadata
   - Set `isDeleted: true`, `deletedAt`, `deletedBy`, `deleteReason`
   - Log successful deletion

4. **Audit Trail**
   - Comprehensive logging of all payment deletions
   - User attribution for compliance
   - Timestamp tracking

#### Query Filtering

All payment queries automatically filter out soft-deleted records:

```typescript
// Example from the GET endpoint
const payments = await prisma.studentPayment.findMany({
  where: {
    isDeleted: false, // Automatically exclude deleted payments
    ...(studentId && { studentId }),
    ...(status && { status: status as PaymentStatus }),
    ...(monthYear && { monthYear }),
  },
  // ... rest of query
});
```

#### Soft Delete Utilities

Created specialized utilities for payment soft delete operations:

```typescript
// Core functions
softDeleteStudentPayment(id, options)
softDeleteTeacherPayment(id, options)
restoreStudentPayment(id)
restoreTeacherPayment(id)
permanentDeleteStudentPayment(id)
permanentDeleteTeacherPayment(id)

// Archive listing
getSoftDeletedStudentPayments(page, limit)
getSoftDeletedTeacherPayments(page, limit)
```

### Key Features

#### 1. **Financial Compliance**
- All payment deletions are logged with audit trails
- Soft delete by default preserves financial records
- Permanent deletion requires explicit confirmation

#### 2. **Bulk Operations**
- Bulk update support for multiple payments
- Useful for status updates (marking multiple as paid)
- Maintains audit trail for bulk operations

#### 3. **Archive Management**
- Complete archive interface for deleted payments
- Restore functionality for accidental deletions
- Permanent deletion for data cleanup after retention period

#### 4. **Enhanced Error Handling**
- Detailed error messages for payment-specific scenarios
- Validation for financial data integrity
- Comprehensive logging for debugging

### Usage Examples

#### Soft Delete a Payment

```javascript
// Request
DELETE /api/finance/student-payments/payment123?deleteReason=DUPLICATE

// Success Response
{
  "message": "Student payment deleted successfully",
  "data": {
    "id": "payment123",
    "deletedAt": "2024-01-15T10:30:00.000Z",
    "deleteReason": "DUPLICATE"
  }
}
```

#### Bulk Update Payments

```javascript
// Request
PUT /api/finance/student-payments
{
  "paymentIds": ["p1", "p2", "p3"],
  "updates": {
    "status": "Paid",
    "paymentDate": "2024-01-15"
  }
}

// Success Response
{
  "message": "Updated 3 payments successfully",
  "data": [
    { "id": "p1", "status": "Paid", "paymentDate": "2024-01-15", ... },
    { "id": "p2", "status": "Paid", "paymentDate": "2024-01-15", ... },
    { "id": "p3", "status": "Paid", "paymentDate": "2024-01-15", ... }
  ]
}
```

#### View Archived Payments

```javascript
// Request
GET /api/archive/student-payments?page=1&limit=10

// Success Response
{
  "data": [
    {
      "id": "payment456",
      "amount": 1000,
      "status": "Cancelled",
      "deletedAt": "2024-01-10T14:20:00.000Z",
      "deleteReason": "REFUND",
      "student": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Migration Steps

1. **Update Database Schema**
```bash
npx prisma migrate dev --name add_payment_soft_delete
npx prisma generate
```

2. **Update Frontend**
   - Add delete buttons to payment management interface
   - Implement archive management for payments
   - Update forms to handle new delete reasons

3. **Update Existing Queries**
   - All existing payment queries will automatically filter out soft-deleted records
   - No code changes required for basic functionality

### Future Extensions

#### Teacher Payment Soft Delete
The same pattern can be extended to TeacherPayment model:

1. Add soft delete fields to TeacherPayment model
2. Create corresponding API endpoints
3. Implement archive management
4. Add restore functionality

#### Financial Reporting
- Reports should exclude soft-deleted payments by default
- Option to include archived payments for historical analysis
- Audit reports for all payment deletions

## Future Enhancements

### Planned Features

1. **Bulk Operations**: Multi-select archive management
2. **Advanced Search**: Date range and reason filtering in archives
3. **Export Functionality**: CSV/Excel export of archived data
4. **Workflow Automation**: Automated retention policies
5. **Compliance Dashboard**: Enhanced reporting interface
6. **Teacher Payment Soft Delete**: Extend system to teacher payments
7. **Financial Audit Reports**: Comprehensive audit trail reporting

### Performance Optimizations

1. **Batch Cleanup**: Implement batch operations for multiple records
2. **Lazy Loading**: Archive data loaded on demand
3. **Query Optimization**: Add database indexes for archive queries
4. **Caching**: Cache frequently accessed archive data

## Migration Notes

### Database Migration

1. Run migration to add soft delete fields:
```bash
npx prisma migrate dev --name add_soft_delete_fields
npx prisma migrate dev --name add_payment_soft_delete
```

2. Generate updated client:
```bash
npx prisma generate
```

### Code Migration

1. Update existing queries to use helpers
2. Add error handling for foreign key constraints
3. Update frontend to handle new response formats
4. Add archive management interface
5. Implement payment-specific delete reason handling

This comprehensive guide covers all aspects of the deletion system, including the new payment soft delete functionality, providing both technical implementation details and practical usage examples for developers working with the coaching management application.