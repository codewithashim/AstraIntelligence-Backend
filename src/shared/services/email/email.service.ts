import nodemailer from 'nodemailer';
import { envConfig } from '../../config/env-config';
import { logger } from '../../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: string | Buffer;
    contentType?: string;
  }>;
}

interface EmailTemplateData {
  [key: string]: string | number | boolean | Date;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: envConfig.email.emailHost,
      port: envConfig.email.emailPort,
      secure: envConfig.email.emailSecure,
      auth: {
        user: envConfig.email.emailUser,
        pass: envConfig.email.emailPassword,
      },
    } as nodemailer.TransportOptions);

    // Verify transporter configuration on initialization
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready to send messages');
      }
    });
  }

  /**
   * Sends an email with the provided options.
   * @param options - Email options including to, subject, text, html, etc.
   * @throws Error if email sending fails
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: envConfig.email.emailFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to} with message ID ${info.messageId}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to send email to ${options.to}: ${errorMessage}`);
    }
  }

  /**
   * Renders a template string by replacing placeholders with data.
   * @param template - The template string with placeholders (e.g., {{name}})
   * @param data - Object containing key-value pairs to replace in the template
   * @returns Rendered string with placeholders replaced
   */
  private renderTemplate(template: string, data: EmailTemplateData): string {
    let rendered = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return rendered;
  }

  /**
   * Sends a templated email.
   * @param to - Recipient email address(es)
   * @param subject - Email subject
   * @param template - Object containing text and/or html templates with placeholders
   * @param data - Data to populate the template placeholders
   * @param additionalOptions - Optional CC, BCC, attachments, etc.
   */
  async sendTemplatedEmail(
    to: string | string[],
    subject: string,
    template: { text?: string; html?: string },
    data: EmailTemplateData,
    additionalOptions: Partial<EmailOptions> = {}
  ): Promise<void> {
    const text = template.text ? this.renderTemplate(template.text, data) : undefined;
    const html = template.html ? this.renderTemplate(template.html, data) : undefined;

    await this.sendEmail({
      to,
      subject,
      text,
      html,
      ...additionalOptions,
    });
  }

  /**
   * Sends a password reset email.
   * @param to - Recipient email address
   * @param resetUrl - URL for password reset
   */
  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const subject = 'Password Reset Request';
    const template = {
      text: 'Please use the following link to reset your password: {{resetUrl}}',
      html: `
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="{{resetUrl}}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };
    const data = { resetUrl };

    await this.sendTemplatedEmail(to, subject, template, data);
  }

  /**
   * Sends a visit reminder email to a customer.
   * @param to - Recipient email address
   * @param customerName - Customer's name
   * @param daysSinceLastVisit - Days since the last visit
   * @param lastVisitDate - Date of the last visit
   * @param preferredService - Customer's preferred service
   * @param offer - Personalized offer for the customer
   */
  async sendVisitReminderEmail(
    to: string,
    customerName: string,
    daysSinceLastVisit: number,
    lastVisitDate: Date,
    preferredService: string,
    offer: string
  ): Promise<void> {
    const subject = 'We Miss You at Astra Nails!';
    const template = {
      text: `Hi {{customerName}}, it's been {{daysSinceLastVisit}} days since your last visit on {{lastVisitDate}}. Book your next {{preferredService}} today and enjoy your personalized offer: {{offer}}`,
      html: `
        <h2>We Miss You, {{customerName}}!</h2>
        <p>It's been {{daysSinceLastVisit}} days since your last visit on {{lastVisitDate}}.</p>
        <p>Book your next {{preferredService}} today and enjoy this special offer just for you:</p>
        <p><strong>{{offer}}</strong></p>
        <a href="https://astranails.com/book">Book Now</a>
      `,
    };
    const data = {
      customerName,
      daysSinceLastVisit,
      lastVisitDate: lastVisitDate.toDateString(),
      preferredService,
      offer,
    };

    await this.sendTemplatedEmail(to, subject, template, data);
  }

  /**
   * Sends a personalized offer email to a customer.
   * @param to - Recipient email address
   * @param customerName - Customer's name
   * @param offer - Personalized offer for the customer
   */
  async sendPersonalizedOfferEmail(
    to: string,
    customerName: string,
    offer: string
  ): Promise<void> {
    const subject = 'Special Offer Just for You from Astra Nails!';
    const template = {
      text: `Hi {{customerName}}, we have a special offer for you: {{offer}}. Book now to take advantage of this deal!`,
      html: `
        <h2>A Special Offer for You, {{customerName}}!</h2>
        <p>We’re excited to offer you this exclusive deal:</p>
        <p><strong>{{offer}}</strong></p>
        <a href="https://astranails.com/book">Book Now</a>
      `,
    };
    const data = { customerName, offer };

    await this.sendTemplatedEmail(to, subject, template, data);
  }

  /**
   * Sends a loyalty program update email to a customer.
   * @param to - Recipient email address
   * @param customerName - Customer's name
   * @param tierName - Loyalty tier name (e.g., Basic, Silver, Gold)
   * @param benefits - Benefits of the tier
   */
  async sendLoyaltyProgramUpdateEmail(
    to: string,
    customerName: string,
    tierName: string,
    benefits: string
  ): Promise<void> {
    const subject = `Congratulations, ${customerName}! You've Reached ${tierName} Status`;
    const template = {
      text: `Hi {{customerName}}, congratulations on reaching {{tierName}} status in our loyalty program! You can now enjoy these benefits: {{benefits}}.`,
      html: `
        <h2>Congratulations, {{customerName}}!</h2>
        <p>You've reached <strong>{{tierName}}</strong> status in the Astra Nails Loyalty Program!</p>
        <p>Enjoy these exclusive benefits:</p>
        <ul>
          <li>{{benefits}}</li>
        </ul>
        <a href="https://astranails.com/book">Book Now to Use Your Benefits</a>
      `,
    };
    const data = { customerName, tierName, benefits };

    await this.sendTemplatedEmail(to, subject, template, data);
  }

  /**
   * Sends a promotional email to multiple customers.
   * @param to - Recipient email addresses
   * @param promotionTitle - Title of the promotion
   * @param promotionDetails - Details of the promotion
   * @param promotionImage - Optional URL to a promotional image
   */
  async sendPromotionalEmail(
    to: string | string[],
    promotionTitle: string,
    promotionDetails: string,
    promotionImage?: string
  ): Promise<void> {
    const subject = `New Promotion: ${promotionTitle}`;
    const template = {
      text: `Hi there, we have a new promotion for you! {{promotionTitle}}: {{promotionDetails}}. Book now to take advantage!`,
      html: `
        <h2>{{promotionTitle}}</h2>
        <p>{{promotionDetails}}</p>
        ${promotionImage ? `<img src="{{promotionImage}}" alt="Promotion Image" style="max-width: 100%;" />` : ''}
        <p><a href="https://astranails.com/book">Book Now</a></p>
      `,
    };
    const data = { promotionTitle, promotionDetails, promotionImage: promotionImage || '' };
    const attachments = promotionImage ? [] : undefined; // Add attachments if needed

    await this.sendTemplatedEmail(to, subject, template, data, { attachments });
  }
}

export const emailService = new EmailService();