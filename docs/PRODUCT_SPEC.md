# PRODUCT_SPEC.md

## Product Name

EduOS：本地学科类教培机构综合运营与学习管理系统。

## Product Positioning

EduOS is for local academic tutoring institutions that need one system to manage:

-招生
-报课
-排课
-上课
-打卡
-作业
-错题
-学情
-课消
-续费
-财务
-合规
-多校区复制

## User Portals

### Institution Dashboard

For:
- principal
- campus manager
- academic affairs
- finance
- academic research staff

Main functions:
- student management
- teacher management
- course management
- class management
- schedule management
- attendance and course consumption
- resources
- homework
- mistake reports
- learning reports
- finance
- dashboards
- settings

### Teacher Portal

For teachers and assistants.

Main functions:
- today's lessons
- class roster
- lesson resources
- attendance
- homework assignment
- homework correction
- lesson feedback
- class mistake summary

### Student Portal

For enrolled students.

Main functions:
- my timetable
- today's check-in
- my resources
- my homework
- my mistakes
- my learning report

Student must not see:
- teacher portal
- institution dashboard
- finance reports
- classroom occupancy
- internal scheduling allocation
- other students' private data

### Parent Portal

For guardians.

Main functions:
- child timetable
- attendance records
- course balance
- course consumption ledger
- homework status
- teacher feedback
- learning reports
- contracts/payments if enabled

## Core Business Loops

### 1. Enrollment Loop

student profile -> guardian binding -> course selection -> enrollment -> course account

### 2. Scheduling Loop

class group -> schedule -> conflict detection -> calendar -> role-specific timetable

### 3. Attendance and Course Consumption Loop

scheduled lesson -> attendance/check-in -> confirmation -> automatic deduction -> ledger

### 4. Homework Loop

teacher assigns -> student submits -> teacher corrects -> student revises -> completed

### 5. Mistake Loop

wrong question -> knowledge point -> reason tag -> correction -> mastered

### 6. Report Loop

attendance + homework + mistakes + feedback -> learning report -> parent/student view

## MVP Must-Have

P0:
- Auth/RBAC
- Multi-tenant foundation
- Student/guardian/teacher management
- Course/class/enrollment
- Scheduling
- Attendance/check-in
- Course consumption
- Course resources
- Homework
- Mistake notebook
- Student/teacher/parent basic portals

P1:
- CRM
- contract
- finance report
- refund
- learning report
- renewal warning
- notification center

P2:
- AI correction
- AI learning report
- WeChat mini program
- SMS
- live classroom integration
- SaaS billing

## Compliance Product Rules

These should be configurable:

- forbidden scheduling windows
- maximum prepaid hours
- contract required before class
- teacher qualification required
- private account payment warning
- minor data access restrictions

## Differentiation

EduOS should focus on academic tutoring, not generic training.

Core differentiation:

- knowledge points
- mistakes
- homework correction
- learning reports
- local grade/subject curriculum
- course consumption transparency
- modern student/teacher/parent experience
