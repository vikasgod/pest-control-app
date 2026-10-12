import nodemailer from "nodemailer";

export function createSmtpMailer() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.AUTH_EMAIL_FROM?.trim();
  const portValue = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(portValue);
  const username = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASS;
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const isGmail = host?.toLowerCase() === "gmail";

  if (!host || !from) {
    throw new Error("SMTP email is not configured. Set SMTP_HOST and AUTH_EMAIL_FROM.");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }
  if (secureValue && secureValue !== "true" && secureValue !== "false") {
    throw new Error("SMTP_SECURE must be either true or false.");
  }
  if (Boolean(username) !== Boolean(password)) {
    throw new Error("Set both SMTP_USER and SMTP_PASS, or leave both unset.");
  }

  if (isGmail) {
    if (!username || !password) {
      throw new Error("Gmail SMTP requires SMTP_USER and an app password in SMTP_PASS.");
    }
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user: username, pass: password },
      }),
      from,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureValue ? secureValue === "true" : port === 465,
    ...(username && password ? { auth: { user: username, pass: password } } : {}),
  });

  return { transporter, from };
}

export async function sendSmtpEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const { transporter, from } = createSmtpMailer();
  await transporter.sendMail({ from, to, subject, text });
}
