import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role, BadgeType } from '@prisma/client';
import { PrismaService } from 'src/main/prisma/prisma.service';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(private prisma: PrismaService) { }

  private readonly logger = new Logger(SeederService.name);

  async onApplicationBootstrap() {
    await this.seedAdmin();
    await this.seedBadges();
    await this.seedAmenities();
    await this.seedTransports();
    await this.seedSurroundings();
  }

  private async seedAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await this.prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      this.logger.log('Admin already exists, skipping admin seeding.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        fullName: 'Admin User',
      },
    });

    this.logger.log(`Default admin created: ${adminEmail}`);
  }

  private async seedBadges() {
    const badges = Object.values(BadgeType);
    for (const type of badges) {
      const existing = await this.prisma.badge.findUnique({ where: { type } });
      if (!existing) {
        await this.prisma.badge.create({
          data: {
            type,
            displayName: type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            greek_displayName: type.replace(/_/g, ' '), // Placeholder for Greek
            description: `Badge for ${type}`,
          },
        });
      }
    }
    this.logger.log('Badges checked/seeded.');
  }

  private async seedAmenities() {
    const amenities = [
      { name: 'Air Conditioner', greek: 'Κλιματισμός' },
      { name: 'BBQ', greek: 'BBQ' },
      { name: 'Balcony', greek: 'Μπαλκόνι' },
      { name: 'Bathtub', greek: 'Μπανιέρα' },
      { name: 'Computer', greek: 'Υπολογιστής' },
      { name: 'Dishwasher', greek: 'Πλυντήριο πιάτων' },
      { name: 'Fridge', greek: 'Ψυγείο' },
      { name: 'Garden', greek: 'Κήπος' },
      { name: 'Gym Space', greek: 'Χώρος Γυμναστηρίου' },
      { name: 'LED TV', greek: 'LED TV' },
      { name: 'Microwave Oven', greek: 'Φούρνος μικροκυμάτων' },
      { name: 'Parking', greek: 'Πάρκινγκ' },
      { name: 'Playground', greek: 'Παιδική χαρά' },
      { name: 'Private Pool', greek: 'Ιδιωτική πισίνα' },
      { name: 'Swimming Pool', greek: 'Πισίνα' },
      { name: 'WIFI', greek: 'WIFI' },
      { name: 'Washing Machine', greek: 'Πλυντήριο ρούχων' },
    ];

    for (const item of amenities) {
      const existing = await this.prisma.amenity.findFirst({ where: { name: item.name } });
      if (!existing) {
        await this.prisma.amenity.create({
          data: { name: item.name, greek_name: item.greek }
        });
      }
    }
    this.logger.log('Amenities checked/seeded.');
  }

  private async seedTransports() {
    const transports = [
      { name: 'Bicycle', greek: 'Ποδήλατο' },
      { name: 'Boat', greek: 'Σκάφος' },
      { name: 'Bus', greek: 'Λεωφορείο' },
      { name: 'Motorbike', greek: 'Μοτοσυκλέτα' },
      { name: 'Car', greek: 'Αυτοκίνητο' },
      { name: 'Train', greek: 'Τρένο' },
    ];

    for (const item of transports) {
      const existing = await this.prisma.transportOption.findFirst({ where: { name: item.name } });
      if (!existing) {
        await this.prisma.transportOption.create({
          data: { name: item.name, greek_name: item.greek }
        });
      }
    }
    this.logger.log('Transports checked/seeded.');
  }

  private async seedSurroundings() {
    const surroundings = [
      { name: 'City', greek: 'Πόλη' },
      { name: 'Coastal', greek: 'Παραθαλάσσια' },
      { name: 'Countryside', greek: 'Εξοχή' },
      { name: 'Island', greek: 'Νησί' },
      { name: 'Lake', greek: 'Λίμνη' },
      { name: 'Mountain', greek: 'Βουνό' },
      { name: 'River', greek: 'Ποτάμι' },
      { name: 'Village', greek: 'Χωριό' },
    ];

    for (const item of surroundings) {
      const existing = await this.prisma.surroundingType.findFirst({ where: { name: item.name } });
      if (!existing) {
        await this.prisma.surroundingType.create({
          data: { name: item.name, greek_name: item.greek }
        });
      }
    }
    this.logger.log('Surroundings checked/seeded.');
  }
}
