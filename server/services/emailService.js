import nodemailer from 'nodemailer';
import config from '../config/index.js';
import logger from '../logger/index.js';
import {
  getVerificationEmailHtml,
  getPasswordResetEmailHtml,
  getNewAdminUserEmailHtml,
} from './email/templates/index.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!config.email.host || !config.email.user) {
    logger.warn('SMTP not configured; email sending disabled');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
  return transporter;
}

/**
 * Send email. Returns { sent: true } or { sent: false, error }.
 * Does not throw; logs errors.
 */
export async function sendMail({ to, subject, html, text }) {
  const trans = getTransporter();
  if (!trans) {
    logger.debug('Email skipped (no SMTP)', { to, subject });
    return { sent: false, error: 'Email not configured' };
  }
  try {
    await trans.sendMail({
      from: config.email.from,
      to,
      subject,
      html: html || text,
      text: text || (html ? html.replace(/<[^>]*>/g, '') : undefined),
    });
    logger.info('Email sent', { to, subject });
    return { sent: true };
  } catch (err) {
    logger.error('Email send failed', { to, subject, error: err.message });
    return { sent: false, error: err.message };
  }
}

export function getVerificationUrl(token) {
  const base = config.frontend.url?.replace(/\/$/, '') || 'http://localhost:5173';
  return `${base}/verify-email?token=${token}`;
}

export function getResetPasswordUrl(token) {
  const base = config.frontend.url?.replace(/\/$/, '') || 'http://localhost:5173';
  return `${base}/reset-password?token=${token}`;
}

export async function sendVerificationEmail(to, name, token) {
  const verifyUrl = getVerificationUrl(token);
  const subject = 'Verify your Inkcuba account';
  const html = getVerificationEmailHtml({
    name: name || 'User',
    verifyUrl,
    expiryHours: config.auth.emailVerifyExpiryHours,
  });
  return sendMail({ to, subject, html });
}

export async function sendPasswordResetEmail(to, name, token) {
  const resetUrl = getResetPasswordUrl(token);
  const subject = 'Reset your Inkcuba password';
  const html = getPasswordResetEmailHtml({
    name: name || 'User',
    resetUrl,
    expiryHours: config.auth.passwordResetExpiryHours,
  });
  return sendMail({ to, subject, html });
}

export function getLoginUrl() {
  const base = config.frontend.url?.replace(/\/$/, '') || 'http://localhost:5173';
  return `${base}/login`;
}

export async function sendNewAdminUserEmail(to, name, password) {
  const loginUrl = getLoginUrl();
  const subject = 'Your new Inkcuba account';
  const html = getNewAdminUserEmailHtml({
    name: name || 'User',
    email: to,
    password,
    loginUrl,
  });
  return sendMail({ to, subject, html });
}

