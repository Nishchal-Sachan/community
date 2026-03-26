import { getEmailTransporter } from "@/services/emailService";
import {
  buildReceiptEmailHtml,
  RECEIPT_ORG_NAME,
  type ReceiptEmailFields,
} from "@/lib/payment-receipt-html";

export async function sendPaymentReceiptEmail(
  to: string,
  fields: ReceiptEmailFields
): Promise<void> {
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.warn(
      "[payment-receipt] SMTP not configured (set EMAIL_USER and EMAIL_PASS); skipping email"
    );
    return;
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.EMAIL_USER?.trim() ||
    process.env.SMTP_USER?.trim() ||
    `"${RECEIPT_ORG_NAME}" <noreply@localhost>`;

  const html = buildReceiptEmailHtml(fields);
  const dateFormatted = fields.dateFormatted;

  await transporter.sendMail({
    from,
    to,
    subject: "Payment Receipt - Akhil Bhartiya Kushwaha Mahasabha",
    text: [
      `Dear ${fields.fullName},`,
      "",
      "Your payment was successful.",
      "",
      `Plan: ${fields.planLabelHi}`,
      `Amount: ₹${fields.amountRupees}`,
      `Payment ID: ${fields.paymentId}`,
      `Order ID: ${fields.orderId}`,
      `Method: ${fields.method}`,
      `Date: ${dateFormatted}`,
      "",
      "यह एक कंप्यूटर जनित रसीद है",
    ].join("\n"),
    html,
  });
}
