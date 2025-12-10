// Warna Brand InkCuba
const colors = {
  primary: "#1B211A", // Dark Green/Black
  accent: "#F1F3E0", // Light Cream
  text: "#4a5568", // Dark Grey for text
  white: "#ffffff",
  border: "#e2e8f0",
};

const logoImg =
  "https://res.cloudinary.com/dz8dtz5ki/image/upload/v1765345442/inkcuba-logo_wbeifw.png";

const mainLayout = (contentTitle, contentBody) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${contentTitle}</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: ${
          colors.accent
        }; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${colors.primary}; }
        table { border-spacing: 0; border-collapse: collapse; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: ${
          colors.white
        }; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .btn { background-color: ${colors.primary}; color: ${
    colors.accent
  }; display: inline-block; padding: 14px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; font-size: 16px; }
        .credential-box { background-color: #f8fafc; border: 1px solid ${
          colors.border
        }; border-radius: 6px; padding: 20px; margin: 20px 0; }
        .label { font-size: 12px; text-transform: capitalize; color: #718096; letter-spacing: 1px; margin-bottom: 5px; }
        .value { font-size: 16px; font-weight: bold; color: ${
          colors.primary
        }; margin-bottom: 15px; }
        .password { font-family: 'Courier New', Courier, monospace; background-color: #edf2f7; padding: 8px 12px; border-radius: 4px; margin-top: 6px; letter-spacing: 1px; font-size: 14px; }
        
        @media screen and (max-width: 600px) {
          .content-padding { padding: 20px !important; }
        }
      </style>
    </head>
    <body>
      
      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${
        colors.accent
      }; padding: 40px 0;">
        <tr>
          <td align="center">
            
            <table class="container" border="0" cellpadding="0" cellspacing="0">
              
              <tr>
                <td align="center" style="background-color: ${colors.primary}; padding: 30px;">
                
                <div style="display: flex; justify-content: center; align-items: center;">
                  <img src=${logoImg} alt="logo" style="width: 6%;">
                  <h1 style="color: ${
                    colors.accent
                  }; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: capitalize;">InkCuba</h1>
                </div>
                  
                  <p style="color: ${
                    colors.accent
                  }; margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Student Portfolio Showcase</p>
                </td>
              </tr>

              <tr>
                <td class="content-padding" style="padding: 40px;">
                  ${contentBody}
                </td>
              </tr>

              <tr>
                <td align="center" style="background-color: #f7fafc; padding: 20px; border-top: 1px solid ${
                  colors.border
                }; color: #718096; font-size: 12px;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} InkCuba. All rights reserved.</p>
                  <p style="margin: 5px 0 0;">CSBI Web Team - Binus International</p>
                  <p style="margin-top: 10px; font-size: 10px; opacity: 0.7;">This is an automated message, please do not reply.</p>
                </td>
              </tr>

            </table>
            </td>
        </tr>
      </table>

    </body>
    </html>
  `;
};

export default mainLayout;
