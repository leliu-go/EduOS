"use client";

import { RotateCcw } from "lucide-react";

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
import { Label } from "@/components/ui/label";

import { reverseCourseConsumptionAction } from "./actions";

export function CourseConsumptionReversalDialog({
  courseConsumptionId,
  disabled,
}: {
  courseConsumptionId: string;
  disabled?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
          冲销
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>冲销课消</DialogTitle>
          <DialogDescription>
            冲销后会恢复对应课时余额，并保留原始课消记录。请填写原因。
          </DialogDescription>
        </DialogHeader>
        <form
          action={reverseCourseConsumptionAction}
          className="grid gap-5"
          onSubmit={(event) => {
            if (!window.confirm("确认冲销这条课消记录？")) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="courseConsumptionId" value={courseConsumptionId} />
          <div className="grid gap-2">
            <Label htmlFor={`reversal-reason-${courseConsumptionId}`}>冲销原因</Label>
            <textarea
              id={`reversal-reason-${courseConsumptionId}`}
              name="reason"
              placeholder="例如：考勤误操作"
              className="min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="destructive">
              确认冲销
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
