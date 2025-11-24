// Alternative email service using Brevo API (works on Render)
import https from "https";

const sendBrevoEmail = async (to, subject, htmlContent, textContent) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;

  if (!apiKey) {
    throw new Error("Brevo API key not configured");
  }

  const data = JSON.stringify({
    sender: {
      name: "SUST Connect",
      email: "noreply@sustconnect.com",
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent,
    textContent: textContent,
  });

  const options = {
    hostname: "api.brevo.com",
    port: 443,
    path: "/v3/smtp/email",
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
      "Content-Length": data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Email sent via Brevo API");
          resolve(JSON.parse(responseData));
        } else {
          console.error("❌ Brevo API error:", responseData);
          reject(
            new Error(`Brevo API error: ${res.statusCode} - ${responseData}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request error:", error);
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.setTimeout(30000); // 30 second timeout
    req.write(data);
    req.end();
  });
};

export const sendOTPEmail = async (email, otp, name) => {
  const htmlContent = `
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
  `;

  const textContent = `
Hello ${name}!

Welcome to SUST Connect! Your OTP code is: ${otp}

This code is valid for 10 minutes. Please enter it to verify your email.

If you didn't request this code, please ignore this email.

Best regards,
SUST Connect Team
  `;

  try {
    await sendBrevoEmail(
      email,
      "Verify Your SUST Connect Account - OTP Code",
      htmlContent,
      textContent
    );
    console.log("✅ OTP email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);

    // Log OTP to console as fallback
    console.log("\n" + "🔐".repeat(35));
    console.log(`🔐 FALLBACK OTP FOR ${email}: ${otp}`);
    console.log("🔐".repeat(35) + "\n");

    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
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
  `;

  const textContent = `
Hi ${name}!

Your account has been successfully verified! You're now part of the SUST Connect community.

What you can do on SUST Connect:
- Events - Discover and join campus events
- Study Groups - Find study partners and collaborate
- Jobs & Internships - Explore opportunities
- Food Orders - Order food and manage groups
- Lost & Found - Report and recover items

Ready to get started? Log in now and explore!

Best regards,
SUST Connect Team
  `;

  try {
    await sendBrevoEmail(
      email,
      "Welcome to SUST Connect! 🎉",
      htmlContent,
      textContent
    );
    console.log("✅ Welcome email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    // Don't throw - welcome email is not critical
  }
};
