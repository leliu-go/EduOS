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
import { errorReasonLabels, errorReasonValues } from "@/features/mistakes/error-record-schema";

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

type HomeworkCorrectionDialogKnowledgePoint = {
  id: string;
  name: string;
  chapter: string;
  subject: {
    name: string;
  };
  grade: {
    name: string;
  };
  parent: {
    name: string;
  } | null;
};

function getKnowledgePointLabel(knowledgePoint: HomeworkCorrectionDialogKnowledgePoint) {
  const parentName = knowledgePoint.parent ? ` · ${knowledgePoint.parent.name}` : "";

  return `${knowledgePoint.subject.name} · ${knowledgePoint.grade.name} · ${knowledgePoint.chapter}${parentName} · ${knowledgePoint.name}`;
}

export function HomeworkCorrectionDialog({
  submission,
  knowledgePoints,
}: {
  submission: HomeworkCorrectionDialogSubmission;
  knowledgePoints: HomeworkCorrectionDialogKnowledgePoint[];
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
          <div className="grid gap-3 rounded-md border p-3">
            <p className="text-sm font-medium text-foreground">错题记录</p>
            <div className="grid gap-2">
              <Label htmlFor={`homework-mistake-knowledge-point-${submission.id}`}>知识点</Label>
              <select
                id={`homework-mistake-knowledge-point-${submission.id}`}
                name="mistakeKnowledgePointId"
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">不记录错题</option>
                {knowledgePoints.map((knowledgePoint) => (
                  <option key={knowledgePoint.id} value={knowledgePoint.id}>
                    {getKnowledgePointLabel(knowledgePoint)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`homework-mistake-reason-${submission.id}`}>错误原因</Label>
              <select
                id={`homework-mistake-reason-${submission.id}`}
                name="mistakeErrorReason"
                defaultValue="CONCEPT_UNCLEAR"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {errorReasonValues.map((errorReason) => (
                  <option key={errorReason} value={errorReason}>
                    {errorReasonLabels[errorReason]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`homework-mistake-note-${submission.id}`}>错题备注</Label>
              <textarea
                id={`homework-mistake-note-${submission.id}`}
                name="mistakeNote"
                placeholder="可选，记录题号或订正重点"
                className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存批改</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
