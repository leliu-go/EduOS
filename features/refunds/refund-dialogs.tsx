"use client";

import { useMemo, useState } from "react";
import { FileClock, ShieldCheck } from "lucide-react";

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

import { approveRefundAction, createRefundRequestAction } from "./actions";
import type { RefundWorkflowOptions } from "./queries";

type RefundRequestDialogProps = {
  options: RefundWorkflowOptions;
};

function getRemainingHours(account: RefundWorkflowOptions["courseAccounts"][number]) {
  return account.purchasedHours + account.giftHours - account.usedHours - account.frozenHours;
}

export function RefundRequestDialog({ options }: RefundRequestDialogProps) {
  const [selectedCourseAccountId, setSelectedCourseAccountId] = useState(
    options.courseAccounts[0]?.id ?? "",
  );
  const selectedAccount = useMemo(
    () => options.courseAccounts.find((account) => account.id === selectedCourseAccountId),
    [options.courseAccounts, selectedCourseAccountId],
  );
  const selectedOrder = selectedAccount
    ? options.orders.find(
        (order) =>
          order.studentId === selectedAccount.studentId &&
          order.courseProductId === selectedAccount.courseProductId,
      )
    : undefined;
  const selectedPayment = selectedOrder
    ? options.payments.find((payment) => payment.orderId === selectedOrder.id)
    : undefined;
  const guardian = selectedAccount?.student.guardians[0]?.guardian;
  const hasAccounts = options.courseAccounts.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          data-testid="finance-refund-request-button"
          variant="outline"
          disabled={!hasAccounts}
        >
          <FileClock className="size-4" aria-hidden="true" />
          退费申请
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>退费申请</DialogTitle>
          <DialogDescription>
            创建退费申请不会删除原订单和原收款，审批后才会调整课时账户并写入审计日志。
          </DialogDescription>
        </DialogHeader>
        <form
          action={createRefundRequestAction}
          className="grid gap-5"
          data-testid="finance-refund-request-form"
        >
          <input type="hidden" name="studentId" value={selectedAccount?.studentId ?? ""} />
          <input type="hidden" name="guardianId" value={guardian?.id ?? ""} />
          <input type="hidden" name="orderId" value={selectedOrder?.id ?? ""} />
          <input type="hidden" name="paymentId" value={selectedPayment?.id ?? ""} />
          <input type="hidden" name="currency" value="CNY" />

          <div className="grid gap-2">
            <Label htmlFor="refund-course-account">学生课时账户</Label>
            <select
              id="refund-course-account"
              name="courseAccountId"
              data-testid="finance-refund-course-account-select"
              value={selectedCourseAccountId}
              onChange={(event) => setSelectedCourseAccountId(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {options.courseAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.student.name} - {account.courseProduct.name} - 剩余{" "}
                  {getRemainingHours(account)} 课时
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p>关联订单：{selectedOrder?.orderNo ?? "未找到可关联订单"}</p>
            <p>
              关联收款：
              {selectedPayment?.transactionNo ??
                selectedPayment?.amount.toString() ??
                "未找到可关联收款"}
            </p>
            <p>监护人：{guardian?.name ?? "未绑定主监护人"}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="refund-hours">退课时</Label>
              <Input id="refund-hours" name="refundHours" type="number" min="1" step="1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refund-amount">退费金额</Label>
              <Input
                id="refund-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="refund-reason">退费原因</Label>
            <textarea
              id="refund-reason"
              name="reason"
              required
              minLength={4}
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              placeholder="说明退费原因、沟通记录和附件位置"
            />
          </div>
          <DialogFooter>
            <Button type="submit" data-testid="finance-refund-submit">
              提交退费申请
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RefundApprovalPanel({ options }: RefundRequestDialogProps) {
  if (options.pendingRefunds.length === 0) {
    return null;
  }

  return (
    <div
      className="grid gap-3 rounded-md border bg-card p-4"
      data-testid="finance-refund-approval-panel"
    >
      <div>
        <h2 className="text-base font-semibold tracking-normal">待审核退费</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          审批会扣减课时账户，并保留原订单、原收款和审计日志。
        </p>
      </div>
      {options.pendingRefunds.map((refund) => (
        <form
          key={refund.id}
          action={approveRefundAction}
          className="grid gap-3 rounded-md border p-3"
          data-testid="finance-refund-approval-form"
          data-refund-id={refund.id}
        >
          <input type="hidden" name="refundId" value={refund.id} />
          <div className="text-sm">
            <p className="font-medium">
              {refund.student.name} - {refund.courseAccount.courseProduct.name}
            </p>
            <p className="mt-1 text-muted-foreground">
              退 {refund.refundHours} 课时 / CNY {refund.amount.toString()}：{refund.reason}
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`refund-approval-${refund.id}`}>审批意见</Label>
            <Input
              id={`refund-approval-${refund.id}`}
              name="approvalNote"
              minLength={2}
              placeholder="同意退费，已核对剩余课时"
              required
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            className="w-fit"
            data-testid="finance-refund-approval-submit"
          >
            <ShieldCheck className="size-4" aria-hidden="true" />
            审批通过
          </Button>
        </form>
      ))}
    </div>
  );
}
