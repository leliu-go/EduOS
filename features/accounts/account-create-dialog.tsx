"use client";

import { KeyRound } from "lucide-react";

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

import { createAccountInvitationAction } from "./actions";
import { accountTargetLabels, type AccountTargetType } from "./account-schema";

type AccountCreateDialogProps = {
  targetType: AccountTargetType;
  targetId: string;
  targetName: string;
  defaultEmail?: string | null;
  defaultPhone?: string | null;
  redirectTo?: string;
};

export function AccountCreateDialog({
  targetType,
  targetId,
  targetName,
  defaultEmail,
  defaultPhone,
  redirectTo = "/dashboard/accounts",
}: AccountCreateDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <KeyRound className="size-4" aria-hidden="true" />
          开通账号
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>开通{accountTargetLabels[targetType]}账号</DialogTitle>
          <DialogDescription>
            为 {targetName} 创建登录账号，并自动分配对应角色。请线下安全告知初始密码。
          </DialogDescription>
        </DialogHeader>
        <form action={createAccountInvitationAction} className="grid gap-5">
          <input type="hidden" name="targetType" value={targetType} />
          <input type="hidden" name="targetId" value={targetId} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="grid gap-2">
            <Label htmlFor={`account-email-${targetId}`}>邮箱</Label>
            <Input
              id={`account-email-${targetId}`}
              name="email"
              type="email"
              defaultValue={defaultEmail ?? ""}
              placeholder="可选，邮箱或手机号至少填写一项"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`account-phone-${targetId}`}>手机号</Label>
            <Input
              id={`account-phone-${targetId}`}
              name="phone"
              defaultValue={defaultPhone ?? ""}
              placeholder="可选，邮箱或手机号至少填写一项"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`account-password-${targetId}`}>初始密码</Label>
            <Input
              id={`account-password-${targetId}`}
              name="initialPassword"
              type="password"
              placeholder="至少 8 位"
              autoComplete="new-password"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">创建账号</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
