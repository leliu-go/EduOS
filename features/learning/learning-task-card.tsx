import { CheckCircle2, Circle, Headphones, PenLine, Sparkles, BookOpenText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { checkInLearningTaskAction } from "./actions";
import { learningTaskTypeHints, learningTaskTypeLabels } from "./learning-schema";
import type { getStudentLearningTasks } from "./queries";

type StudentLearningTask = Awaited<ReturnType<typeof getStudentLearningTasks>>[number];

const taskTypeIcon = {
  MEMORIZATION: PenLine,
  READING: BookOpenText,
  PRACTICE: Headphones,
  SPECIAL_TRAINING: Sparkles,
} as const;

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

function getTargetLabel(task: StudentLearningTask) {
  if (task.classGroup) {
    return task.classGroup.name;
  }

  if (task.student) {
    return "个人任务";
  }

  return "今日任务";
}

export function LearningTaskCard({ task }: { task: StudentLearningTask }) {
  const checkIn = task.checkIns[0];
  const Icon = taskTypeIcon[task.taskType];

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{learningTaskTypeLabels[task.taskType]}</Badge>
                <span className="text-xs text-muted-foreground">{formatDate(task.targetDate)}</span>
              </div>
              <h3 className="mt-2 text-base font-semibold leading-6 text-foreground">{task.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {getTargetLabel(task)} · {learningTaskTypeHints[task.taskType]}
              </p>
            </div>
          </div>
          {checkIn ? (
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        {task.description ? (
          <p className="rounded-md bg-muted/45 px-3 py-2 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        {checkIn ? (
          <p className="text-sm text-muted-foreground">完成时间：{formatTime(checkIn.checkedInAt)}</p>
        ) : (
          <form action={checkInLearningTaskAction} className="grid gap-3">
            <input type="hidden" name="taskId" value={task.id} />
            <div className="grid gap-2">
              <Label htmlFor={`learning-task-note-${task.id}`}>完成说明</Label>
              <textarea
                id={`learning-task-note-${task.id}`}
                name="note"
                placeholder="可填写今天完成了多少词、读了哪篇文章或听力完成情况"
                className="min-h-16 rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
              />
            </div>
            <Button type="submit" className="justify-self-start">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              完成打卡
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
