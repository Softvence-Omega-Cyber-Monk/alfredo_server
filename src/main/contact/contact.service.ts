import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(dto: CreateContactDto) {
    const { targetEmail, ...basicData } = dto;
    console.log('Creating contact with data:', dto);

    let contact;
    try {
      // First try saving with targetEmail
      contact = await this.prisma.contact.create({
        data: dto,
      });
      console.log('Contact saved to DB with targetEmail');
    } catch (dbError) {
      console.error('Failed to save contact with targetEmail, trying without it...', (dbError as Error).message);
      try {
        // Fallback to saving without targetEmail in case the column doesn't exist
        contact = await this.prisma.contact.create({
          data: basicData,
        });
        console.log('Contact saved to DB without targetEmail');
      } catch (retryError) {
        console.error('Final DB save failure:', retryError);
        throw retryError; // This will cause a 500 if the DB itself is unreachable/broken
      }
    }

    const emailToSendTo = targetEmail || 'info@vacanzagreece.gr';

    try {
      await this.mailService.sendMail({
        to: emailToSendTo,
        subject: `New Contact Message from ${dto.name}`,
        html: `
          <h3>New Contact Inquiry</h3>
          <p><strong>Name:</strong> ${dto.name}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>Phone:</strong> ${dto.phoneNumber}</p>
          <p><strong>Message:</strong></p>
          <p>${dto.opinion}</p>
        `,
      });
      console.log(`Email successfully sent to ${emailToSendTo}`);
    } catch (mailError) {
      console.error('Failed to send contact email:', mailError);
      // We don't throw here to ensure the contact is still considered "successfully processed" for the frontend
    }

    return contact;
  }

  findAll() {
    return this.prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  remove(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }
}
