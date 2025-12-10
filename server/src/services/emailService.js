import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import welcomeEmail from "../templates/emails/welcomeEmail.js";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
  }
};

export const sendNewUserCredentials = async (email, name, password, role) => {
  const emailData = {
    name,
    email,
    password,
    role,
    loginUrl: `${process.env.CLIENT_URL}/login`,
  };

  const html = welcomeEmail(emailData);

  await sendEmail(email, "Welcome to InkCuba - Your Access Credentials", html);
};
