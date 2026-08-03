import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = new Resend(env.resendApiKey);

export async function sendVerificationEmail(to, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: "Verify your Harjeeo email",
    html: `
      <p>Welcome to Harjeeo!</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;
  await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: "Reset your Harjeeo password",
    html: `
      <p>We received a request to reset your Harjeeo password.</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>
    `,
  });
}
