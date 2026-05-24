import { PageHeader } from "@/components/dashboard/PageHeader";
import { requirePermission } from "@/lib/rbac/require-permission";

type ManualSection = {
  title: string;
  description: string;
  steps: string[];
};

const manualSections: ManualSection[] = [
  {
    title: "PWA 安装",
    description: "EduOS 第一阶段使用同一个 PWA 入口，所有角色安装同一个应用。",
    steps: [
      "打开 https://eduos.study-go.top/login，登录后使用浏览器地址栏或右下角的安装入口安装 EduOS。",
      "Windows 上安装后通常会出现在开始菜单；如未自动生成桌面图标，可在开始菜单搜索 EduOS 后固定到任务栏或创建快捷方式。",
      "Admin、老师、学生和家长都使用同一个入口，登录后由服务端按角色进入对应页面。",
    ],
  },
  {
    title: "登录与账号",
    description: "账号由 Admin 统一管理，老师可在授权范围内为学生创建或维护账号。",
    steps: [
      "连续登录失败会触发风控限制，避免被暴力猜密码。",
      "账号拥有者可以修改自己的密码；高权限账号建议定期更新密码。",
      "退出登录后如需清理本机痕迹，可在浏览器或系统应用设置中清理 EduOS 的站点数据。",
    ],
  },
  {
    title: "Authenticator",
    description: "Admin 等高权限账号应绑定 Authenticator，降低账号密码泄露后的风险。",
    steps: [
      "进入系统设置中的安全中心，选择绑定 Authenticator。",
      "使用 Microsoft Authenticator、Google Authenticator 或同类应用扫描二维码。",
      "输入 6 位动态验证码完成绑定，并妥善保存恢复码。",
      "不要把动态验证码、恢复码或设备密钥发给他人。",
    ],
  },
  {
    title: "账号与权限管理",
    description: "EduOS 是一套系统，多角色登录，权限边界在服务端校验。",
    steps: [
      "Admin 可以创建、禁用、删除或导入导出机构内账号。",
      "老师只能管理授权范围内的学生账号，不能进入财务、系统设置或其他老师班级。",
      "学生只能查看自己的课表、作业、错题、活动和授权资源。",
      "前端菜单隐藏只是体验优化，所有敏感数据仍必须通过服务端 RBAC 和 tenantId 校验。",
    ],
  },
  {
    title: "学生、老师与财务数据",
    description: "核心结构化数据在云端保存，资源文件通过授权下载。",
    steps: [
      "学生档案、报名、排课、课消、收款和退款等核心数据由云端数据库保存。",
      "作业照片、错题照片、视频、讲义等大文件走对象存储，不会打包进客户端。",
      "下载资源前必须先通过服务端验权，前端不能直接拼接私有 OSS 地址。",
    ],
  },
  {
    title: "版本与更新",
    description: "EduOS 当前采用服务器统一部署更新，用户刷新或重新打开后加载新版本。",
    steps: [
      "Admin 可在设置中查看当前版本号。",
      "服务器更新由维护人员通过 Git pull、build 和 PM2 restart 完成。",
      "如果页面样式异常，优先刷新页面；仍异常时联系维护人员检查 standalone 静态资源是否已准备。",
    ],
  },
  {
    title: "常见问题",
    description: "这里记录日常使用中最常见的处理方式。",
    steps: [
      "安装后没有桌面入口：从 Windows 开始菜单搜索 EduOS，再固定到任务栏或创建快捷方式。",
      "登录失败：确认账号状态、密码和 MFA 验证码；连续失败会被临时锁定。",
      "看不到某个模块：通常是当前角色没有权限，可联系 Admin 检查账号角色和授权范围。",
      "页面显示不完整：刷新页面；如果仍异常，联系维护人员检查部署和浏览器缓存。",
    ],
  },
];

export default async function DashboardHelpPage() {
  await requirePermission("route:admin", {
    nextPath: "/dashboard/help",
    unauthorizedRedirectTo: "/unauthorized",
  });

  return (
    <div className="grid gap-6">
      <PageHeader
        title="EduOS 使用手册"
        description="在应用内直接查看安装、登录、安全、账号、资源和更新说明。"
        badge="Manual"
      />

      <article className="rounded-lg border border-border bg-card p-5 shadow-none md:p-8">
        <div className="max-w-4xl space-y-8">
          <section className="space-y-3">
            <p className="text-sm font-medium text-primary">EduOS Manual</p>
            <h2 className="text-2xl font-semibold tracking-normal text-foreground">使用前先看这份手册</h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              这份手册只保留实际使用说明，不再把帮助页拆成多个跳转卡片。后续功能变化时，手册会跟随版本更新。
            </p>
          </section>

          <nav aria-label="手册目录" className="rounded-md border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">目录</p>
            <ol className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              {manualSections.map((section, index) => (
                <li key={section.title}>
                  <a className="hover:text-primary" href={`#manual-${index + 1}`}>
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-7">
            {manualSections.map((section, index) => (
              <section key={section.title} id={`manual-${index + 1}`} className="scroll-mt-24 space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Section {index + 1}</p>
                  <h3 className="text-xl font-semibold tracking-normal text-foreground">{section.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{section.description}</p>
                </div>
                <ul className="space-y-2 text-sm leading-7 text-foreground">
                  {section.steps.map((step) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
