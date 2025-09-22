# Coaching Management Software

A SaaS platform for managing coaching institutes, handling users, classes, attendance with biometric integration, and future financial management capabilities.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Biometric Integration](#biometric-integration)
- [SMS Integration](#sms-integration)
- [Development Phases](#development-phases)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Management**: Role-based access control (Admin, Teachers, Students, Employees)
- **Class Management**: Scheduling with conflict detection, enrollment, and capacity management
- **Attendance Tracking**: Biometric integration for real-time attendance
- **SMS Notifications**: Alerts for attendance, class updates, and fee reminders
- **Future Scope**: Financial management system for payments and invoicing
- **Scalability**: Designed for high concurrency with caching and indexing
- **Security**: GDPR-compliant biometric data handling, encrypted storage, and audit trails

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes (or tRPC for type safety), Prisma ORM
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: NextAuth.js or Auth0
- **Real-time**: Socket.io or Server-Sent Events
- **Storage**: AWS S3 for documents/photos
- **Caching**: Redis for session data
- **Monitoring**: System health monitoring and alerting

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/coaching-management.git
cd coaching-management
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
SMS_PROVIDER_API_KEY=your_sms_provider_key
BIOMETRIC_API_KEY=your_biometric_device_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev
```

### 5. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- **Database**: Configure PostgreSQL via Supabase or a local instance. Update `DATABASE_URL` in `.env.local`
- **Authentication**: Set up NextAuth.js or Auth0 for user authentication. Configure providers in `pages/api/auth/[...nextauth].ts`
- **Biometric Devices**: Register device API endpoints and keys in the `BiometricDevices` table
- **SMS Provider**: Configure SMS provider (e.g., Twilio) in `SmsSettings` table and update `.env.local` with API keys
- **Caching**: Set up Redis for session caching and configure connection in `.env.local`

## Database Schema

The database schema includes the following core tables:

- **Users**: Stores user details (email, role, contact info)
- **Classes**: Manages class schedules, teacher assignments, and capacity
- **Enrollments**: Tracks student-class relationships
- **Attendance**: Records biometric-based attendance data
- **BiometricDevices**: Stores device configurations
- **SMS Tables**: `SmsTemplates`, `SmsLogs`, `SmsSettings`, `NotificationPreferences`, `SmsQueues` for handling SMS notifications

Run `npx prisma studio` to view and manage the database schema.

## API Endpoints

### User Management

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Fetch user details
- `PUT /api/users/:id` - Update user information

### Class Management

- `POST /api/classes` - Create a new class
- `GET /api/classes` - List all classes with filters
- `POST /api/enrollments` - Enroll a student in a class

### Attendance

- `POST /api/attendance` - Record attendance via biometric data
- `GET /api/attendance` - Fetch attendance records

### SMS

- `POST /api/sms/send` - Send an SMS notification
- `GET /api/sms/logs` - Retrieve SMS logs

## Biometric Integration

- **Architecture**: Uses API Gateway pattern for device communication
- **Webhook Support**: Configurable webhooks for real-time attendance updates
- **Offline Handling**: Stores attendance locally on devices and syncs when online
- **Error Handling**: Retries failed API calls and logs errors in `BiometricDevices`

## SMS Integration

### Triggers

- Attendance alerts (e.g., student absent after 15 minutes)
- Daily attendance summaries for parents
- Fee reminders and class schedule updates

### Features

- **Queue System**: Uses `SmsQueues` for batch processing and retries
- **Providers**: Configurable via `SmsSettings` (e.g., Twilio, AWS SNS)

## Development Phases

### Phase 1: Core Foundation

- Set up Next.js, authentication, and database schema
- Implement user and class CRUD operations
- Build responsive dashboard UI

### Phase 2: Biometric Integration

- Develop middleware for biometric device APIs
- Implement real-time attendance tracking and analytics

### Phase 3: Advanced Features

- Add class scheduling with conflict detection
- Implement SMS notifications and financial management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License.