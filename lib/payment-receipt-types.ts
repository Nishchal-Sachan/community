export type PaymentPlanType = "membership" | "marriage";

/** Receipt payload returned by verify APIs (safe for client). */
export type ClientReceipt = {
  fullName: string;
  plan: string;
  planType: PaymentPlanType;
  amountRupees: number;
  paymentId: string;
  orderId: string;
  method: string;
  date: string;
};
