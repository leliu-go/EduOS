import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { submitHomeworkAction } from "./actions";

export function HomeworkSubmissionForm({ homeworkId }: { homeworkId: string }) {
  return (
    <form action={submitHomeworkAction} className="grid gap-3 rounded-md border bg-muted/30 p-3">
      <input type="hidden" name="homeworkId" value={homeworkId} />
      <input type="hidden" name="returnTo" value="/student/homework" />
      <div className="grid gap-2">
        <Label htmlFor={`homework-content-${homeworkId}`}>提交说明</Label>
        <textarea
          id={`homework-content-${homeworkId}`}
          name="contentText"
          placeholder="填写完成情况、答案说明或补充说明"
          className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`homework-file-name-${homeworkId}`}>文件名</Label>
          <Input
            id={`homework-file-name-${homeworkId}`}
            name="fileName"
            placeholder="例如：作业.pdf"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`homework-file-url-${homeworkId}`}>文件链接</Label>
          <Input id={`homework-file-url-${homeworkId}`} name="fileUrl" placeholder="https://..." />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor={`homework-image-url-${homeworkId}`}>图片链接</Label>
        <Input id={`homework-image-url-${homeworkId}`} name="imageUrl" placeholder="https://..." />
      </div>
      <Button type="submit" className="justify-self-start">
        <Send className="size-4" aria-hidden="true" />
        提交作业
      </Button>
    </form>
  );
}
