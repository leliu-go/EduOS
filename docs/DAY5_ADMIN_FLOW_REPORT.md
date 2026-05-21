# Day 5 Admin Flow Report

日期：2026-05-21

## 已验证入口

- `/dashboard`
- `/dashboard/students`
- `/dashboard/teachers`
- `/dashboard/courses`
- `/dashboard/classes`
- `/dashboard/enrollments`
- `/dashboard/scheduling`
- `/dashboard/resources`
- `/dashboard/homework`
- `/dashboard/course-accounts`
- `/dashboard/course-consumptions`
- `/dashboard/payments`
- `/dashboard/finance-reports`
- `/dashboard/settings/version`

## 结论

Admin 端已经覆盖从学生/老师/课程/班级/报名/排课/资源/作业/课消/支付/报表/版本的主要入口。Day 5 新增 golden path e2e 会逐页验证这些入口不跳 404、不跳 unauthorized、不出现加载失败。

## 发现并修复

- P1：财务退费入口原本只是 `/dashboard/payments?mode=refund` 链接，没有最小表单。
- 修复：新增退费申请和待审核退费审批 UI，复用已有 `createRefundRequestAction` 和 `approveRefundAction`，继续走 `finance:mutate` 服务端权限和 audit log。

## 仍需后续完善

- 学生详情页到报名/课时账户/订单的串联可更强。
- 课程产品详情到班级、课次、资源的入口还可继续优化。
- 经营分析和财务报表高级筛选仍是 P2。
