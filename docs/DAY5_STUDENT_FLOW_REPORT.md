# Day 5 Student Flow Report

日期：2026-05-21

## 已验证入口

- `/student`
- `/student/schedule`
- `/student/homework`
- `/student/mistakes`
- `/student/resources`
- `/student/reports`
- `/student/me`

## 修复项

- P0：学生资源详情页存在旧 `fileUrl` 直接打开路径的风险。
- 修复：新增 `/student/resources/[resourceId]/download` route，先 `resources:download` 服务端权限校验，再通过 `getStudentResourceDetail` 做 `tenantId + 学生授权` 查询，最后调用 `createAuthorizedResourceDownloadUrl` 生成 signed URL。
- 旧 `fileUrl` 不再在学生端直接作为链接暴露。

## 权限验证

- 学生访问 `/teacher`、`/dashboard`、`/dashboard/finance-reports` 应被拒绝。
- 学生资源页面只显示授权资源。

## 仍需后续完善

- 学生课程详情页需要成为一等入口。
- 单词打卡活动仍需独立活动页和历史记录。
- 本地缓存清理按钮仍是说明性入口。
