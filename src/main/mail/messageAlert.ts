import { Injectable } from '@nestjs/common';

@Injectable()
export class MesageAlertMailTemplatesService {
  async getUserAlertTemplate(
    name: string,
    email: string,
  ): Promise<string> {
    const alertText = `${name} (${email}) has sent you a message. Please check it out.`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>New Message Alert</title>
          <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              .header { background-color: #007bff; color: #ffffff; padding: 18px; text-align: center; }
              .header h1 { margin: 0; font-size: 22px; }
              .content { padding: 20px; }
              .content p { color: #333; font-size: 15px; line-height: 1.6; }
              .footer { background-color:#f8f9fa; color:#6c757d; padding:20px; text-align:center; font-size:12px; border-top:1px solid #e9ecef; }
          </style>
      </head>

      <body>
          <div class="container">
              <div class="header">
                  <h1>New User Alert</h1>
              </div>

              <div class="content">
                  <p>${alertText}</p>
              </div>

              <div class="footer">
                  <p>This is an automated notification from your website contact form.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    return html;
  }
}
