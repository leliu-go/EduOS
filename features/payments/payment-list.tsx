import { CreditCard, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import type { PaymentListItem } from "./queries";

type PaymentListProps = {
  payments: PaymentListItem[];
};

const paymentStatusLabels = {
  PENDING: "待确认",
  CONFIRMED: "已确认",
  FAILED: "支付失败",
  CANCELLED: "已取消",
} as const;

const paymentMethodLabels = {
  CASH: "现金",
  BANK_TRANSFER: "银行转账",
  WECHAT: "微信线下收款",
  ALIPAY: "支付宝线下收款",
  CARD: "银行卡",
  OTHER: "其他",
} as const;

function formatPaymentDate(value: Date | null) {
  if (!value) {
    return "未确认";
  }

  return `${value.toISOString().slice(0, 10)} ${value.toISOString().slice(11, 16)}`;
}

function formatPaymentAmount(payment: PaymentListItem) {
  return `${payment.currency} ${payment.amount.toString()}`;
}

export function PaymentList({ payments }: PaymentListProps) {
  if (payments.length === 0) {
    return (
      <EmptyState
        title="暂无支付流水"
        description="录入第一笔收款后，这里会形成现金流入记录，并用于后续对账。"
      />
    );
  }

  return (
    <section className="grid gap-3">
      {payments.map((payment) => (
        <Card key={payment.id} className="shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ReceiptText className="size-4 text-primary" aria-hidden="true" />
                  <CardTitle className="line-clamp-1 text-base">
                    {payment.student.name} / {payment.order.orderNo}
                  </CardTitle>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {payment.student.grade} / {payment.guardian?.name ?? "未绑定家长"} / 现金流入
                </p>
              </div>
              <Badge variant={payment.status === "CONFIRMED" ? "default" : "secondary"}>
                {paymentStatusLabels[payment.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-4">
            <div>
              <p className="text-xs">收款金额</p>
              <p className="mt-1 font-semibold text-foreground">{formatPaymentAmount(payment)}</p>
            </div>
            <div>
              <p className="text-xs">收款方式</p>
              <p className="mt-1 flex items-center gap-1 font-semibold text-foreground">
                <CreditCard className="size-4" aria-hidden="true" />
                {paymentMethodLabels[payment.method]}
              </p>
            </div>
            <div>
              <p className="text-xs">确认时间</p>
              <p className="mt-1 font-semibold text-foreground">
                {formatPaymentDate(payment.paidAt)}
              </p>
            </div>
            <div>
              <p className="text-xs">订单状态</p>
              <p className="mt-1 font-semibold text-foreground">{payment.order.status}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
