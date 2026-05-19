# UI_SPEC.md

## Product Visual Direction

EduOS should look like a modern SaaS education platform, not an old ERP.

Keywords:
- clean
- modern
- trustworthy
- academic
- efficient
- calm
- mobile-friendly

## Design System

Use one consistent design system:

- light neutral background
- white cards
- subtle border
- medium border radius
- soft shadow only when necessary
- consistent spacing
- one primary color family
- clear typography hierarchy

Avoid:

- too many colors
- dense table-only pages
- random gradients
- childish style
- cluttered dashboards
- icons without labels in key operations

## Desktop Institution Dashboard

Layout:

```txt
Sidebar left
Topbar top
Main content center
```

Sidebar groups:

```txt
首页
招生 CRM
学生
老师
课程
班级
排课
考勤课消
课程资源
作业
错题集
学情报告
财务
数据看板
设置
```

Topbar:

- campus switcher
- global search
- notifications
- current user menu

Main content page pattern:

```txt
Page title + description
Primary action button
Metric cards if useful
Filter/search area
Main table/calendar/form/detail
```

## Mobile Student Portal

Bottom nav:

```txt
首页
课表
作业
错题
我的
```

Home cards:

- 今日课程
- 待完成作业
- 今日打卡
- 我的错题
- 学习资源
- 学习报告

Rules:

- no dense tables
- large tap targets
- clear status badge
- parent/student-friendly wording

## Mobile Teacher Portal

Bottom nav:

```txt
首页
课表
班级
作业
我的
```

Home cards:

- 今日课程
- 待点名
- 待批改
- 需关注学生

Rules:

- teacher should act in 1-2 taps
- today-first design
- avoid forcing teacher into admin dashboard

## Mobile Parent Portal

Bottom nav:

```txt
首页
课表
课消
报告
我的
```

Home cards:

- 孩子今日课程
- 考勤记录
- 剩余课时
- 作业状态
- 学情报告
- 缴费合同

Rules:

- transparent course consumption
- easy to understand progress
- no internal school operation data

## Components Needed

- AppSidebar
- AppTopbar
- MobileBottomNav
- PageHeader
- MetricCard
- StatusBadge
- DataTable
- FilterBar
- CalendarView
- EmptyState
- LoadingState
- ErrorState
- ConfirmDialog
- FormSection
- DetailCard
- Timeline
- CourseBalanceCard
- HomeworkStatusCard
- MistakeSummaryCard

## Chinese Copy Guidelines

Good:

- 今日课程
- 待点名
- 待批改
- 剩余课时
- 已课消
- 待订正
- 已掌握
- 低课时预警

Avoid:

- overly technical terms
- unclear abbreviations
- internal database names in UI

## Required Page States

Every page must handle:

1. Loading
2. Empty
3. Error
4. Normal list/detail
5. Permission denied if relevant

## Table Rules

Tables should include where relevant:

- search
- filters
- pagination
- status badges
- row actions
- bulk actions only when necessary

## Calendar Rules

Scheduling calendar should support:

- day view
- week view
- list view
- filters by teacher, room, class, campus
- conflict warning
- click lesson to view details

Students should not see internal room allocation calendar.
