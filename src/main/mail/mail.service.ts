import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    // Correctly initialize transporter using ConfigService
    const smtpPort = Number(this.configService.get<number>('SMTP_PORT', 587));
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Server is ready to take our messages');
      }
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    const mailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    // Let errors bubble up to the global exception filter
    await this.transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.to}`);
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const appUrl = this.configService.get<string>('CLIENT_URL');
    const resetUrl = `${appUrl}/reset-password?token=${token}`;
    const mailOptions = {
      to: email,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
      `,
    };

    await this.sendMail(mailOptions);
  }

  async sendOtpEmail(email: string, otp: string) {
    const mailOptions = {
      to: email,
      subject: 'Your OTP Code',
      html: `
        <p>Your OTP code is <strong>${otp}</strong>.</p>
        <p>This code is valid for 10 minutes.</p>
      `,
    };

    await this.sendMail(mailOptions);
  }
}