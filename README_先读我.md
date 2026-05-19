# EduOS Codex /goal 开发包：先读我

这个包用于让 Codex CLI 通过 `/goal` 开发一个“本地学科类教培机构综合系统”。

系统暂定名：EduOS

产品形态：
- 机构端 PC Dashboard
- 老师端响应式/移动端
- 学生端响应式/移动端
- 家长端响应式/移动端

核心模块：
- 登录与权限
- 多租户机构/校区
- 学生、家长、老师档案
- 课程、班级、报名、课时账户
- 排课、调课、停课、补课、冲突检测
- 考勤、学生打卡、课消流水
- 课程资源
- 作业、批改、订正
- 错题本、知识点、错因标签
- 学情报告
- 财务、合同、合规规则
- 经营看板

## 使用方式

1. 先完成 `INSTALL_GUIDE.md` 里的软件安装。
2. 新建项目目录，例如：

```bash
mkdir -p ~/code/eduos
cd ~/code/eduos
```

3. 把本开发包里的文件复制到项目根目录。

推荐最终结构：

```txt
eduos/
  AGENTS.md
  CODEX_GOAL.md
  docs/
    CODEX_TASKS.md
    REVIEW_CHECKLIST.md
    UI_SPEC.md
    DATABASE_SPEC.md
    PRODUCT_SPEC.md
    INSTALL_GUIDE.md
```

4. 在项目根目录启动 Codex：

```bash
codex
```

5. 如果 Codex CLI 还没有开启 `/goal`，先在 Codex 里运行：

```txt
/experimental
```

然后开启 goals。也可以在 Codex 配置文件里启用：

```toml
[features]
goals = true
```

6. 在 Codex 里输入以下命令：

```txt
/goal 阅读根目录 AGENTS.md、CODEX_GOAL.md，以及 docs/CODEX_TASKS.md、docs/REVIEW_CHECKLIST.md、docs/UI_SPEC.md、docs/DATABASE_SPEC.md。从 T00 开始按任务编号开发 EduOS，不要跳任务，不要越界开发；每完成一个任务必须运行 lint、typecheck、test，并按 REVIEW_CHECKLIST 做自审，只有通过后才进入下一个任务。
```

## 最重要的提醒

不要让 Codex 一次性做完整大系统。这个包已经把任务拆成 T00-T80。你要让 Codex 按编号推进。

推荐第一轮只做到可演示 MVP：

```txt
T00-T09
T11
T13
T17
T18
T21
T22
T23
T25
T28
T29
T30
T32
```

完成后再继续做资源、作业、错题、学情、财务。
