"use client";

import { CalendarClock } from "lucide-react";

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

import { updateResourceReleaseAction } from "./actions";

type ResourceReleaseDialogResource = {
  id: string;
  title: string;
  releaseAt: Date | null;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLocal(value: Date | null) {
  if (!value) {
    return "";
  }

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(
    value.getHours(),
  )}:${pad(value.getMinutes())}`;
}

export function getResourceReleaseLabel(releaseAt: Date | null) {
  if (!releaseAt) {
    return "立即开放";
  }

  return `${releaseAt.getFullYear()}-${pad(releaseAt.getMonth() + 1)}-${pad(
    releaseAt.getDate(),
  )} ${pad(releaseAt.getHours())}:${pad(releaseAt.getMinutes())} 开放`;
}

export function ResourceReleaseDialog({
  resource,
  returnTo,
}: {
  resource: ResourceReleaseDialogResource;
  returnTo: "/dashboard/resources" | "/teacher/resources" | `/teacher/lessons/${string}`;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock className="size-4" aria-hidden="true" />
          开放时间
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>设置开放时间</DialogTitle>
          <DialogDescription>
            {resource.title} 留空为立即开放；设置未来时间后，学生端到时才可见。
          </DialogDescription>
        </DialogHeader>
        <form action={updateResourceReleaseAction} className="grid gap-5">
          <input type="hidden" name="resourceId" value={resource.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="grid gap-2">
            <Label htmlFor={`release-at-${resource.id}`}>开放时间</Label>
            <Input
              id={`release-at-${resource.id}`}
              name="releaseAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(resource.releaseAt)}
            />
          </div>
          <DialogFooter>
            <Button type="submit">保存开放时间</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
