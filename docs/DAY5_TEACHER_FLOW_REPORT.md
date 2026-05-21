# Day 5 Teacher Flow Report

日期：2026-05-21

## 已验证入口

- `/teacher`
- `/teacher/schedule`
- `/teacher/classes`
- `/teacher/homework`
- `/teacher/resources`
- `/teacher/me`

## 结论

老师端已经具备教学工作台、课表、班级、作业、资源和个人页。查询侧按 `tenantId` 与老师身份/授权班级限制。

## 权限验证

- 老师访问 `/dashboard/finance-reports` 应被拒绝。
- 老师没有 `route:dashboard`、`route:finance` 或 `finance:*` 权限。

## 仍需后续完善

- 课程详情/上课页仍需把点名、资源、作业、课堂表现、课后反馈合并到一个执行流。
- 活动进度页仍未成为老师端独立入口。
- 错题从作业标记到学生订正的 UI 串联还需要更完整的 e2e。
