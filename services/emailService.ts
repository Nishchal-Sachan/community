import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

/** Avoid logging "Email credentials missing" on every getEmailTransporter() call. */
let loggedMissingCredentials = false;

/**
 * SMTP login: EMAIL_USER + EMAIL_PASS (optional legacy: SMTP_USER / SMTP_PASS).
 * Do not use ADMIN_EMAIL / ADMIN_EMAIL_PASS for authentication.
 */
function resolveAuth(): { user: string; pass: string } | null {
  const user = (process.env.EMAIL_USER || process.env.SMTP_USER)?.trim();
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  if (!user || !pass) {
    if (!loggedMissingCredentials) {
      loggedMissingCredentials = true;
      if (!process.env.EMAIL_USER?.trim() || !process.env.EMAIL_PASS) {
        console.error("Email credentials missing");
      }
    }
    return null;
  }
  return { user, pass };
}

/** True when EMAIL_USER+EMAIL_PASS (or legacy SMTP_*) are set. */
export function isSmtpConfigured(): boolean {
  return resolveAuth() !== null;
}

/**
 * Helpdesk notifications need a recipient inbox (ADMIN_EMAIL) plus working SMTP (EMAIL_*).
 */
export function isHelpdeskMailConfigured(): boolean {
  return isSmtpConfigured() && Boolean(process.env.ADMIN_EMAIL?.trim());
}

/**
 * Single shared Nodemailer transporter for payment receipts, helpdesk, etc.
 */
export function getEmailTransporter(): nodemailer.Transporter | null {
  const auth = resolveAuth();
  if (!auth) return null;

  if (!transporter) {
    const portRaw = process.env.SMTP_PORT;
    const port =
      portRaw !== undefined && portRaw !== ""
        ? parseInt(portRaw, 10)
        : 587;
    const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
    const secure =
      process.env.SMTP_SECURE === "true" ||
      (Number.isFinite(port) && port === 465);

    transporter = nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      ...(!secure ? { requireTLS: true } : {}),
      auth,
    });
  }
  return transporter;
}

export default getEmailTransporter;
