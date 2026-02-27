import { getBaseLayout, getBrandHeader, getButton, getParagraph } from './layout.js';

/**
 * Returns full HTML for the password reset email.
 * @param {object} options - { name?: string, resetUrl: string, expiryHours?: number }
 */
export function getPasswordResetEmailHtml(options) {
  const { name = 'User', resetUrl, expiryHours = 1 } = options;
  const preheader = `Reset your password — we'll help you get back into your account.`;

  const content = `
    ${getBrandHeader()}
    <h1 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #303030;">
      Reset your password
    </h1>
    ${getParagraph(`Hello ${name},`)}
    ${getParagraph(
      'We received a request to reset the password for your Inkcuba account. Click the button below to choose a new password.'
    )}
    ${getButton(resetUrl, 'Reset password')}
    ${getParagraph(
      `This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}. If you didn't request a password reset, you can safely ignore this email — your password will stay the same.`,
      { muted: true }
    )}
  `;

  return getBaseLayout(content, { preheader });
}
