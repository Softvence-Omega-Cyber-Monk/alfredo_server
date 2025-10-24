import { Injectable } from '@nestjs/common';
import { MailService } from 'src/main/mail/mail.service';
import { TwilioService } from 'src/main/twilio/twilio.service';

@Injectable()
export class OtpService {
  constructor(
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {}

  generateOtp(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit
  }

async sendOtpByEmail(email: string, otp: string) {
  return this.mailService.sendMail({
    to: email,
    subject: '🔐 Your OTP Code',
    html: `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f5f7fa;
        padding: 40px 0;
        display: flex;
        justify-content: center;
      ">
        <div style="
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          padding: 30px 40px;
          max-width: 500px;
          width: 100%;
        ">
          <div style="text-align: center;">
            <h2 style="
              color: #1a73e8;
              margin-bottom: 10px;
              font-size: 24px;
            ">
              Email Verification Code
            </h2>

            <p style="
              color: #555;
              font-size: 15px;
              margin-bottom: 30px;
            ">
              Hello,<br/>
              Use the OTP below to verify your email.  
              This code is valid for <strong>10 minutes</strong>.
            </p>

            <div style="
              background-color: #eef4ff;
              border: 1px dashed #1a73e8;
              border-radius: 8px;
              padding: 15px 0;
              margin-bottom: 30px;
            ">
              <span style="
                font-size: 28px;
                color: #1a73e8;
                letter-spacing: 6px;
                font-weight: bold;
              ">${otp}</span>
            </div>

            <p style="
              color: #777;
              font-size: 14px;
            ">
              If you did not request this code, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

            <p style="
              color: #aaa;
              font-size: 12px;
            ">
              © ${new Date().getFullYear()} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  });
}


  async sendOtpByPhone(phone: string, otp: string) {
    const message = `Your OTP code is ${otp}`;
    return this.twilioService.sendSms(phone, message);
  }
}
