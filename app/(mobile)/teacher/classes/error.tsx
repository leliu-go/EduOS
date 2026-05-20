"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function TeacherClassesError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="班级加载失败"
      description="请稍后重试，或联系管理员检查班级数据。"
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          重试
        </button>
      }
    />
  );
}
