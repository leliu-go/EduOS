import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  NotebookPen,
} from "lucide-react";

export type DashboardMetric = {
  label: string;
  value: string;
  helper: string;
  trend: string;
  tone: "blue" | "green" | "amber" | "red" | "slate";
  icon: typeof CalendarDays;
};

export type DashboardScheduleItem = {
  time: string;
  title: string;
  meta: string;
  status: string;
};

export type DashboardWeeklyPlan = {
  day: string;
  lessons: number;
};

export type DashboardTodo = {
  title: string;
  detail: string;
  priority: "高" | "中" | "低";
};

export const dashboardDemoData = {
  metrics: [
    {
      label: "今日课程",
      value: "18",
      helper: "覆盖 4 个校区",
      trend: "较昨日 +3",
      tone: "blue",
      icon: CalendarDays,
    },
    {
      label: "今日到课率",
      value: "92%",
      helper: "已确认 126 人次",
      trend: "稳定",
      tone: "green",
      icon: CheckCircle2,
    },
    {
      label: "本月课消",
      value: "428.5",
      helper: "课时",
      trend: "较上月 +8%",
      tone: "slate",
      icon: ClipboardCheck,
    },
    {
      label: "待批改作业",
      value: "36",
      helper: "份作业",
      trend: "12 份临近截止",
      tone: "amber",
      icon: NotebookPen,
    },
    {
      label: "低课时预警",
      value: "12",
      helper: "名学生",
      trend: "需本周跟进",
      tone: "red",
      icon: AlertTriangle,
    },
    {
      label: "本周排课",
      value: "126",
      helper: "节课程",
      trend: "已排 84%",
      tone: "blue",
      icon: Clock3,
    },
  ] satisfies DashboardMetric[],
  todaySchedules: [
    { time: "09:00", title: "初二数学 A 班", meta: "王老师 · 海淀校区", status: "待上课" },
    { time: "13:30", title: "高一英语 1 对 1", meta: "李老师 · 朝阳校区", status: "已确认" },
    { time: "18:20", title: "初三物理冲刺班", meta: "陈老师 · 望京校区", status: "待点名" },
  ] satisfies DashboardScheduleItem[],
  weeklyPlan: [
    { day: "周一", lessons: 18 },
    { day: "周二", lessons: 21 },
    { day: "周三", lessons: 17 },
    { day: "周四", lessons: 22 },
    { day: "周五", lessons: 20 },
    { day: "周六", lessons: 28 },
    { day: "周日", lessons: 16 },
  ] satisfies DashboardWeeklyPlan[],
  todos: [
    { title: "作业批改", detail: "初二数学 A 班还有 12 份", priority: "高" },
    { title: "续费跟进", detail: "低课时学生需联系家长", priority: "中" },
    { title: "课表确认", detail: "周末新增课程待确认教室", priority: "中" },
  ] satisfies DashboardTodo[],
};
