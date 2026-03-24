export const RECEIPT_ORG_NAME = "Akhil Bhartiya Kushwaha Mahasabha";

export type ReceiptEmailFields = {
  fullName: string;
  planLabelHi: string;
  amountRupees: number;
  paymentId: string;
  orderId: string;
  method: string;
  dateFormatted: string;
};

export function buildReceiptEmailHtml(d: ReceiptEmailFields): string {
  const rows = [
    ["Name", escapeHtml(d.fullName)],
    ["Plan", escapeHtml(d.planLabelHi)],
    ["Amount", `₹${d.amountRupees.toLocaleString("en-IN")}`],
    ["Payment ID", escapeHtml(d.paymentId)],
    ["Order ID", escapeHtml(d.orderId)],
    ["Payment method", escapeHtml(d.method)],
    ["Date", escapeHtml(d.dateFormatted)],
  ];

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;width:38%">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb">${v}</td></tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="hi">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:Georgia,'Noto Sans Devanagari',sans-serif;font-size:15px;color:#111827;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
    <div style="background:#1f2937;color:#fff;padding:16px 20px;">
      <div style="font-size:18px;font-weight:700;">${escapeHtml(RECEIPT_ORG_NAME)}</div>
      <div style="font-size:13px;opacity:0.9;margin-top:4px;">Payment receipt</div>
    </div>
    <div style="padding:20px;">
      <p style="margin:0 0 12px;">Dear ${escapeHtml(d.fullName)},</p>
      <p style="margin:0 0 16px;">Your payment was successful. Thank you.</p>
      <div style="border:1px solid #F57C00;border-radius:6px;padding:2px;margin-bottom:16px;">
        <div style="background:#fff8f0;padding:10px 12px;font-weight:600;color:#92400e;">Receipt details</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${tableRows}</table>
      </div>
      <p style="margin:0;font-size:13px;color:#6b7280;">यह एक कंप्यूटर जनित रसीद है</p>
    </div>
  </div>
</body>
</html>`.trim();
}

export function buildReceiptStandaloneHtml(d: ReceiptEmailFields): string {
  return buildReceiptEmailHtml(d);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
