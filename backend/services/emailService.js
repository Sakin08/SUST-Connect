import { createTransport } from "nodemailer";

// Create transporter
const createTransporter = () => {
  // Brevo (Sendinblue) SMTP - Works on Render
  if (process.env.BREVO_SMTP_KEY) {
    console.log("✅ Using Brevo email service");
    console.log("SMTP User:", process.env.BREVO_SMTP_USER);
    console.log("SMTP Host: smtp-relay.brevo.com");

    // Use port 2525 for Render (less restricted than 587)
    const port = parseInt(process.env.BREVO_SMTP_PORT || "2525");
    console.log("SMTP Port:", port);

    return createTransport({
      host: "smtp-relay.brevo.com",
      port: port,
      secure: false, // false for 2525 and 587
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_KEY,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Gmail SMTP - Works on localhost only
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("✅ Using Gmail service:", process.env.EMAIL_USER);
    return createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback for development
  console.warn("⚠️ No email credentials configured. Emails will be logged.");
  return {
    sendMail: async (mailOptions) => {
      console.log("\n" + "=".repeat(70));
      console.log("📧 EMAIL (Development Mode)");
      console.log("=".repeat(70));
      console.log("To:", mailOptions.to);
      console.log("Subject:", mailOptions.subject);
      console.log("=".repeat(70));
      console.log(mailOptions.text || "See HTML content");
      console.log("=".repeat(70) + "\n");
      return { messageId: "dev-" + Date.now() };
    },
  };
};

export const sendOTPEmail = async (email, otp, name) => {
  const transporter = createTransporter();

  // Verify transporter connection before sending
  try {
    await transporter.verify();
    console.log("✅ Email server connection verified");
  } catch (error) {
    console.error("❌ Email server connection failed:", error.message);
    // Continue anyway - sometimes verify fails but sendMail works
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || "SUST Connect <noreply@sustconnect.com>",
    to: email,
    subject: "Verify Your SUST Connect Account - OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎓 SUST Connect</h1>
                  <p>SUST Student Community Platform</p>
              </div>
              <div class="content">
                  <h2>Hello ${name}! 👋</h2>
                  <p>Welcome to SUST Connect! We're excited to have you join our SUST community.</p>

                  <p>To complete your registration, please verify your email address using the OTP code below:</p>

                  <div class="otp-box">
                      <p style="margin: 0; color: #666; font-size: 14px;">Your OTP Code</p>
                      <div class="otp-code">${otp}</div>
                      <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">Valid for 10 minutes</p>
                  </div>

                  <div class="warning">
                      <strong>⚠️ Security Notice:</strong> Never share this code with anyone. SUST Connect staff will never ask for your OTP.
                  </div>

                  <p>If you didn't request this code, please ignore this email.</p>

                  <p>Best regards,<br><strong>SUST Connect Team</strong></p>
              </div>
              <div class="footer">
                  <p>© 2025 SUST Connect - SUST Student Community Platform</p>
                  <p>This is an automated email. Please do not reply.</p>
              </div>
          </div>
      </body>
      </html>
    `,
    text: `
Hello ${name}!

Welcome to SUST Connect! Your OTP code is: ${otp}

This code is valid for 10 minutes. Please enter it to verify your email.

If you didn't request this code, please ignore this email.

Best regards,
SUST Connect Team
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent to:", email);
    console.log("Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    console.error("Error details:", {
      code: error.code,
      command: error.command,
      response: error.response,
    });

    // In production, log OTP to console as fallback
    if (process.env.NODE_ENV === "production") {
      console.log("\n" + "🔐".repeat(35));
      console.log(`🔐 FALLBACK OTP FOR ${email}: ${otp}`);
      console.log("🔐".repeat(35) + "\n");
    }

    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "SUST Connect <noreply@sustconnect.com>",
    to: email,
    subject: "Welcome to SUST Connect! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🎉 Welcome to SUST Connect!</h1>
              </div>
              <div class="content">
                  <h2>Hi ${name}! 👋</h2>
                  <p>Your account has been successfully verified! You're now part of the SUST Connect community.</p>

                  <h3>What you can do on SUST Connect:</h3>

                  <div class="feature"><strong>📅 Events</strong> - Discover and join campus events</div>
                  <div class="feature"><strong>📚 Study Groups</strong> - Find study partners and collaborate</div>
                  <div class="feature"><strong>💼 Jobs & Internships</strong> - Explore opportunities</div>
                  <div class="feature"><strong>🍔 Food Orders</strong> - Order food and manage groups</div>
                  <div class="feature"><strong>🔍 Lost & Found</strong> - Report and recover items</div>

                  <p style="margin-top: 30px;">Ready to get started? Log in now and explore!</p>

                  <p>Best regards,<br><strong>SUST Connect Team</strong></p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
  }
};
