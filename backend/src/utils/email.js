import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter =
  env.smtpHost && env.smtpUser && env.smtpPass
    ? nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpPort === 465,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      })
    : null;

async function sendEmail({ to, subject, html }) {
  if (!transporter) {
    console.warn(`SMTP not configured — email to ${to} not sent. Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: env.emailFrom, to, subject, html });
}

export async function sendVerificationEmail(to, token) {
  const link = `${env.clientUrl}/verify-email?token=${token}`;
  await sendEmail({
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
  await sendEmail({
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
  await sendEmail({
    to,
    subject: "Reset your Harjeeo password",
    html: `
      <p>We received a request to reset your Harjeeo password.</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>
    `,
  });
}
