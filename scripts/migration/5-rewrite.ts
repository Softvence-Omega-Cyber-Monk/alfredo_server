/**
 * Phase 6 - rewrite Cloudinary URLs in the database to the R2 CDN.
 *
 * Uses the same out/url-map.json that drove the upload, so a DB value can never
 * disagree with what is actually in the bucket.
 *
 * Also rewrites the stored publicId / iconPublicId to the R2 object key. Without
 * that, deleting a property image or badge icon would silently no-op forever,
 * because the old Cloudinary public_id is not a valid R2 key.
 *
 * DRY RUN BY DEFAULT. Nothing is written unless you pass --apply.
 *
 *   npm run migrate:rewrite            # report what would change
 *   npm run migrate:rewrite -- --apply # actually write
 *
 * Take a database backup first:
 *   pg_dump "$DATABASE_URL" -Fc -f backup-pre-r2.dump
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { isCloudinary } from './lib';

const APPLY = process.argv.includes('--apply');
const DB_URL = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
const BASE = (process.env.R2_PUBLIC_URL ?? '').replace(/\/+$/, '');
const OUT = path.join(__dirname, 'out');

const prisma = new PrismaClient({ datasources: { db: { url: DB_URL } } });

const map: Record<string, string> = JSON.parse(
  fs.readFileSync(path.join(OUT, 'url-map.json'), 'utf8'),
);

const unmapped = new Set<string>();
const counts = new Map<string, number>();

function bump(label: string): void {
  counts.set(label, (counts.get(label) ?? 0) + 1);
}

/** Cloudinary URL -> CDN URL. Non-Cloudinary values pass through untouched. */
function conv(url: unknown, label: string): any {
  if (!isCloudinary(url)) return url;
  const key = map[url];
  if (!key) {
    unmapped.add(url);
    return url;
  }
  bump(label);
  return `${BASE}/${key}`;
}

async function main(): Promise<void> {
  if (!BASE) {
    console.error('R2_PUBLIC_URL is not set in .env');
    process.exit(1);
  }

  // Parse rather than regex-mask: passwords can contain '@', which makes a
  // naive `://[^@]*@` replacement leak the tail of the credential.
  let dbLabel = '(unparseable)';
  try {
    const u = new URL(DB_URL!);
    dbLabel = `${u.host}${u.pathname}`;
  } catch {
    /* leave as unparseable rather than risk printing credentials */
  }
  console.log(`Database : ${dbLabel}`);
  console.log(`CDN base : ${BASE}`);
  console.log(`Mode     : ${APPLY ? 'APPLY (writing)' : 'DRY RUN (no writes)'}\n`);

  // ---- User.photo ----
  for (const r of await prisma.user.findMany({ select: { id: true, photo: true } })) {
    const next = conv(r.photo, 'User.photo');
    if (next !== r.photo && APPLY) {
      await prisma.user.update({ where: { id: r.id }, data: { photo: next } });
    }
  }

  // ---- Onboarding.homeImages[] + coverImage ----
  for (const r of await prisma.onboarding.findMany({
    select: { id: true, homeImages: true, coverImage: true },
  })) {
    const homeImages = r.homeImages.map((u) => conv(u, 'Onboarding.homeImages'));
    const coverImage = conv(r.coverImage, 'Onboarding.coverImage');
    const changed =
      coverImage !== r.coverImage ||
      homeImages.some((v: string, i: number) => v !== r.homeImages[i]);
    if (changed && APPLY) {
      await prisma.onboarding.update({
        where: { id: r.id },
        data: { homeImages, coverImage },
      });
    }
  }

  // ---- Property.images (Json [{url, publicId}]) + coverImage ----
  for (const r of await prisma.property.findMany({
    select: { id: true, images: true, coverImage: true },
  })) {
    const src = Array.isArray(r.images) ? r.images : [];
    let touched = false;

    const images = src.map((img: any) => {
      if (!isCloudinary(img?.url)) return img;
      const key = map[img.url];
      const next = conv(img.url, 'Property.images');
      if (next === img.url) return img;
      touched = true;
      // Keep publicId in step with the URL, or deletes break later.
      return { ...img, url: next, publicId: key ?? img.publicId };
    });

    const coverImage = conv(r.coverImage, 'Property.coverImage');
    if ((touched || coverImage !== r.coverImage) && APPLY) {
      await prisma.property.update({
        where: { id: r.id },
        data: { images, coverImage },
      });
    }
  }

  // ---- Amenity / TransportOption / SurroundingType .icon ----
  for (const model of ['amenity', 'transportOption', 'surroundingType'] as const) {
    const rows = await (prisma[model] as any).findMany({
      select: { id: true, icon: true },
    });
    for (const r of rows) {
      const next = conv(r.icon, `${model}.icon`);
      if (next !== r.icon && APPLY) {
        await (prisma[model] as any).update({ where: { id: r.id }, data: { icon: next } });
      }
    }
  }

  // ---- Article.image ----
  for (const r of await prisma.article.findMany({ select: { id: true, image: true } })) {
    const next = conv(r.image, 'Article.image');
    if (next !== r.image && APPLY) {
      await prisma.article.update({ where: { id: r.id }, data: { image: next } });
    }
  }

  // ---- ChatMessage.attachmentUrl ----
  for (const r of await prisma.chatMessage.findMany({
    select: { id: true, attachmentUrl: true },
  })) {
    const next = conv(r.attachmentUrl, 'ChatMessage.attachmentUrl');
    if (next !== r.attachmentUrl && APPLY) {
      await prisma.chatMessage.update({
        where: { id: r.id },
        data: { attachmentUrl: next },
      });
    }
  }

  // ---- Badge.icon + iconPublicId ----
  for (const r of await prisma.badge.findMany({
    select: { id: true, icon: true, iconPublicId: true },
  })) {
    const next = conv(r.icon, 'Badge.icon');
    if (next !== r.icon && APPLY) {
      await prisma.badge.update({
        where: { id: r.id },
        data: { icon: next, iconPublicId: map[r.icon!] ?? r.iconPublicId },
      });
    }
  }

  // ---- summary ----
  console.log(APPLY ? 'Rewritten:' : 'Would rewrite:');
  let total = 0;
  for (const [k, n] of [...counts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(30)} ${n}`);
    total += n;
  }
  console.log(`\n  total : ${total}`);

  if (unmapped.size) {
    console.log(`\n!! ${unmapped.size} Cloudinary URL(s) are not in url-map.json:`);
    for (const u of [...unmapped].slice(0, 10)) console.log(`   ${u}`);
    console.log('   Re-run migrate:extract - the map is stale.');
    process.exitCode = 1;
    return;
  }

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to write these changes.');
    console.log('Take a pg_dump backup first.');
  } else {
    console.log('\nDone. Verify with: npm run migrate:extract  (should report 0 assets)');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
