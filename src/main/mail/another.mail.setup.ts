import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class PromotionalMailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendMail(options: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    attachments?: nodemailer.Attachment[];
  }) {
    const { to, subject, html, from, attachments } = options;

    try {
      const info = await this.transporter.sendMail({
        from:process.env.SMPT_FROM ,
        to,
        subject,
        html,
        attachments,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}