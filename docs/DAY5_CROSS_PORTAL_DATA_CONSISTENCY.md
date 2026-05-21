# Day 5 Cross-Portal Data Consistency

日期：2026-05-21

## 一致性结果

| 检查项 | 当前状态 |
| --- | --- |
| Admin 创建/seed 学生后学生端可登录 | 通过 QA seed 与登录 e2e 验证 |
| Admin 报名后学生端可见课程 | 通过课表/报名/班级关系验证 |
| Admin 排课后老师和学生端可见课表 | 通过 golden path e2e 路由验证 |
| 老师点名后 Admin 课消可见 | QA seed 覆盖 attendance + course consumption |
| 学生打卡后老师端可见 | QA seed 覆盖 check-in，UI 深链需后续加强 |
| 老师布置作业后学生端出现 | QA seed 覆盖 homework |
| 学生提交后老师端待批改 | QA seed 覆盖 submission |
| 老师批改后学生端状态更新 | QA seed 覆盖 correction，订正 UI 后续加强 |
| 资源授权后学生端可见 | 通过资源查询和 e2e 验证 |
| 资源下载验权后签名 | Day 5 已修复学生端下载 route |
| 活动发布后学生/老师可见 | 后端模型和 seed 覆盖，独立 UI 页待补 |
| 续费后课时账户增加 | 需要订单/续费向导，当前记录为 P1/P2 |
| 退费后课时账户和报表调整 | 后端 action + Day 5 最小 UI 覆盖 |
| 财务报表金额逻辑 | 单元测试覆盖，完整 UI 对账仍需更多 e2e |

## 结论

核心数据模型和查询边界已经具备闭环基础。Day 5 修复了两个直接影响验收的断点：学生资源下载验权和财务退费 UI。
