Plan: Exam Management System for Teachers
An exam system where teachers create and manage exams with scheduling, question paper links, and student results tracking. The system will integrate with existing levels, subjects, and students using established patterns.

Steps
Create database schema with three models: schema.prisma

Exam model with type (Monthly/Weekly/OpenBook/Midterm/Final/Quiz), subject relation, teacher relation, marks (total & passing), exam date/time, Google Drive URLs for question paper/answer key, status (Scheduled/InProgress/Completed/Cancelled), and soft-delete fields
ExamLevel junction table for many-to-many Exam↔Level relationship (exams can target multiple class levels)
ExamResult model tracking student performance (marks obtained, grade, attendance, remarks) with unique constraint per exam-student pair
Build REST API endpoints following api patterns:

/api/exams with GET (filter by level/subject/teacher/status/date) and POST (create with validation)
/api/exams/[id] with GET (include results), PUT (update), DELETE (soft-delete)
/api/exams/[id]/results with GET/POST for bulk grade entry and PUT for individual student results
Implement teacher authorization (teachers access only their subject exams, admins access all)
Create exam management UI at src/app/exams/page.tsx:

CreateExamDialog component with cascading selects (level→subject), multi-select for levels, exam type dropdown, marks inputs, date/time pickers, Google Drive URL field, and description textarea
ExamsListTable with filters (level, subject, status, date range) showing exam name, type, subject, levels, date, status with actions
ExamDetailsDialog displaying full exam info with edit/delete/grade buttons
GradeExamDialog with student list (from selected levels) and input fields for marks/grade/remarks per student
Add teacher dashboard integration in page.tsx:

Upcoming exams widget showing next 5 exams for teacher's subjects
Quick stats card (total exams, pending grading count)
"Create Exam" quick action button
Implement soft-delete utilities in soft-delete.ts:

Add examFindMany() helper auto-filtering soft-deleted exams
Add softDeleteExam() cascading to exam results with appropriate DeleteReason enum values
Create archive view at page.tsx for deleted exams with restore functionality
Further Considerations
Level targeting strategy: Many-to-many (ExamLevel junction) allows combined exams (e.g., Class 9+10 together) vs simpler single levelId approach. Recommend many-to-many for flexibility, but single-level is easier initially. Which fits your use case?

Enhanced features: Consider adding exam templates (reuse exam structure), automatic grade calculation (marks→grade conversion rules), bulk import results via CSV, student/parent view for results, exam performance analytics dashboard, and notifications (upcoming exams, results published). Priority?

Authorization granularity: Should teachers only create exams for subjects they teach (requires teacher-subject relationship) or any subject? Current schema shows teachers linked to ClassSections which link to subjects—verify this relationship.