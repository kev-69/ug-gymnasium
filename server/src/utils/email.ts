import nodemailer from 'nodemailer';
import logger from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface SubscriptionEmailData {
  userName: string;
  userEmail: string;
  planName: string;
  duration: number;
  amount: number;
  startDate: Date;
  endDate: Date;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private isConfigured: boolean = false;

  constructor() {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logger.warn('Email service not configured. Email functionality will be disabled.');
      this.isConfigured = false;
      // Create a dummy transporter to prevent errors
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
      return;
    }

    // Create transporter with timeout and connection pooling
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Add connection pooling and timeout settings
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
    });

    // Verify transporter configuration (non-blocking)
    this.transporter.verify((error: Error | null) => {
      if (error) {
        logger.error('Email service configuration error:', error.message);
        logger.warn('Emails will not be sent. Please check your email configuration.');
        this.isConfigured = false;
      } else {
        logger.info('✅ Email service is ready to send messages');
        this.isConfigured = true;
      }
    });
  }

  /**
   * Send a generic email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Skip if email service is not configured
    if (!this.isConfigured) {
      logger.warn(`Email not sent (service not configured): ${options.subject}`);
      return false;
    }

    try {
      const mailOptions = {
        from: `"UG Gymnasium" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email sent successfully: ${info.messageId} - ${options.subject}`);
      return true;
    } catch (error: any) {
      // Log error but don't throw - email failures should not break the application
      logger.error(`❌ Error sending email (${options.subject}):`, error.message || error);
      
      // If it's a connection timeout, suggest checking configuration
      if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
        logger.warn('Email connection timeout. Please verify EMAIL_HOST, EMAIL_PORT, and credentials in .env file');
      }
      
      return false;
    }
  }

  /**
   * Send contact form email to admin
   */
  async sendContactEmail(data: ContactEmailData): Promise<boolean> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background-color: #2563eb;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 0 0 5px 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .info-row {
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 5px;
            }
            .value {
              color: #666;
            }
            .message-box {
              background-color: #f5f5f5;
              padding: 15px;
              border-left: 4px solid #2563eb;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Contact Form Submission</h2>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">From:</div>
                <div class="value">${data.name}</div>
              </div>
              <div class="info-row">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${data.email}">${data.email}</a></div>
              </div>
              <div class="info-row">
                <div class="label">Subject:</div>
                <div class="value">${data.subject}</div>
              </div>
              <div class="message-box">
                <div class="label">Message:</div>
                <div class="value">${data.message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="footer">
                <p>This email was sent from the UG Gymnasium contact form.</p>
                <p>Reply directly to this email to respond to ${data.name}.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
New Contact Form Submission

From: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
This email was sent from the UG Gymnasium contact form.
Reply to: ${data.email}
    `;

    return this.sendEmail({
      to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER || 'info@gymnasium.ug.edu.gh',
      subject: `Contact Form: ${data.subject}`,
      text: textContent,
      html: htmlContent,
    });
  }

  /**
   * Send subscription confirmation email to user
   */
  async sendSubscriptionConfirmation(data: SubscriptionEmailData): Promise<boolean> {
    const formattedStartDate = data.startDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    const formattedEndDate = data.endDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #10b981;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .subscription-card {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #eee;
            }
            .detail-label {
              font-weight: 600;
              color: #666;
            }
            .detail-value {
              color: #333;
              font-weight: 500;
            }
            .amount {
              font-size: 24px;
              color: #10b981;
              font-weight: bold;
            }
            .button {
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .success-badge {
              background-color: #d1fae5;
              color: #065f46;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 15px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Subscription Activated!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              <p>Congratulations! Your subscription has been successfully activated.</p>
              
              <div class="subscription-card">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span class="success-badge">✓ ACTIVE</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Plan Name:</span>
                  <span class="detail-value">${data.planName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${data.duration} days</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span class="detail-value">${formattedStartDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span class="detail-value">${formattedEndDate}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none; padding-top: 20px;">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="amount">GH₵ ${data.amount.toFixed(2)}</span>
                </div>
              </div>

              <p><strong>What's Next?</strong></p>
              <ul>
                <li>Visit our facility during operating hours (Mon-Fri: 6AM - 8PM, Sat: 6AM - 12PM)</li>
                <li>Bring a valid ID for verification at the front desk</li>
                <li>Your subscription will expire on ${formattedEndDate}</li>
                <li>You'll receive a reminder email before expiration</li>
              </ul>

              <center>
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Dashboard</a>
              </center>

              <div class="footer">
                <p><strong>UG Gymnasium</strong></p>
                <p>University of Ghana, Legon Campus</p>
                <p>Phone: +233 (0) 555 419 992 | Email: info@gymnasium.ug.edu.gh</p>
                <p style="margin-top: 15px; font-size: 11px;">
                  If you have any questions or concerns, please don't hesitate to contact us.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
🎉 Subscription Activated!

Dear ${data.userName},

Congratulations! Your subscription has been successfully activated.

Subscription Details:
---------------------
Plan Name: ${data.planName}
Duration: ${data.duration} days
Start Date: ${formattedStartDate}
End Date: ${formattedEndDate}
Amount Paid: GH₵ ${data.amount.toFixed(2)}

What's Next?
- Visit our facility during operating hours (Mon-Fri: 6AM - 8PM, Sat: 6AM - 12PM)
- Bring a valid ID for verification at the front desk
- Your subscription will expire on ${formattedEndDate}
- You'll receive a reminder email before expiration

View your dashboard: ${process.env.FRONTEND_URL}/dashboard

---
UG Gymnasium
University of Ghana, Legon Campus
Phone: +233 (0) 555 419 992
Email: info@gymnasium.ug.edu.gh

If you have any questions or concerns, please don't hesitate to contact us.
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: '🎉 Your UG Gymnasium Subscription is Active!',
      text: textContent,
      html: htmlContent,
    });
  }

  /**
   * Send subscription expiration warning email
   */
  async sendSubscriptionExpirationWarning(data: SubscriptionEmailData, daysUntilExpiration: number): Promise<boolean> {
    const formattedEndDate = data.endDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #f59e0b;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .warning-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .days-remaining {
              font-size: 36px;
              color: #f59e0b;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .button {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 14px 35px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Subscription Expiring Soon</h1>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              
              <div class="warning-box">
                <p style="margin: 0; font-weight: 600;">Your UG Gymnasium subscription is expiring soon!</p>
              </div>

              <div class="days-remaining">
                ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''} remaining
              </div>

              <p><strong>Subscription Details:</strong></p>
              <ul>
                <li>Plan: ${data.planName}</li>
                <li>Expiration Date: ${formattedEndDate}</li>
              </ul>

              <p>Don't let your fitness journey stop! Renew your subscription today to continue enjoying our world-class facilities.</p>

              <p><strong>Why Renew?</strong></p>
              <ul>
                <li>✓ Uninterrupted access to all gym equipment</li>
                <li>✓ Continue your fitness progress</li>
                <li>✓ Keep your routine on track</li>
                <li>✓ Stay part of the UG Gymnasium community</li>
              </ul>

              <center>
                <a href="${process.env.FRONTEND_URL}/plans" class="button">Renew Subscription</a>
              </center>

              <div class="footer">
                <p><strong>UG Gymnasium</strong></p>
                <p>University of Ghana, Legon Campus</p>
                <p>Phone: +233 (0) 555 419 992 | Email: info@gymnasium.ug.edu.gh</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
⏰ Subscription Expiring Soon

Dear ${data.userName},

Your UG Gymnasium subscription is expiring soon!

Days Remaining: ${daysUntilExpiration}

Subscription Details:
- Plan: ${data.planName}
- Expiration Date: ${formattedEndDate}

Don't let your fitness journey stop! Renew your subscription today to continue enjoying our world-class facilities.

Why Renew?
✓ Uninterrupted access to all gym equipment
✓ Continue your fitness progress
✓ Keep your routine on track
✓ Stay part of the UG Gymnasium community

Renew now: ${process.env.FRONTEND_URL}/plans

---
UG Gymnasium
University of Ghana, Legon Campus
Phone: +233 (0) 555 419 992
Email: info@gymnasium.ug.edu.gh
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: `⏰ Your Subscription Expires in ${daysUntilExpiration} Day${daysUntilExpiration !== 1 ? 's' : ''}`,
      text: textContent,
      html: htmlContent,
    });
  }

  /**
   * Send subscription expired notification
   */
  async sendSubscriptionExpired(data: SubscriptionEmailData): Promise<boolean> {
    const formattedEndDate = data.endDate.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #dc2626;
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 5px 5px;
            }
            .expired-box {
              background-color: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
              text-align: center;
            }
            .expired-badge {
              background-color: #dc2626;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: 600;
              display: inline-block;
            }
            .button {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 14px 35px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
              font-weight: 600;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #888;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Expired</h1>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              
              <div class="expired-box">
                <span class="expired-badge">EXPIRED</span>
                <p style="margin-top: 15px; margin-bottom: 0;">Your subscription ended on ${formattedEndDate}</p>
              </div>

              <p>Your <strong>${data.planName}</strong> subscription has expired. We hope you enjoyed your time at UG Gymnasium!</p>

              <p><strong>Want to Continue?</strong></p>
              <p>Reactivate your membership and get back to achieving your fitness goals. Choose from our flexible plans designed for students, staff, and community members.</p>

              <center>
                <a href="${process.env.FRONTEND_URL}/plans" class="button">Browse Plans & Subscribe</a>
              </center>

              <p style="margin-top: 30px;"><strong>We'd Love to Have You Back!</strong></p>
              <p>If you have any questions or need assistance, our team is here to help.</p>

              <div class="footer">
                <p><strong>UG Gymnasium</strong></p>
                <p>University of Ghana, Legon Campus</p>
                <p>Phone: +233 (0) 555 419 992 | Email: info@gymnasium.ug.edu.gh</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
Subscription Expired

Dear ${data.userName},

Your UG Gymnasium subscription has expired.

Expired Subscription:
- Plan: ${data.planName}
- Expiration Date: ${formattedEndDate}

Want to Continue?
Reactivate your membership and get back to achieving your fitness goals. Choose from our flexible plans designed for students, staff, and community members.

Browse plans and subscribe: ${process.env.FRONTEND_URL}/plans

We'd Love to Have You Back!
If you have any questions or need assistance, our team is here to help.

---
UG Gymnasium
University of Ghana, Legon Campus
Phone: +233 (0) 555 419 992
Email: info@gymnasium.ug.edu.gh
    `;

    return this.sendEmail({
      to: data.userEmail,
      subject: 'Your UG Gymnasium Subscription Has Expired',
      text: textContent,
      html: htmlContent,
    });
  }
}

// Export singleton instance
export default new EmailService();
