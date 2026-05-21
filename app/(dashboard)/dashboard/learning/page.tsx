import {
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Headphones,
  PenLine,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LearningTaskCreateDialog } from "@/features/learning/learning-task-create-dialog";
import { learningTaskTypeLabels } from "@/features/learning/learning-schema";
import {
  getLearningTaskAssignmentOptions,
  getStaffLearningTaskList,
} from "@/features/learning/queries";
import { requirePermission } from "@/lib/rbac/require-permission";

type StaffLearningTask = Awaited<ReturnType<typeof getStaffLearningTaskList>>[number];

const typeIcon = {
  MEMORIZATION: PenLine,
  READING: BookOpenText,
  PRACTICE: Headphones,
  SPECIAL_TRAINING: Sparkles,
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getTargetLabel(task: StaffLearningTask) {
  if (task.classGroup) {
    return `班级：${task.classGroup.name}`;
  }

  if (task.student) {
    return `学生：${task.student.name}`;
  }

  return "未设置对象";
}

function getTargetCount(task: StaffLearningTask) {
  if (task.classGroup) {
    return task.classGroup.students.length;
  }

  return task.student ? 1 : 0;
}

function LearningTaskManagementCard({ task }: { task: StaffLearningTask }) {
  const Icon = typeIcon[task.taskType];
  const targetCount = getTargetCount(task);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="truncate text-base">{task.title}</CardTitle>
              <CardDescription>{getTargetLabel(task)}</CardDescription>
            </div>
          </div>
        </div>
        <Badge variant="secondary">{learningTaskTypeLabels[task.taskType]}</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {task.description ? (
          <p className="line-clamp-2 text-muted-foreground">{task.description}</p>
        ) : (
          <p className="text-muted-foreground">暂无任务说明</p>
        )}
        <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/35 p-3">
          <div>
            <p className="text-xs text-muted-foreground">目标日期</p>
            <p className="mt-1 font-medium">{formatDate(task.targetDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">应完成人数</p>
            <p className="mt-1 font-medium">{targetCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">已打卡</p>
            <p className="mt-1 font-medium">{task._count.checkIns}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function LearningTasksPage() {
  const currentUser = await requirePermission("homework:manage", {
    nextPath: "/dashboard/learning",
    unauthorizedRedirectTo: "/unauthorized",
  });
  const scope = currentUser.roleKey === "TEACHER" ? { teacherUserId: currentUser.id } : {};
  const [tasks, options] = await Promise.all([
    getStaffLearningTaskList(currentUser.tenantId, scope),
    getLearningTaskAssignmentOptions(currentUser.tenantId, scope),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((task) => formatDate(task.targetDate) === today);
  const completedToday = todayTasks.reduce((total, task) => total + task._count.checkIns, 0);

  return (
    <div className="grid gap-6">
      <section className="rounded-md border bg-card p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">学习运营</Badge>
              <Badge variant="outline">单词 / 阅读 / 听力</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-normal text-foreground">
              学习任务
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              把课后学习拆成每天可完成的小任务，学生端负责打卡，老师端后续可继续接入资源、错题和个性化练习。
            </p>
          </div>
          <LearningTaskCreateDialog options={options} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>今日任务</CardDescription>
            <CardTitle className="mt-1 text-3xl">{todayTasks.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">今天需要学生完成的学习任务</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>今日打卡</CardDescription>
            <CardTitle className="mt-1 flex items-center gap-2 text-3xl">
              {completedToday}
              <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">已记录的学生完成次数</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>最近任务</CardDescription>
            <CardTitle className="mt-1 flex items-center gap-2 text-3xl">
              {tasks.length}
              <CalendarDays className="size-5 text-primary" aria-hidden="true" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">当前列表展示最近 80 条</CardContent>
        </Card>
      </section>

      {tasks.length > 0 ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {tasks.map((task) => (
            <LearningTaskManagementCard key={task.id} task={task} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="暂无学习任务"
          description="先布置一个单词、阅读或听力任务，学生端就会出现今日学习打卡。"
        />
      )}
    </div>
  );
}
