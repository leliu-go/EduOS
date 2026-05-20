import { Button } from "@/components/ui/button";

import { createOrUpdateLessonFeedbackAction } from "./actions";

type LessonFeedbackFormStudent = {
  id: string;
  name: string;
  lessonFeedbacks: Array<{
    content: string;
    performance: string;
    mastery: string;
    homework: string;
    suggestion: string;
  }>;
};

type LessonFeedbackFormProps = {
  lessonId: string;
  returnTo: `/teacher/lessons/${string}`;
  student: LessonFeedbackFormStudent;
};

const feedbackFields = [
  { name: "content", label: "课堂内容" },
  { name: "performance", label: "课堂表现" },
  { name: "mastery", label: "掌握情况" },
  { name: "homework", label: "课后作业" },
  { name: "suggestion", label: "学习建议" },
] as const;

export function LessonFeedbackForm({ lessonId, returnTo, student }: LessonFeedbackFormProps) {
  const feedback = student.lessonFeedbacks[0];

  return (
    <form action={createOrUpdateLessonFeedbackAction} className="grid gap-3 rounded-lg border p-4">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="studentId" value={student.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div>
        <h4 className="text-sm font-semibold tracking-normal text-foreground">{student.name}</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {feedback ? "已填写，可继续更新" : "填写后家长可见"}
        </p>
      </div>
      {feedbackFields.map((field) => (
        <label key={field.name} className="grid gap-1 text-sm font-medium text-foreground">
          {field.label}
          <textarea
            name={field.name}
            defaultValue={feedback?.[field.name] ?? ""}
            required
            maxLength={1200}
            className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </label>
      ))}
      <Button type="submit" size="sm" className="justify-self-start">
        保存反馈
      </Button>
    </form>
  );
}
