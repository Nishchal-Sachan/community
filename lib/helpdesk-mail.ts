import { ApiError } from "@/lib/api-error";
import { getEmailTransporter } from "@/services/emailService";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface HelpdeskMailPayload {
  name: string;
  phone: string;
  email: string;
  category: string;
  subCategory: string;
  location: string;
  description: string;
  urgency: string;
  attachmentUrl?: string;
}

/**
 * Helpdesk mail uses the same Nodemailer transporter as payment receipts (`getEmailTransporter` from `services/emailService`).
 */
export async function sendHelpdeskMail(payload: HelpdeskMailPayload): Promise<void> {
  const from = process.env.EMAIL_USER?.trim();
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!from) {
    throw new Error("No sender address (set EMAIL_USER)");
  }
  if (!to) {
    throw new Error("No helpdesk recipient (set ADMIN_EMAIL)");
  }

  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("SMTP not configured (set EMAIL_USER and EMAIL_PASS)");
  }

  const {
    name,
    phone,
    email,
    category,
    subCategory,
    location,
    description,
    urgency,
    attachmentUrl,
  } = payload;

  const messageBlock = [
    description.trim(),
    "",
    `Subcategory: ${subCategory}`,
    `Location: ${location}`,
    `Urgency: ${urgency}`,
  ].join("\n");
  const messageHtml = escapeHtml(messageBlock).replace(/\r\n|\r|\n/g, "<br/>");
  const emailLine =
    email.trim().length > 0 ? escapeHtml(email) : "—";
  const optionalExtra =
    attachmentUrl && attachmentUrl.length > 0
      ? `<p><b>Attachment:</b> <a href="${escapeHtml(attachmentUrl)}">${escapeHtml(attachmentUrl)}</a></p>`
      : "";

  const mailOptions = {
    from,
    to,
    subject: `Helpdesk: ${category}`,
    html: `
    <h2>New Helpdesk Request</h2>
    <p><b>Name:</b> ${escapeHtml(name)}</p>
    <p><b>Email:</b> ${emailLine}</p>
    <p><b>Phone:</b> ${escapeHtml(phone)}</p>
    <p><b>Category:</b> ${escapeHtml(category)}</p>
    <p><b>Message:</b> ${messageHtml}</p>
    ${optionalExtra}
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email error:", error);
    throw new ApiError(500, "Failed to send email");
  }
}
