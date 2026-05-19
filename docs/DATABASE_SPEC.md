# DATABASE_SPEC.md

## Data Principles

1. Every tenant-specific business table must include `tenantId`.
2. Server-side code must always filter by tenantId.
3. Critical mutations must use transactions.
4. Critical operations must write audit logs.
5. Do not rely on client-side checks for data isolation.

## Core Models

```txt
Tenant
Campus
Room
User
Membership
StudentProfile
GuardianProfile
StudentGuardian
TeacherProfile
Subject
Grade
Term
CourseProduct
ClassGroup
ClassStudent
Enrollment
CourseAccount
Lesson
Schedule
ScheduleChangeLog
Attendance
CheckIn
CourseConsumption
Resource
ResourcePermission
Homework
HomeworkSubmission
HomeworkCorrection
KnowledgePoint
Question
ErrorRecord
ErrorCorrection
LearningReport
TeacherFeedback
Order
Payment
Refund
Contract
Invoice
Notification
AuditLog
ComplianceRule
```

## Required Base Fields

Most models:

```txt
id
createdAt
updatedAt
```

Business models:

```txt
tenantId
status
createdById optional
updatedById optional
```

Critical mutation log:

```txt
operatorId
reason
beforeJson
afterJson
```

## Role Model

Recommended roles:

```txt
SUPER_ADMIN
ORG_ADMIN
CAMPUS_ADMIN
ACADEMIC
FINANCE
TEACHER
STUDENT
PARENT
```

A user can have multiple memberships if needed.

## Relationship Notes

### Student and Guardian

- A student can have multiple guardians.
- A guardian can manage multiple students.
- Parent portal queries must go through StudentGuardian.

### Teacher

- TeacherProfile belongs to User.
- Teacher can be linked to subjects and grades.
- Teacher can only see assigned classes and lessons.

### Course and Class

- CourseProduct defines what is sold.
- ClassGroup is the actual teaching group.
- Enrollment links Student to CourseProduct/ClassGroup.
- CourseAccount tracks hours.

### Schedule

Schedule should link:

- tenant
- campus
- room
- classGroup
- teacher
- lesson optional
- startAt
- endAt
- status

ScheduleChangeLog records reschedule/cancel/make-up operations.

### Attendance and Course Consumption

Attendance:

- one student per lesson/schedule
- present/late/excused/absent/make_up

CourseConsumption:

- created only after confirmed attendance or authorized manual operation
- cannot duplicate deduction for same schedule/student
- must be transactional

### Resource

Resource can bind to:

- course product
- class group
- lesson/schedule

ResourcePermission controls student visibility.

### Homework

Homework can bind to:

- class group
- schedule/lesson
- individual student if needed

Submission history must be preserved.

### Mistake Notebook

ErrorRecord belongs to a student and can link to:

- question
- homework submission
- assessment result
- manual source

Status:

```txt
PENDING_CORRECTION
CORRECTED
MASTERED
```

Reason tags:

```txt
CONCEPT_UNCLEAR
CALCULATION_ERROR
READING_ERROR
METHOD_ERROR
CARELESS
OTHER
```

## Suggested Indexes

Add indexes for:

- tenantId
- tenantId + status
- tenantId + createdAt
- tenantId + studentId
- tenantId + teacherId
- tenantId + classGroupId
- schedule startAt/endAt
- attendance scheduleId/studentId unique
- course consumption scheduleId/studentId unique

## Audit Log Events

Audit these:

- role change
- student creation/update
- teacher creation/update
- enrollment
- schedule create/update/cancel
- attendance update
- course consumption create/reverse
- payment create/update
- refund create/approve
- contract update
- compliance rule update
