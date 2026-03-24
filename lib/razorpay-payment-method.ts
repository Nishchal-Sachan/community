/** Map Razorpay `payment.method` to a short display label. */
export function mapRazorpayMethod(method: string | undefined): string {
  const m = (method ?? "").toLowerCase();
  switch (m) {
    case "upi":
      return "UPI";
    case "card":
      return "Card";
    case "netbanking":
      return "Net banking";
    case "wallet":
      return "Wallet";
    case "emi":
      return "EMI";
    case "paylater":
      return "Pay later";
    default:
      return method?.trim() ? method : "Other";
  }
}
