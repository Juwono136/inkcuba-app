import mainLayout from "../layouts/mainLayout.js";

const welcomeEmail = (data) => {
  const { name, email, password, role, loginUrl } = data;

  const content = `
    <h2 style="color: #1B211A; margin-top: 0; font-size: 22px;">Welcome, ${name}!</h2>
    
    <p style="line-height: 1.6; color: #4a5568; font-size: 16px;">
      Your account has been successfully created by the administrator. You can now access the InkCuba platform to manage the portfolios.
    </p>

    <div class="credential-box">
      <div class="label">Role Access</div>
      <div class="value">${role.toUpperCase()}</div>
      
      <div style="border-top: 1px solid #e2e8f0; margin-bottom: 15px;"></div>

      <div class="label">Email Address</div>
      <div class="value">${email}</div>

      <div class="label">Temporary Password</div>
      <div class="value"><span class="password">${password}</span></div>
    </div>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
      <tr>
        <td align="center">
          <a href="${loginUrl}" class="btn">Login to Dashboard</a>
        </td>
      </tr>
    </table>

    <p style="margin-top: 30px; padding: 15px; background-color: #fff5f5; border-left: 4px solid #fc8181; color: #c53030; font-size: 14px; line-height: 1.5;">
      <strong>Security Alert:</strong> Please change your password immediately after your first login to secure your account.
    </p>
  `;

  return mainLayout("Welcome to InkCuba", content);
};

export default welcomeEmail;
