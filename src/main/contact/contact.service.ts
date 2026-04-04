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
    const contact = await this.prisma.contact.create({
      data: dto,
    });

    const targetEmail = dto.targetEmail || 'info@vacanzagreece.gr';

    try {
      await this.mailService.sendMail({
        to: targetEmail,
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
    } catch (error) {
      console.error('Failed to send contact email:', error);
      // We don't throw here to ensure the contact is still saved in DB even if email fails
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
