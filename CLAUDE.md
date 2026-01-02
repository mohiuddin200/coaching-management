# AI Collaboration Guide for Coaching Management Software

This document provides essential context for AI models working with the Coaching Management Software SaaS project.

## Project Overview

**Primary Goal**: Develop a scalable SaaS platform for coaching institutes to manage student profiles, class schedules, attendance (with optional biometric integration), payment collection, and marketing outreach.

**Key Features**:
- **Student Profiles**: Manage student details, including batch, schedule, parent phone, and class enrollments
- **Attendance**: Optional biometric-based attendance with real-time SMS notifications to parents
- **Class Management**: Schedule classes, assign teachers, manage enrollments
- **Marketing Module**: Store and manage parent contacts for targeted outreach
- **Exam Module**: Generate exam schedules and reports (to be detailed later)
- **Accounts**: Handle payment collection and expense tracking

## Technology Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Next.js v15+ with App Router
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **UI**: shadcn/ui, React, Tailwind CSS
- **Authentication**: NextAuth.js
- **Package Manager**: npm
- **Validation**: Zod

## Database Schema

### Core Tables
```sql
User (System Access Only)
  - id, email, role (Admin, Teacher, Staff), created_at, updated_at

Teacher (Profile)
  - id, first_name, last_name, email, phone_number, subject, qualifications
  - join_date, status, user_id (nullable), timestamps

Student (Profile)
  - id, first_name, last_name, email, phone_number
  - parent_name, parent_phone, date_of_birth, address
  - enrollment_date, status, sms_enabled, timestamps

Class
  - id, name, schedule_time, teacher_id (→Teacher), capacity, status, timestamps

Enrollment
  - id, student_id (→Student), class_id, enrollment_date, status, timestamps

Attendance
  - id, student_id (→Student), class_id, timestamp
  - entry_type (Entry/Exit), device_id, timestamps

BiometricDevice
  - id, name, api_endpoint, api_key, status, timestamps

SmsLog
  - id, recipient_phone, message_content, status, cost, timestamps

MarketingContact
  - id, parent_name, phone_number, query_details, last_contacted, timestamps
```

## Access Control Architecture

**Key Principle**: Separate system access (authentication) from entity profiles (data management).

### Access Model
- **User Table**: Only for individuals who need to log in (Admin, Teacher, Staff)
- **Teacher Table**: All teacher profiles, regardless of portal access
- **Student Table**: All student profiles (no portal access)

### Permission Matrix
| Action | Admin | Teacher (portal) | Teacher (no access) |
|--------|-------|------------------|---------------------|
| Login to portal | ✅ | ✅ | ❌ |
| Create Teacher profiles | ✅ | ✅ | ❌ |
| Create Student profiles | ✅ | ✅ | ❌ |
| Send invitations | ✅ | ❌ | ❌ |
| Mark attendance | ✅ | ✅ (own classes) | ❌ |
| View reports | ✅ | ✅ (own classes) | ❌ |

## Directory Structure

```
/app          # Next.js routes (admin and user interfaces)
/lib          # Shared utilities, API clients, backend logic
/components   # Shared UI components (shadcn/ui based)
/prisma       # Database schema and migrations
```

## Coding Standards

- **Formatting**: Use prettier (enforced via `npm run format`)
- **Naming Conventions**:
  - Variables/functions: camelCase
  - React components: PascalCase
  - Files: kebab-case
- **API Design**: Next.js API routes for type-safe endpoints
- **Error Handling**: Try/catch for async operations, validate inputs with Zod

### API Response Structure

API responses return data directly, not wrapped in a `data` property. When consuming APIs:

```javascript
// Wrong approach
const response = await fetch("/api/teachers");
const data = await response.json();
setTeachers(data.data || []); // ❌ Don't use data.data

// Right approach
const response = await fetch("/api/teachers");
const data = await response.json();
setTeachers(data || []); // ✅ Use data directly
```

## Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run format       # Format code with prettier

# Database
npx prisma db push   # Sync schema with Supabase
npx prisma studio    # Open Prisma Studio

# Components
npx shadcn-ui@latest add [component-name]  # Add shadcn component

# Dependencies
npm install [package]        # Add dependency
npm install --save-dev [package]  # Add dev dependency
```

## Biometric Integration

- **Challenge**: Different fingerprint devices have proprietary APIs
- **Solution**: Use middleware layer to abstract vendor differences
- **Key Features**:
  - Store device metadata in BiometricDevices table
  - Implement offline queuing for sync issues
  - Handle errors gracefully with manual attendance fallback

## SMS Integration

- **Provider**: Twilio or equivalent
- **Features**:
  - Event-driven architecture with Redis queue
  - Log all attempts in SmsLogs table
  - Rate limiting and retry logic
  - Cost tracking for billing

## Shell Command Policy

For commands with large output (build, test, verbose commands):
1. Redirect output to file: `command > /tmp/output.txt 2>&1`
2. Check exit code
3. If exit code is 0: "Command successful"
4. If non-zero: Read output file and propose fix

## Important Notes

- Always update `prisma/schema.prisma` first, then run `npx prisma db push`
- Feature branches required with conventional commits
- Use mock APIs for biometric testing during development
- Student data privacy is critical - ensure compliance with data protection laws