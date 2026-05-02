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

  async sendVerificationEmail(email: string, token: string, fullName: string) {
    const appUrl = this.configService.get<string>('CLIENT_URL');
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;
    const mailOptions = {
      to: email,
      subject: '✉️ Verify Your Email - Vacanza',
      html: `
        <div style="
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
          padding: 40px 0;
        ">
          <div style="
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
            padding: 30px 40px;
            max-width: 500px;
            margin: 0 auto;
          ">
            <div style="text-align: center;">
              <h2 style="
                color: #1a73e8;
                margin-bottom: 10px;
                font-size: 24px;
              ">
                Verify Your Email
              </h2>

              <p style="
                color: #555;
                font-size: 15px;
                margin-bottom: 30px;
              ">
                Hello ${fullName},<br/>
                Thank you for signing up! Please click the button below to verify your email address.
              </p>

              <a href="${verifyUrl}" style="
                display: inline-block;
                background-color: #1a73e8;
                color: #ffffff;
                text-decoration: none;
                padding: 14px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 30px;
              ">
                Verify Email
              </a>

              <p style="
                color: #777;
                font-size: 14px;
                margin-top: 25px;
              ">
                This link is valid for <strong>24 hours</strong>.<br/>
                If you did not create an account, you can safely ignore this email.
              </p>

              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

              <p style="
                color: #aaa;
                font-size: 12px;
              ">
                © ${new Date().getFullYear()} Vacanza. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    await this.sendMail(mailOptions);
  }
}