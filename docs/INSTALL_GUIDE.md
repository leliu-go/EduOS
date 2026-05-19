# INSTALL_GUIDE.md：开发前需要安装的软件

下面按“必须安装”和“推荐安装”列出。

## 一、必须安装

### 1. Git

用途：代码版本管理、回滚、review、创建分支。

安装后验证：

```bash
git --version
```

建议：每完成一个 Codex 任务就提交一次。

```bash
git add .
git commit -m "feat: complete T00 project setup"
```

---

### 2. Node.js LTS

用途：运行 Next.js、npm、pnpm、Codex CLI。

建议安装：
- macOS / Linux：Node.js 最新 LTS。
- Windows：推荐用 WSL2 + Ubuntu，再通过 nvm 安装 Node。

验证：

```bash
node -v
npm -v
```

建议不要直接用太旧的 Node 版本。EduOS 项目建议 Node 22+，更推荐当前 LTS。

---

### 3. pnpm

用途：项目包管理器。比 npm 更适合中大型前端项目。

安装方式二选一：

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

或者：

```bash
npm i -g pnpm
```

验证：

```bash
pnpm -v
```

---

### 4. PostgreSQL

用途：本项目主数据库。

推荐：PostgreSQL 18.x 或当前稳定支持版本。

验证：

```bash
psql --version
```

本地开发可以创建数据库：

```bash
createdb eduos_dev
```

如果你不想本机直接安装 PostgreSQL，也可以用 Docker 跑 PostgreSQL。

---

### 5. Codex CLI

用途：让 Codex 在你本地项目目录里读代码、改代码、跑命令、按 `/goal` 持续推进。

安装：

```bash
npm i -g @openai/codex
```

升级：

```bash
npm i -g @openai/codex@latest
```

启动：

```bash
codex
```

第一次启动会要求登录 ChatGPT 账号或配置 API key。

验证：

```bash
codex --version
```

---

### 6. VS Code

用途：看代码、改文件、看 Git diff、运行终端。

推荐插件：
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Playwright Test for VS Code

---

## 二、推荐安装

### 1. Docker Desktop

用途：快速启动 PostgreSQL，不污染本机环境。

推荐 docker-compose：

```yaml
services:
  postgres:
    image: postgres:18
    container_name: eduos_postgres
    environment:
      POSTGRES_USER: eduos
      POSTGRES_PASSWORD: eduos_password
      POSTGRES_DB: eduos_dev
    ports:
      - "5432:5432"
    volumes:
      - eduos_pg_data:/var/lib/postgresql/data

volumes:
  eduos_pg_data:
```

启动：

```bash
docker compose up -d
```

---

### 2. 数据库 GUI

任选一个：
- DBeaver
- TablePlus
- pgAdmin

用途：查看 Prisma 创建的表、测试数据、查询课消流水。

---

### 3. GitHub CLI

用途：创建 repo、PR、issue。

验证：

```bash
gh --version
```

---

### 4. Chrome / Chromium

用途：Playwright E2E 测试。

安装 Playwright 浏览器：

```bash
pnpm exec playwright install
```

---

## 三、Windows 用户建议

强烈建议：Windows + WSL2 + Ubuntu。

步骤：

```powershell
wsl --install
```

进入 WSL：

```powershell
wsl
```

在 WSL 里安装 Node、Codex、Git、pnpm。

项目建议放在：

```bash
~/code/eduos
```

不要放在：

```bash
/mnt/c/Users/你的用户名/Desktop/eduos
```

原因：Windows 挂载路径 I/O 慢，权限和软链接问题多。

---

## 四、安装完成后统一验证

全部装完后，在终端运行：

```bash
git --version
node -v
npm -v
pnpm -v
psql --version
codex --version
```

如果都能输出版本号，就可以开始。

---

## 五、建议的项目初始化命令

```bash
mkdir -p ~/code/eduos
cd ~/code/eduos
git init
codex
```

进入 Codex 后先运行：

```txt
/init
```

如果 `/init` 生成了 AGENTS.md，用本开发包里的 AGENTS.md 覆盖或合并它。

然后运行：

```txt
/goal 阅读根目录 AGENTS.md、CODEX_GOAL.md，以及 docs/CODEX_TASKS.md、docs/REVIEW_CHECKLIST.md、docs/UI_SPEC.md、docs/DATABASE_SPEC.md。从 T00 开始按任务编号开发 EduOS，不要跳任务，不要越界开发；每完成一个任务必须运行 lint、typecheck、test，并按 REVIEW_CHECKLIST 做自审，只有通过后才进入下一个任务。
```
