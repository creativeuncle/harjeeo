import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function sendVerificationEmail(to, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — verification link for ${to}: ${link}`);
    return;
  }
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

export async function sendWorkspaceInviteEmail(to, { workspaceName, inviterName, token }) {
  const link = `${env.clientUrl}/invites/accept?token=${token}`;
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — workspace invite link for ${to}: ${link}`);
    return;
  }
  await resend.emails.send({
    from: env.emailFrom,
    to,
    subject: `${inviterName} invited you to ${workspaceName} on Harjeeo`,
    html: `
      <p>${inviterName} invited you to join <strong>${workspaceName}</strong> on Harjeeo.</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in 7 days.</p>
    `,
  });
}

export async function sendPasswordResetEmail(to, token) {
  const link = `${env.clientUrl}/reset-password?token=${token}`;
  if (!resend) {
    console.warn(`RESEND_API_KEY not set — reset link for ${to}: ${link}`);
    return;
  }
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
