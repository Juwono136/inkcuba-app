import { getBaseLayout, getBrandHeader, getButton, getParagraph } from './layout.js';

export function getNewAdminUserEmailHtml({ name, email, password, loginUrl }) {
  const safeName = name || 'there';
  const mutedLabelStyle =
    'font-size: 12px; color: #5a5a5a; text-transform: uppercase; letter-spacing: 0.08em; padding: 0 0 4px 0;';
  const codeBlockStyle =
    "font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace; font-size: 14px; padding: 8px 12px; border-radius: 8px; background-color: #F0F2E5; border: 1px solid #dde0d5; color: #303030;";

  const content = `
    ${getBrandHeader()}
    <h1 style="margin: 0 0 16px 0; font-size: 24px; line-height: 1.3; color: #303030;">Welcome to Inkcuba</h1>
    ${getParagraph(
      `Hi ${safeName}, your Inkcuba account has been created by an administrator.`
    )}
    ${getParagraph(
      'Please use the credentials below to sign in for the first time. For security reasons, you will be asked to change your password before accessing your dashboard.'
    )}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 16px 0 20px 0; width: 100%;">
      <tr>
        <td style="${mutedLabelStyle}">Email</td>
      </tr>
      <tr>
        <td style="${codeBlockStyle}">${email}</td>
      </tr>
      <tr>
        <td style="${mutedLabelStyle}; padding-top: 12px;">Temporary password</td>
      </tr>
      <tr>
        <td style="${codeBlockStyle}">${password}</td>
      </tr>
    </table>
    ${getParagraph(
      'This password is temporary and should not be shared with anyone. You will only use it once to set your own password.',
      { muted: true }
    )}
    ${getButton(loginUrl, 'Go to Inkcuba login')}
    ${getParagraph(
      'If you did not expect this email, you can safely ignore it or contact your administrator.',
      { muted: true }
    )}
  `;

  const preheader = `Your new Inkcuba account details for ${email}`;
  return getBaseLayout(content, { preheader });
}

