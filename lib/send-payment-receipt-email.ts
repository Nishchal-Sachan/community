import nodemailer from "nodemailer";
import {
  buildReceiptEmailHtml,
  RECEIPT_ORG_NAME,
  type ReceiptEmailFields,
} from "@/lib/payment-receipt-html";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendPaymentReceiptEmail(
  to: string,
  fields: ReceiptEmailFields
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[payment-receipt] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS); skipping email"
    );
    return;
  }

  const from =
    process.env.SMTP_FROM?.trim() ||
    process.env.SMTP_USER ||
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
