import { getBaseLayout, getBrandHeader, getButton, getParagraph } from './layout.js';

/**
 * Returns full HTML for the email verification email.
 * @param {object} options - { name?: string, verifyUrl: string, expiryHours?: number }
 */
export function getVerificationEmailHtml(options) {
  const { name = 'User', verifyUrl, expiryHours = 24 } = options;
  const preheader = `Verify your ${name} account — click the link inside to get started.`;

  const content = `
    ${getBrandHeader()}
    <h1 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #303030;">
      Verify your email address
    </h1>
    ${getParagraph(`Hello ${name},`)}
    ${getParagraph(
      'Thanks for signing up for Inkcuba. To start using your account, please verify your email address by clicking the button below.'
    )}
    ${getButton(verifyUrl, 'Verify my email')}
    ${getParagraph(
      `This link will expire in ${expiryHours} hours. If you didn't create an account with us, you can safely ignore this email.`,
      { muted: true }
    )}
  `;

  return getBaseLayout(content, { preheader });
}
