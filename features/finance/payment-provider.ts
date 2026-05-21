export type ManualPaymentProviderInput = {
  amount: string;
  currency: string;
  method: string;
  status: "PENDING" | "CONFIRMED";
  transactionNo?: string | null;
};

export type PaymentProviderResult = {
  provider: "manual";
  providerPaymentId: string;
  status: "PENDING" | "CONFIRMED";
};

export interface PaymentProvider {
  provider: "manual";
  createManualPayment(input: ManualPaymentProviderInput): Promise<PaymentProviderResult>;
}

export class ManualPaymentProvider implements PaymentProvider {
  provider = "manual" as const;

  async createManualPayment(input: ManualPaymentProviderInput): Promise<PaymentProviderResult> {
    return {
      provider: this.provider,
      providerPaymentId: input.transactionNo?.trim() || `manual-${Date.now()}`,
      status: input.status,
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new ManualPaymentProvider();
}
