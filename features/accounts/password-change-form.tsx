import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { changeOwnPasswordAction } from "./actions";

export function PasswordChangeForm({
  redirectTo,
  compact = false,
}: {
  redirectTo: string;
  compact?: boolean;
}) {
  return (
    <form action={changeOwnPasswordAction} className="grid gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <div className={compact ? "grid gap-3" : "grid gap-3 md:grid-cols-3"}>
        <div className="grid gap-2">
          <Label htmlFor={`${redirectTo}-current-password`}>当前密码</Label>
          <Input
            id={`${redirectTo}-current-password`}
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${redirectTo}-next-password`}>新密码</Label>
          <Input
            id={`${redirectTo}-next-password`}
            name="nextPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`${redirectTo}-confirm-password`}>确认新密码</Label>
          <Input
            id={`${redirectTo}-confirm-password`}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      </div>
      <Button type="submit" className={compact ? "w-full" : "w-full md:w-fit"}>
        <KeyRound className="size-4" aria-hidden="true" />
        修改密码
      </Button>
    </form>
  );
}
