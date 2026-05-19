# CODEX_TASKS.md

This file defines the implementation plan for EduOS. Codex must proceed by task ID order unless explicitly instructed otherwise.

## Stage 0: Project Initialization and Constraints

### T00 Project initialization

Goal:
Create a runnable Next.js project with TypeScript, Tailwind CSS, pnpm, ESLint, Prettier, and a clean feature-oriented folder structure.

Must create:

```txt
app/
components/
features/
lib/
prisma/
tests/
docs/
```

Acceptance:
- `pnpm dev` starts.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- No business features yet.

---

### T01 Codex project constraints

Goal:
Add project instruction files.

Must create or update:
- `AGENTS.md`
- `docs/CODEX_TASKS.md`
- `docs/REVIEW_CHECKLIST.md`
- `docs/UI_SPEC.md`
- `docs/DATABASE_SPEC.md`
- `docs/PRODUCT_SPEC.md`

Acceptance:
- All files are present.
- Codex can summarize the rules.
- No business features yet.

---

### T02 UI foundation

Goal:
Install and configure shadcn/ui and base reusable components.

Must implement:
- Button
- Card
- Input
- Label
- Select
- Dialog
- Badge
- Tabs
- Table wrapper
- Toast/notification
- Form wrapper
- Empty state
- Loading state
- Error state

Acceptance:
- Components are reusable.
- Styling is modern and consistent.
- Mobile layout does not break.

---

### T03 App layouts

Goal:
Create route groups and layouts.

Must implement:

```txt
app/(auth)/login
app/(dashboard)/dashboard
app/(mobile)/student
app/(mobile)/teacher
app/(mobile)/parent
```

Desktop layout:
- sidebar
- topbar
- search area
- current campus selector placeholder
- notification icon placeholder

Mobile layout:
- top summary area
- bottom navigation

Acceptance:
- Routes render.
- Responsive behavior works.
- No real auth yet unless already implemented.

---

### T04 Dashboard demo

Goal:
Create a beautiful dashboard using mock data only for visual preview.

Must include cards:
- 今日课程
- 今日到课率
- 本月课消
- 待批改作业
- 低课时预警
- 本周排课

Acceptance:
- Modern SaaS look.
- Clear hierarchy.
- Uses reusable cards and charts where appropriate.
- Mock data clearly isolated and easy to replace.

---

## Stage 1: Database, Auth, RBAC

### T05 Prisma initialization

Goal:
Add Prisma and PostgreSQL config.

Must implement:
- Prisma client setup
- `.env.example`
- initial schema
- seed script placeholder

Acceptance:
- `pnpm prisma validate` passes.
- Database URL is not hard-coded.

---

### T06 Multi-tenant foundation models

Goal:
Create base data model.

Models:
- Tenant
- Campus
- Room
- User
- Role
- Membership

Acceptance:
- All tenant data has `tenantId` where applicable.
- User can belong to one or more tenants through Membership.
- Room belongs to Campus and Tenant.
- Schema validates.

---

### T07 Auth system

Goal:
Implement login/logout/session foundation.

Must implement:
- login page
- password hashing
- session handling
- logout
- current user helper

Acceptance:
- Unauthenticated users cannot access protected dashboard.
- Passwords are never stored in plain text.
- Session user has role and tenant context.

---

### T08 RBAC permission system

Goal:
Create server-side permission checking.

Roles:
- SUPER_ADMIN
- ORG_ADMIN
- CAMPUS_ADMIN
- ACADEMIC
- FINANCE
- TEACHER
- STUDENT
- PARENT

Must implement:
- `lib/rbac/permissions.ts`
- `lib/rbac/require-permission.ts`
- permission matrix

Acceptance:
- Student cannot access teacher/admin/finance routes.
- Teacher cannot access finance reports.
- Finance cannot mutate scheduling unless explicitly allowed.

---

### T09 Route protection

Goal:
Protect route groups by auth and role.

Acceptance:
- Student route only accepts STUDENT.
- Teacher route only accepts TEACHER.
- Parent route only accepts PARENT.
- Dashboard route accepts staff/admin roles only.
- Unauthorized access shows clear error or redirects.

---

### T10 Audit log foundation

Goal:
Create audit logs.

Model:
- AuditLog

Fields:
- id
- tenantId
- actorUserId
- action
- entityType
- entityId
- beforeJson
- afterJson
- reason
- createdAt

Acceptance:
- Utility function exists.
- Critical operations can call it.
- No sensitive secrets logged.

---

## Stage 2: People and Campus Management

### T11 Student management

Goal:
Build student CRUD.

Fields:
- name
- gender optional
- birthday optional
- grade
- school
- status
- notes

UI:
- list
- search
- filters
- create/edit dialog
- detail page

Acceptance:
- Tenant-scoped.
- Staff can manage students.
- Students cannot see other students.
- Loading/empty/error states exist.

---

### T12 Guardian relationship management

Goal:
Bind guardians to students.

Models:
- GuardianProfile
- StudentGuardian

Acceptance:
- One student can have multiple guardians.
- One guardian can bind multiple students.
- Parent role only sees bound students.

---

### T13 Teacher management

Goal:
Build teacher CRUD.

Fields:
- name
- phone
- email optional
- subjects
- grades
- employment status
- available time notes
- qualification file placeholder

Acceptance:
- Staff can manage teachers.
- Teacher can only view own profile from teacher portal.

---

### T14 Campus and classroom management

Goal:
Manage campuses and rooms.

Fields:
- campus name
- address
- business hours
- room name
- capacity
- equipment
- status

Acceptance:
- Scheduling can later select campus and room.
- Students cannot view room allocation data.

---

### T15 User account creation and invitation

Goal:
Allow staff to create accounts for teachers, students, and guardians.

Acceptance:
- Role is assigned correctly.
- Initial password or invitation flow exists.
- Audit log is written for role creation.

---

## Stage 3: Course, Class, Enrollment

### T16 Subject and grade configuration

Goal:
Create subject, grade, and term configuration.

Models:
- Subject
- Grade
- Term

Acceptance:
- Config is tenant-scoped.
- Staff can add math, Chinese, English, physics, chemistry, biology, etc.

---

### T17 Course product management

Goal:
Build CourseProduct CRUD.

Fields:
- name
- subject
- grade
- course type
- class type
- total hours
- price
- description
- status

Course types:
- 一对一
- 小班课
- 大班课
- 晚辅
- 冲刺班

Acceptance:
- Staff can manage courses.
- Student can only see enrolled courses.

---

### T18 Class group management

Goal:
Create ClassGroup.

Fields:
- courseProductId
- primaryTeacherId
- campusId
- capacity
- status
- start/end date

Acceptance:
- Can add/remove students.
- Cannot exceed capacity without explicit warning.
- Teacher sees own class group.

---

### T19 Enrollment flow

Goal:
Enroll student into course/class.

Acceptance:
- Creates Enrollment.
- Creates or updates CourseAccount.
- Student can see enrolled course.
- Audit log written.

---

### T20 Course account foundation

Goal:
Track purchased/gift/used/frozen/remaining hours.

Model:
- CourseAccount

Acceptance:
- Remaining hours calculated safely.
- No negative balance unless specifically allowed by config.
- Finance/staff can view; student/parent can view own balance only.

---

## Stage 4: Scheduling

### T21 Schedule data model

Goal:
Create scheduling models.

Models:
- Lesson
- Schedule
- ScheduleChangeLog

Support:
- single lesson
- recurring lesson
- reschedule
- cancellation
- make-up lesson

Acceptance:
- Tenant-scoped.
- Links class, teacher, campus, room, start/end time.
- Status is explicit.

---

### T22 Scheduling calendar UI

Goal:
Create schedule calendar.

Views:
- day
- week
- list

Filters:
- campus
- teacher
- classroom
- class group

Acceptance:
- Staff/admin can view scheduling calendar.
- Students cannot see this internal calendar.

---

### T23 Single scheduling flow

Goal:
Create a lesson schedule manually.

Acceptance:
- Staff selects class, teacher, room, time.
- Schedule appears on calendar.
- Audit log written.

---

### T24 Batch scheduling flow

Goal:
Create recurring schedule generation.

Acceptance:
- Staff can generate weekly recurring lessons.
- Preview before submit.
- Conflict detection runs before commit.

---

### T25 Conflict detection

Goal:
Implement conflict engine.

Detect:
- teacher time conflict
- room time conflict
- student time conflict
- campus business hours conflict
- class group duplicate lesson conflict

Acceptance:
- Conflicting schedule cannot be created.
- Error message lists exact conflict reason.
- Unit tests cover conflict cases.

---

### T26 Reschedule, cancel, make-up lesson

Goal:
Support changing schedules.

Acceptance:
- Original record is preserved or change log records before/after.
- Reason is required.
- Audit log written.

---

### T27 Student and teacher timetable

Goal:
Expose limited schedules to student/teacher portals.

Acceptance:
- Student only sees own lessons.
- Teacher only sees own lessons.
- Parent only sees bound students' lessons.
- No room allocation details shown to students unless product explicitly allows it.

---

## Stage 5: Attendance, Check-in, Course Consumption

### T28 Attendance model

Goal:
Create Attendance and CheckIn models.

Statuses:
- PRESENT
- LATE
- EXCUSED
- ABSENT
- MAKE_UP

Acceptance:
- One attendance record per student per lesson.
- Unique constraint prevents duplicates.

---

### T29 Teacher attendance flow

Goal:
Teacher takes attendance for a lesson.

Acceptance:
- Teacher only takes attendance for own lesson.
- Staff can assist if authorized.
- Attendance change writes audit log.

---

### T30 Student check-in flow

Goal:
Student can check in for today's lesson.

Acceptance:
- Student cannot check into other student's lesson.
- Check-in time is recorded.
- Teacher/staff can confirm.

---

### T31 QR code check-in

Goal:
Generate lesson QR code for check-in.

Acceptance:
- QR code expires.
- Token is not guessable.
- Only enrolled students can check in.

---

### T32 Automatic course consumption

Goal:
Deduct course hours after attendance confirmation.

Model:
- CourseConsumption

Acceptance:
- Deducts according to lesson duration or course rules.
- Duplicate deduction is impossible.
- Uses database transaction.
- Writes ledger and audit log.

---

### T33 Course consumption ledger

Goal:
Show deduction history.

Acceptance:
- Parent and student see only own ledger.
- Finance/staff can search by student/course/class.
- Balance is clear.

---

### T34 Abnormal cancellation/reversal

Goal:
Allow authorized staff to reverse mistaken course consumption.

Acceptance:
- Reason required.
- Balance restored.
- Audit log written.

---

## Stage 6: Course Resources

### T35 Resource model

Goal:
Create Resource and ResourcePermission models.

Types:
- PPT
- handout
- video
- audio
- worksheet
- answer
- explanation

Acceptance:
- Resource can bind to course, class, or lesson.
- Permission is explicit.

---

### T36 Resource library UI

Goal:
Build resource library.

Acceptance:
- Staff/teachers can upload metadata.
- Search and filters by subject, grade, type.
- UI has loading/empty/error states.

---

### T37 Resource permission

Goal:
Restrict student resource access.

Acceptance:
- Student only sees resources opened to their enrolled class/course.
- Teacher sees assigned resources.
- Unauthorized direct URL access is blocked.

---

### T38 Lesson resource binding

Goal:
Bind resources to lessons.

Acceptance:
- Teacher lesson page shows resources.
- Student page shows only opened resources.

---

### T39 Resource release control

Goal:
Allow pre-class/post-class release settings.

Acceptance:
- Not-yet-released resources are hidden from students.
- Staff/teacher can configure release time.

---

## Stage 7: Homework and Learning Check-in

### T40 Homework model

Goal:
Create Homework, HomeworkSubmission, HomeworkCorrection models.

Acceptance:
- Homework can bind class, lesson, or individual student.
- Submission history is preserved.

---

### T41 Teacher assigns homework

Goal:
Teacher creates homework.

Acceptance:
- Teacher can assign only to own class unless staff role.
- Due date and instructions required.

---

### T42 Student submits homework

Goal:
Student submits text/image/file metadata.

Acceptance:
- Student submits only own homework.
- Submission status updates.

---

### T43 Teacher corrects homework

Goal:
Teacher grades and comments.

Acceptance:
- Status supports corrected and needs revision.
- Parent/student can see correction.

---

### T44 Revision flow

Goal:
Student submits revision.

Acceptance:
- Historical submissions retained.
- Teacher can mark as completed.

---

### T45 Daily learning check-in

Goal:
Create daily learning tasks.

Types:
- reading
- memorization
- practice
- special training

Acceptance:
- Tracks streak and completion rate.

---

### T46 Homework reminders

Goal:
Show overdue and pending homework.

Acceptance:
- Student and parent see reminders.
- Teacher sees not-submitted list.

---

## Stage 8: Mistake Notebook and Question Bank

### T47 Knowledge point model

Goal:
Create knowledge point tree.

Acceptance:
- Supports subject, grade, chapter, parent-child hierarchy.

---

### T48 Question model

Goal:
Create question bank foundation.

Acceptance:
- Question has stem, answer, explanation, difficulty, type, knowledge points.

---

### T49 Error record model

Goal:
Create student mistake model.

Fields:
- studentId
- questionId optional
- source type
- knowledgePointId
- error reason
- status

Acceptance:
- Mistake belongs to one student.
- Status supports pending correction, corrected, mastered.

---

### T50 Teacher marks homework mistakes

Goal:
Create mistakes from homework correction.

Acceptance:
- Teacher can create mistake records for own students.

---

### T51 Student mistake notebook

Goal:
Student views own mistake notebook.

Acceptance:
- Student cannot view others' mistakes.
- Parent can view bound students' mistakes.

---

### T52 Error reason tags

Goal:
Support reason tags.

Tags:
- 概念不清
- 计算错误
- 审题错误
- 方法错误
- 粗心

Acceptance:
- Statistics by reason tag.

---

### T53 Mistake correction flow

Goal:
Student corrects mistakes.

Acceptance:
- Teacher confirms correction.
- Status updates to mastered when approved.

---

### T54 Weakness statistics

Goal:
Aggregate mistakes by knowledge point.

Acceptance:
- Teacher sees class high-frequency weak points.
- Student sees personal weak points.

---

## Stage 9: Reports and Dashboards

### T55 Lesson feedback

Goal:
Teacher writes lesson feedback.

Acceptance:
- Feedback includes content, performance, mastery, homework, suggestion.
- Parent can view relevant student feedback.

---

### T56 Student learning report

Goal:
Generate basic report.

Includes:
- attendance
- homework completion
- mistake count
- weak knowledge points
- teacher comments

Acceptance:
- Student/parent only sees own report.

---

### T57 Teacher class dashboard

Goal:
Teacher dashboard.

Acceptance:
- Shows today lessons, pending attendance, pending corrections, class weakness.

---

### T58 Principal dashboard

Goal:
Organization dashboard.

Metrics:
- active students
- new enrollments
- attendance rate
- course consumption
- remaining liability
- pending homework
- low balance warnings

Acceptance:
- Tenant/campus-scoped.

---

### T59 Renewal warning

Goal:
Generate renewal follow-up list.

Triggers:
- low course balance
- near course end
- low attendance
- high homework completion and good progress

Acceptance:
- Staff/admin can view follow-up list.

---

### T60 Notification center

Goal:
Implement notification model and UI.

Events:
- schedule created/changed
- attendance confirmed
- course consumption created
- homework assigned
- homework corrected
- report available

Acceptance:
- Different roles see relevant notifications only.

---

## Stage 10: Finance, Contract, Compliance

### T61 Order model

Goal:
Create order model.

Acceptance:
- Enrollment links to order where applicable.

---

### T62 Payment model

Goal:
Create payment ledger.

Acceptance:
- Finance can view payment records.
- Students/parents see own payment status if allowed.

---

### T63 Contract model

Goal:
Create contract template and signing status foundation.

Acceptance:
- Enrollment can require contract.

---

### T64 Refund model

Goal:
Create refund workflow.

Acceptance:
- Refund affects course account.
- Reason and approval required.
- Audit log written.

---

### T65 Teacher compensation model

Goal:
Create teacher compensation rules.

Acceptance:
- Can calculate by lesson, hour, student count, or class type.

---

### T66 Compliance rule configuration

Goal:
Configure compliance rules.

Rules:
- forbidden scheduling windows
- maximum prepaid hours
- contract required
- teacher qualification required

Acceptance:
- Rules can warn or block depending on severity.

---

### T67 Finance reports

Goal:
Basic finance reports.

Includes:
- payment
- refund
- course consumption revenue
- remaining course liability

Acceptance:
- Export CSV.
- Role protected.

---

## Stage 11: Portal Polish

### T68 Student portal home

Goal:
Create student mobile home.

Cards:
- today lessons
- pending homework
- check-in
- mistake notebook
- resources

Acceptance:
- Mobile-first.

---

### T69 Teacher portal home

Goal:
Create teacher mobile home.

Cards:
- today lessons
- pending attendance
- pending corrections
- attention students

Acceptance:
- Teacher can act quickly.

---

### T70 Parent portal home

Goal:
Create parent mobile home.

Cards:
- child timetable
- attendance
- course balance
- homework
- learning report
- payment/contract

Acceptance:
- Parent sees only bound children.

---

### T71 Institution navigation polish

Goal:
Polish sidebar and page grouping.

Groups:
- 首页
- 招生
- 教务
- 教学
- 财务
- 数据
- 设置

Acceptance:
- Clear navigation.

---

### T72 Global search

Goal:
Search students, teachers, classes, courses.

Acceptance:
- Role-aware search results.

---

## Stage 12: Tests, Deployment, Final Review

### T73 Unit tests

Goal:
Test core business logic.

Targets:
- RBAC
- tenant isolation helpers
- conflict detection
- course consumption
- mistake statistics

Acceptance:
- Tests pass.

---

### T74 E2E tests

Goal:
Add Playwright tests.

Flows:
- login
- create student
- create teacher
- create course and class
- schedule lesson
- attendance
- course consumption
- homework
- mistake notebook

Acceptance:
- E2E suite passes.

---

### T75 Seed data

Goal:
Create demo seed data.

Must include:
- demo tenant
- campus
- rooms
- admin
- academic staff
- finance staff
- teacher
- students
- guardians
- courses
- classes
- schedules

Acceptance:
- One command seeds demo data.

---

### T76 Error handling polish

Goal:
Improve error pages and user feedback.

Acceptance:
- Global error page.
- Not found page.
- Form errors clear.
- Toast messages clear.

---

### T77 Performance optimization

Goal:
Optimize large lists and queries.

Acceptance:
- Pagination.
- Indexes.
- Avoid obvious N+1 queries.

---

### T78 Security review

Goal:
Review role isolation and tenant isolation.

Acceptance:
- No known P0/P1 permission issue.

---

### T79 Deployment configuration

Goal:
Add deployment docs.

Acceptance:
- Local setup works.
- Production environment variables documented.

---

### T80 Final project review

Goal:
Full review before handoff.

Acceptance:
- P0/P1 issues fixed.
- MVP demo flows work.
- Documentation updated.
