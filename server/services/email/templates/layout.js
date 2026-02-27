/**
 * Base layout for transactional emails.
 * Color palette aligned with Inkcuba logo (cream, dark green, charcoal).
 * Responsive, inline styles for broad client support.
 */

const BRAND_NAME = 'Inkcuba';
/* Logo colors: front face green, left face charcoal, top face cream */
const BRAND_COLOR = '#3B613A';
const BRAND_COLOR_LIGHT = '#4a7549';
const TEXT_COLOR = '#303030';
const MUTED_COLOR = '#5a5a5a';
const BORDER_COLOR = '#dde0d5';
const BG_LIGHT = '#F0F2E5';
const CARD_BG = '#ffffff';

/**
 * Wrap content in a responsive email layout.
 * @param {string} content - HTML body content (inside main table cell)
 * @param {object} options - { preheader?: string }
 */
export function getBaseLayout(content, options = {}) {
  const { preheader = '' } = options;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${BRAND_NAME}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; max-width: 100% !important; }
      .inner { padding-left: 20px !important; padding-right: 20px !important; }
      .btn { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BG_LIGHT}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BG_LIGHT};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="wrapper" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: ${CARD_BG}; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(48, 48, 48, 0.12), 0 2px 4px -2px rgba(48, 48, 48, 0.08); overflow: hidden;">
          <tr>
            <td class="inner" style="padding: 40px 48px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 48px; background-color: ${BG_LIGHT}; border-top: 1px solid ${BORDER_COLOR};">
              <p style="margin: 0; font-size: 12px; color: ${MUTED_COLOR}; text-align: center;">
                This email was sent by ${BRAND_NAME} · Binus University International
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Render brand header (logo area).
 */
export function getBrandHeader() {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <span style="font-size: 24px; font-weight: 700; color: ${BRAND_COLOR}; letter-spacing: -0.5px;">${BRAND_NAME}</span>
        </td>
      </tr>
    </table>`;
}

/**
 * Render a primary CTA button.
 * @param {string} href - Link URL
 * @param {string} label - Button text
 */
export function getButton(href, label) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
      <tr>
        <td align="center">
          <a href="${href}" class="btn" style="display: inline-block; padding: 14px 32px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${label}</a>
        </td>
      </tr>
    </table>`;
}

/**
 * Paragraph with optional muted/small style.
 */
export function getParagraph(text, options = {}) {
  const { muted = false } = options;
  const style = muted
    ? `margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: ${MUTED_COLOR};`
    : `margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${TEXT_COLOR};`;
  return `<p style="${style}">${text}</p>`;
}

export const styles = {
  BRAND_NAME,
  BRAND_COLOR,
  BRAND_COLOR_LIGHT,
  TEXT_COLOR,
  MUTED_COLOR,
  BORDER_COLOR,
  BG_LIGHT,
  CARD_BG,
};
