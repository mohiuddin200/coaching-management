# GEMINI.MD: AI Collaboration Guide for Coaching Management Software

This document provides essential context for AI models interacting with the Coaching Management Software SaaS project. Adhering to these guidelines ensures consistency, code quality, and alignment with the project’s goals.

## 1\. Project Overview & Purpose

- **Primary Goal:** Develop a scalable SaaS platform to manage coaching institutes, enabling efficient handling of student profiles, class schedules, attendance (with optional biometric integration), payment collection, and marketing outreach. The system prioritizes user role-based access control (RBAC), data privacy, and real-time functionality.
- **Business Domain:** The application serves educational coaching institutes, streamlining operations such as student management, attendance tracking, financial transactions, and targeted marketing to parents. Key features include biometric-based attendance with optional SMS notifications and a marketing module for retargeting prospective clients.
- **Key Features**:

  - **Student Profiles**: Manage student details, including batch, schedule, parent_phone, and class enrollments.
  - **Accounts**: Handle payment collection and expense tracking (to be detailed in later phases).
  - **Attendance**: Optional biometric-based attendance system with fingerprint machines, sending real-time SMS notifications to parents (opt-in feature with usage-based pricing).
  - **Exam Module**: Placeholder for generating exam-related functionality (to be defined later).
  - **Marketing Module**: Store and manage parent contact details for periodic retargeting with batch updates.

### Challenges

- **Biometric Integration**: Interfacing with various fingerprint devices, handling API inconsistencies, and ensuring offline sync capabilities.
- **Scalability**: Managing high volumes of attendance data and SMS notifications efficiently.
- **Privacy**: Ensuring compliance with data protection regulations (e.g., GDPR, local laws) for student and parent data.
- **Cost Management**: Implementing usage-based pricing for optional features like SMS notifications.

## 2\. Core Technologies & Stack

- **Languages**: TypeScript
- **Frameworks & Runtimes**:

  - **Runtime**: Node.js (v20+)
  - **Web Framework**: Next.js (v15+, App Router)
  - **Backend**: REST API with Next.js API routes

- **Databases**: PostgreSQL (via Supabase for managed hosting and real-time capabilities)
- **Key Libraries/Dependencies**:

  - **UI**: shadcn/ui, React, Tailwind CSS
  - **ORM**: Prisma for database interactions
  - **Authentication**: NextAuth.js
  - **Real-time**: Socket.io or Server-Sent Events for attendance updates
  - **SMS Integration**: Twilio or equivalent provider
  - **Error Monitoring**: Sentry (@sentry/nextjs)
  - **Schema Validation**: zod

- **Storage**: AWS S3 for file uploads (e.g., student documents, reports)
- **Caching**: Redis for performance optimization
- **Package Manager**: npm

## 3\. Architectural Patterns

- **Overall Architecture**: Full-stack application with a type-safe, modular design.

  - **Frontend**: Next.js application using App Router for admin and user-facing interfaces.
  - **Backend**: REST API with Prisma for database operations, integrated with biometric devices and SMS providers.
  - **Real-time**: WebSockets or Server-Sent Events for live attendance updates and notifications.

- **Directory Structure Philosophy**:

  - /app: Contains Next.js routes for admin and user-facing interfaces.
  - /lib: Shared utilities, API clients, and backend logic.
  - /components: Shared UI components based on shadcn/ui.
  - /prisma: Database schema and migrations.

- **Database Schema** (Preliminary):

  - **Users**: id, email, role (Admin, Teacher, Student, Staff), first_name, last_name, phone_number, parent_phone, sms_enabled, timestamps
  - **Classes**: id, name, schedule_time, teacher_id, capacity, status, timestamps
  - **Enrollments**: id, user_id, class_id, enrollment_date, status, timestamps
  - **Attendance**: id, user_id, class_id, timestamp, entry_type (Entry/Exit), device_id, timestamps
  - **BiometricDevices**: id, name, api_endpoint, api_key, status, timestamps
  - **SmsLogs**: id, recipient_phone, message_content, status, cost, timestamps
  - **MarketingContacts**: id, parent_name, phone_number, query_details, last_contacted, timestamps

## 4\. Coding Conventions & Style Guide

- **Formatting**: Use prettier for consistent code formatting, enforced via format script in package.json.
- **Naming Conventions**:

  - Variables, functions, database fields: camelCase (e.g., studentProfile, sendSmsNotification)
  - React Components: PascalCase (e.g., StudentProfileCard)
  - Files: kebab-case (e.g., student-profile.tsx)

- **API Design**: Use Next.js API routes for type-safe endpoints. Backend functions should be modular and reusable.
- **Error Handling**: Implement Sentry for error monitoring. Use try...catch for async operations and validate inputs with zod.
- **Biometric Integration**: Standardize API calls to fingerprint devices using a middleware layer to handle vendor-specific protocols.
- **SMS Notifications**: Use event-driven architecture with a queue (e.g., Redis) to manage high-volume SMS sending.

## 5\. Key Files & Entrypoints

- **Main Entrypoints**:

  - App: app/layout.tsx, app/page.tsx
  - Backend Logic: app/api/ (for API routes)
  - Database Schema: prisma/schema.prisma

- **Configuration**:

  - App: next.config.mjs
  - Database: prisma/schema.prisma
  - Tooling: .eslintrc.js, tsconfig.json

- **CI/CD Pipeline**: To be defined (e.g., GitHub Actions in .github/workflows). Include linting, testing, and deployment steps.

## 6\. Development & Testing Workflow

- npm run devRuns Next.js dev server, Supabase local database, and any real-time services.
- npm run buildBuilds the app for production.
- **Testing**: Establish a testing framework (e.g., Jest or Vitest). Write unit tests for backend logic (e.g., attendance processing) and integration tests for biometric and SMS APIs.
- **Biometric Integration Workflow**:

  1.  Mock biometric device APIs for local testing.
  2.  Use environment variables for API keys and endpoints.
  3.  Implement offline queuing for attendance data sync.

- **SMS Integration Workflow**:

  1.  Use Twilio or equivalent SDK for SMS sending.
  2.  Log all SMS attempts and costs in SmsLogs table.
  3.  Implement rate-limiting and retry logic for failed sends.

## 7\. Specific Instructions for AI Collaboration

- **Contribution Guidelines**: Create feature branches and submit pull requests. Follow Conventional Commits (e.g., feat: add biometric integration, fix: resolve SMS queue issue).
- \# Add a librarynpm install zod# Add a dev dependencynpm install --save-dev prisma
- **Backend Modifications**:

  1.  Update prisma/schema.prisma for database changes.
  2.  Run npx prisma db push to sync schema with Supabase.
  3.  Update API routes in app/api/.

- npx shadcn-ui@latest add buttonAdds components to the components directory.
- **Biometric Integration**:

  - Use a middleware layer to normalize API responses from different fingerprint devices.
  - Store device metadata in BiometricDevices table.
  - Handle errors gracefully with fallbacks (e.g., manual attendance entry).

- **SMS Notifications**:

  - Use Redis for queuing high-volume SMS tasks.
  - Log costs and statuses for billing transparency.
  - Allow institutes to toggle SMS features via NotificationPreferences.

## 8\. Agent Directives: Shell Command Execution Policy

### High-Volume Command Filtering

To conserve tokens and reduce latency for commands with large outputs (e.g., build logs, test runs):

1.  npm run build > /tmp/build_output.txt 2>&1
2.  **NEVER** include raw output in chat context.
3.  **CONDITIONAL READING**: Read the output file only if the command returns a non-zero exit code.
4.  If the exit code is 0, respond with: "Command successful: \[Brief summary of command intent\]."
5.  If non-zero, read /tmp/build_output.txt and propose a fix based on the log.

## Additional Notes for AI Collaboration

- **Biometric Integration Challenges**:

  - **Vendor Variability**: Different fingerprint devices have proprietary APIs. Use a middleware layer to abstract these differences, mapping responses to a standard format.
  - **Offline Sync**: Implement a local queue (e.g., IndexedDB or Redis) to store attendance data during network issues, syncing when connectivity is restored.
  - **Security**: Encrypt biometric data in transit and at rest, ensuring compliance with data protection laws.
  - **Suggestions**: Consider SDKs like ZKTeco or Suprema for common fingerprint devices, and test with mock APIs during development.

- **Exam Module Suggestions**:

  - Generate exam schedules based on class enrollments.
  - Allow teachers to upload question banks and auto-generate randomized tests.
  - Provide student performance reports with export options (PDF/Excel).

- **Marketing Module**:

  - Store parent contact details in MarketingContacts table.
  - Implement a cron job to send periodic SMS/email campaigns with batch updates.
  - Use analytics to track campaign engagement (e.g., open rates, conversions).

- **Next Steps**:

  - Clarify requirements for the exam module to prioritize features.
  - Define payment collection and expense tracking workflows for the accounts feature.
  - Evaluate scaling needs for PostgreSQL and Supabase usage.

# 9. Agent Directives: Shell Command Execution Policy

## High-Volume Command Filtering

To conserve tokens and reduce latency, when executing any shell command that may produce large output (e.g., test runners, build logs, verbose commands, or long scripts):

1.  **ALWAYS** redirect standard output and standard error to a file in the temporary directory (e.g., `pnpm run test > output.txt 2>&1`).
2.  **NEVER** allow the raw, unpiped output to enter the chat context.
3.  **CONDITIONAL READING:** You must only read the content of the file if the command returns a **non-zero exit code**.
4.  If the exit code is **zero (0)**, simply state: "Command successful" and provide a brief, one-sentence summary of the command's intent.
5.  If the exit code is **non-zero (>0)**, read the contents of the file and use that specific log data to propose a fix.

### **Phase 1: Foundation & Setup (Weeks 1-3)**

**Week 1: Environment Setup**

- \[x\] Day 1-2: Project initialization (Next.js, TypeScript, Tailwind)
- \[x\] Day 3-4: Database setup (PostgreSQL, Prisma configuration)
- \[ \] Day 5-7: Basic authentication setup (NextAuth.js)

**Week 2: Core Database Design**

- \[ \] Day 1-3: Design and implement Prisma schema
- \[ \] Day 4-5: Create database migrations
- \[ \] Day 6-7: Set up basic CRUD operations with Prisma

**Week 3: UI Foundation**

- Day 1-3: Install and configure shadcn/ui components
- Day 4-5: Create layout components and navigation
- Day 6-7: Build authentication pages (login/register)

_Risk Buffer: +2-3 days for ORM learning curve_

### **Phase 2: User Management System (Weeks 4-6)**

**Week 4: User CRUD Operations**

- Day 1-3: Build user registration/profile forms
- Day 4-5: Implement role-based access control
- Day 6-7: Create user listing and search functionality

**Week 5: Teacher Management**

- Day 1-3: Teacher-specific profile features
- Day 4-5: Teacher dashboard with assigned classes
- Day 6-7: Teacher management for admins

**Week 6: Student Management**

- Day 1-3: Student enrollment system
- Day 4-5: Student dashboard and profile
- Day 6-7: Parent contact integration (if needed)

### **Phase 3: Class Management System (Weeks 7-9)**

**Week 7: Class CRUD**

- Day 1-3: Create class creation forms
- Day 4-5: Class scheduling interface
- Day 6-7: Class listing and filtering

**Week 8: Class-Teacher Assignment**

- Day 1-3: Teacher assignment functionality
- Day 4-5: Schedule conflict detection (basic)
- Day 6-7: Class capacity management

**Week 8.5: SMS Foundation** _(Add 3-4 days)_

- Day 1-2: Local SMS provider API setup and configuration   
- Day 3-4: Create SMS templates system and basic SMS service

**Week 9: Student Enrollment**

- Day 1-3: Student-class enrollment system
- Day 4-5: Enrollment management dashboard
- Day 6-7: Class roster views

### **Phase 4: Basic Attendance System (Weeks 10-12)**

**Week 10: Manual Attendance**

- Day 1-3: Manual attendance marking interface
- Day 4-5: Attendance recording backend
- Day 6-7: Basic attendance reports

**Week 11: Biometric API Integration Prep**

- Day 1-3: Research and document biometric device APIs
- Day 4-5: Create API middleware structure
- Day 6-7: Mock biometric data for testing.

**Week 11.5: SMS Integration** _(Add 4-5 days)_

- Day 1-2: Connect attendance system to SMS triggers
- Day 3-4: Implement admin bulk SMS functionality
- Day 5: SMS logging and basic tracking

**Week 12: Biometric Integration**

- Day 1-4: Implement actual biometric API integration
- Day 5-7: Handle error cases and fallbacks

_High Risk Week: May need additional support/research time_

### **Phase 5: Reporting & Polish (Weeks 13-16)**

**Week 13: Basic Reporting**

- Day 1-3: Attendance summary reports
- Day 4-5: Class performance metrics
- Day 6-7: Export functionality (CSV/PDF)

**Week 14: Dashboard Enhancement**

- Day 1-3: Admin dashboard with key metrics
- Day 4-5: Teacher dashboard improvements
- Day 6-7: Student/parent view optimisation.

**Week 14.5: SMS Enhancement** _(Add 2-3 days)_

- Day 1-2: SMS preferences management for users
- Day 3: SMS analytics and delivery tracking dashboard

**Week 15: Testing & Bug Fixes**

- Day 1-4: Comprehensive testing of all features
- Day 5-7: Bug fixes and performance optimisation

**Week 16: Deployment & Final Polish**

- Day 1-3: Production deployment setup
- Day 4-5: Security hardening and final testing
- Day 6-7: Documentation and handover
