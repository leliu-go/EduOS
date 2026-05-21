"use client";

import { PlusCircle } from "lucide-react";

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

import { createManualPaymentAction } from "./actions";
import type { ManualPaymentOrderOption } from "./queries";

type PaymentCreateDialogProps = {
  orders: ManualPaymentOrderOption[];
};

const methodOptions = [
  { value: "CASH", label: "现金" },
  { value: "BANK_TRANSFER", label: "银行转账" },
  { value: "WECHAT", label: "微信线下收款" },
  { value: "ALIPAY", label: "支付宝线下收款" },
  { value: "CARD", label: "银行卡" },
  { value: "OTHER", label: "其他" },
];

export function PaymentCreateDialog({ orders }: PaymentCreateDialogProps) {
  const hasOrders = orders.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button data-testid="finance-new-payment-button" disabled={!hasOrders}>
          <PlusCircle className="size-4" aria-hidden="true" />
          新增收款
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增收款</DialogTitle>
          <DialogDescription>录入线下已收或待确认款项，不会连接真实支付通道。</DialogDescription>
        </DialogHeader>
        <form
          action={createManualPaymentAction}
          className="grid gap-5"
          data-testid="finance-new-payment-form"
        >
          <div className="grid gap-2">
            <Label htmlFor="payment-order">关联订单</Label>
            <select
              id="payment-order"
              name="orderId"
              data-testid="finance-payment-order-select"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              required
            >
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.orderNo} - {order.student.name} - {order.currency}{" "}
                  {order.payableAmount.toString()}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="payment-amount">收款金额</Label>
              <Input
                id="payment-amount"
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-paid-at">收款日期</Label>
              <Input
                id="payment-paid-at"
                name="paidAt"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="payment-method">收款方式</Label>
              <select
                id="payment-method"
                name="method"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                required
                defaultValue="CASH"
              >
                {methodOptions.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment-status">确认状态</Label>
              <select
                id="payment-status"
                name="status"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                required
                defaultValue="CONFIRMED"
              >
                <option value="CONFIRMED">已确认</option>
                <option value="PENDING">待确认</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment-transaction-no">交易号或凭证号</Label>
            <Input id="payment-transaction-no" name="transactionNo" maxLength={120} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment-notes">备注</Label>
            <textarea
              id="payment-notes"
              name="notes"
              placeholder="例如线下收款人、优惠说明、凭证位置等"
              className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </div>
          <DialogFooter>
            <Button type="submit" data-testid="finance-payment-submit">
              保存收款
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
