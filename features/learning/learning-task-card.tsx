import { CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { checkInLearningTaskAction } from "./actions";
import { learningTaskTypeLabels } from "./learning-schema";
import type { getStudentLearningTasks } from "./queries";

type StudentLearningTask = Awaited<ReturnType<typeof getStudentLearningTasks>>[number];

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function LearningTaskCard({ task }: { task: StudentLearningTask }) {
  const checkIn = task.checkIns[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{task.title}</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(task.targetDate)}</p>
          </div>
          <Badge variant={checkIn ? "secondary" : "outline"}>
            {checkIn ? "已打卡" : learningTaskTypeLabels[task.taskType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-muted-foreground">
        {task.description ? <p>{task.description}</p> : null}
        {checkIn ? (
          <p>完成时间：{checkIn.checkedInAt.toISOString().slice(11, 16)}</p>
        ) : (
          <form action={checkInLearningTaskAction} className="grid gap-3">
            <input type="hidden" name="taskId" value={task.id} />
            <div className="grid gap-2">
              <Label htmlFor={`learning-task-note-${task.id}`}>完成说明</Label>
              <textarea
                id={`learning-task-note-${task.id}`}
                name="note"
                placeholder="可填写今日完成情况"
                className="min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
