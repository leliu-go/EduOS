import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { correctHomeworkSubmissionAction } from "./actions";
import { homeworkCorrectionStatusLabels, homeworkCorrectionStatusValues } from "./homework-schema";

type HomeworkCorrectionDialogSubmission = {
  id: string;
  attemptNumber: number;
  student: {
    name: string;
  };
  homework: {
    title: string;
  };
};

export function HomeworkCorrectionDialog({
  submission,
}: {
  submission: HomeworkCorrectionDialogSubmission;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          批改
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批改作业</DialogTitle>
          <DialogDescription>
            {submission.student.name} · {submission.homework.title} · 第 {submission.attemptNumber}{" "}
            次提交。可标记完成，或要求学生继续订正。
          </DialogDescription>
        </DialogHeader>
        <form action={correctHomeworkSubmissionAction} className="grid gap-5">
          <input type="hidden" name="submissionId" value={submission.id} />
          <input type="hidden" name="returnTo" value="/teacher/homework" />
          <div className="grid gap-2">
            <Label htmlFor={`homework-correction-status-${submission.id}`}>批改结果</Label>
            <select
              id={`homework-correction-status-${submission.id}`}
              name="status"
              required
              defaultValue="CORRECTED"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {homeworkCorrectionStatusValues.map((status) => (
                <option key={status} value={status}>
                  {homeworkCorrectionStatusLabels[status]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`homework-correction-score-${submission.id}`}>分数</Label>
            <Input
              id={`homework-correction-score-${submission.id}`}
              name="score"
              type="number"
              min="0"
              max="100"
              placeholder="可选，0-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`homework-correction-comment-${submission.id}`}>评语</Label>
            <textarea
              id={`homework-correction-comment-${submission.id}`}
              name="comment"
              required
              placeholder="写明表现、问题和订正要求"
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存批改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
