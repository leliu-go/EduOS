# Final Deploy To ECS Steps

## Local Before Deploy

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git status
git add <safe files>
git commit -m "release: prepare EduOS deployment"
git push origin main
```

Do not add `.env.production.local`, resource uploads, `node_modules`, test reports, or the Codex run pack.

## First ECS Deploy

```bash
cd /opt
sudo mkdir -p /opt/eduos
sudo chown -R "$USER":"$USER" /opt/eduos
git clone https://github.com/leliu-go/EduOS.git /opt/eduos/current
cd /opt/eduos/current
test -f /opt/eduos/.env.production.local
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
pm2 start ecosystem.config.cjs --only eduos --update-env
sudo cp scripts/server/nginx-eduos.conf /etc/nginx/sites-available/eduos.conf
sudo ln -sfn /etc/nginx/sites-available/eduos.conf /etc/nginx/sites-enabled/eduos.conf
sudo nginx -t
sudo systemctl reload nginx
BASE_URL=http://eduos.study-go.top bash scripts/server/health-check.sh
```

## Enable HTTPS

```bash
sudo certbot --nginx -d eduos.study-go.top
sudo nginx -t
sudo systemctl reload nginx
BASE_URL=https://eduos.study-go.top bash scripts/server/health-check.sh
```

## Later ECS Updates

```bash
cd /opt/eduos/current
git pull --ff-only origin main
pnpm install --frozen-lockfile
pnpm prisma generate
pnpm build
# Optional only after approval:
# RUN_PRODUCTION_MIGRATIONS=true bash scripts/server/deploy-production.sh
pm2 restart eduos --update-env
BASE_URL=https://eduos.study-go.top bash scripts/server/health-check.sh
```

## User Updates

1. Operator deploys the new version on ECS through `git pull`, build, and PM2 restart.
2. User opens the installed EduOS PWA.
3. User refreshes or reopens EduOS to load the latest server-rendered app.
4. Admin can confirm the deployed build from `系统设置 -> 版本信息`.
5. EduOS currently does not show a manual "检查更新" button because updates are server-managed.

## User Installation

Admin, teachers, students, and parents all install from the same URL:

```text
https://eduos.study-go.top
```

The installed software is unified. Role data is separated by server-side RBAC and `tenantId`, not by separate installers.
