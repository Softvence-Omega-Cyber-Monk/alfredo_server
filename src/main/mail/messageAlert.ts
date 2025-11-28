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
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              }
              .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 18px;
                text-align: center;
              }
              .header h1 {
                margin: 0;
                font-size: 22px;
              }
              .content {
                padding: 20px;
                text-align: center;
              }
              .content p {
                color: #333;
                font-size: 15px;
                line-height: 1.6;
              }

              /* PERFECT BLUE BUTTON */
              .btn {
                display: inline-block;
                background-color: #007bff;
                color: #ffffff !important;
                padding: 14px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                text-decoration: none;
                margin-top: 22px;
                box-shadow: 0 4px 10px rgba(0,123,255,0.3);
                transition: all 0.2s ease-in-out;
              }
              .btn:hover {
                background-color: #0056b3;
                box-shadow: 0 6px 14px rgba(0,123,255,0.4);
              }

              .footer {
                background-color:#f8f9fa;
                color:#6c757d;
                padding:20px;
                text-align:center;
                font-size:12px;
                border-top:1px solid #e9ecef;
              }
          </style>
      </head>

      <body>
          <div class="container">
              <div class="header">
                  <h1>New User Alert</h1>
              </div>

              <div class="content">
                  <p>${alertText}</p>

                  <!-- BLUE BUTTON -->
                  <a href="https://vacanzagreece.gr/" target="_blank" class="btn">
                    Check Message
                  </a>
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
