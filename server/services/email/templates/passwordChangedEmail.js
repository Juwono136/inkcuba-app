import { getBaseLayout, getBrandHeader, getButton, getParagraph } from './layout.js';

/**
 * Email sent after user changes password via Edit Profile.
 * Informs the user that their password was changed and they must use the new password to log in.
 */
export function getPasswordChangedEmailHtml({ name, loginUrl }) {
  const safeName = name || 'there';

  const content = `
    ${getBrandHeader()}
    <h1 style="margin: 0 0 16px 0; font-size: 24px; line-height: 1.3; color: #303030;">Your password was changed</h1>
    ${getParagraph(
      `Hi ${safeName}, your Inkcuba account password was successfully changed from the Edit Profile page.`
    )}
    ${getParagraph(
      'From now on, please sign in using your new password. If you did not make this change, contact support immediately to secure your account.'
    )}
    ${getButton(loginUrl, 'Go to Inkcuba login')}
    ${getParagraph(
      'This is an automated security notification. For your safety, we recommend that you do not share your password with anyone.',
      { muted: true }
    )}
  `;

  const preheader = 'Your Inkcuba password was changed';
  return getBaseLayout(content, { preheader });
}
