/**
 * Phase 1 - extract every Cloudinary URL referenced by the database.
 *
 * Read-only. Writes to scripts/migration/out/:
 *   url-map.json     { <cloudinary url>: <r2 object key> }   - drives upload + rewrite
 *   references.json  [ { model, id, field, index?, url, key } ] - which row uses what
 *   unparsed.json    URLs that look like Cloudinary but did not match the parser
 *
 * Run:  npm run migrate:extract
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { AssetRef, cloudinaryKey, isCloudinary } from './lib';

// Point at production without editing .env, e.g. over an SSH tunnel:
//   MIGRATION_DATABASE_URL=postgresql://user:pass@localhost:55432/alfredo_db
const DB_URL = process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;

const prisma = new PrismaClient({
  datasources: { db: { url: DB_URL } },
});
const OUT = path.join(__dirname, 'out');

/** Host:port/db only - never print credentials. */
function describeDb(url: string | undefined): string {
  if (!url) return '(unset)';
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname}`;
  } catch {
    return '(unparseable)';
  }
}

const refs: AssetRef[] = [];
const map = new Map<string, string>();
const unparsed: Omit<AssetRef, 'key'>[] = [];
const foreignHosts = new Map<string, number>();

function record(
  model: string,
  id: string,
  field: string,
  url: unknown,
  index?: number,
): void {
  if (typeof url !== 'string' || url.trim() === '') return;

  if (!isCloudinary(url)) {
    // Already-migrated or third-party URLs (Google/Facebook avatars etc). Counted, not migrated.
    let host = 'unparseable';
    try {
      host = new URL(url).host;
    } catch {
      /* not a URL at all */
    }
    foreignHosts.set(host, (foreignHosts.get(host) ?? 0) + 1);
    return;
  }

  const key = cloudinaryKey(url);
  if (!key) {
    unparsed.push({ model, id, field, index, url });
    return;
  }

  refs.push({ model, id, field, index, url, key });
  map.set(url, key);
}

async function main(): Promise<void> {
  console.log(`Database : ${describeDb(DB_URL)}`);
  console.log('Scanning for Cloudinary URLs...\n');

  // User.photo
  for (const r of await prisma.user.findMany({ select: { id: true, photo: true } })) {
    record('User', r.id, 'photo', r.photo);
  }

  // Onboarding.homeImages[] + coverImage
  for (const r of await prisma.onboarding.findMany({
    select: { id: true, homeImages: true, coverImage: true },
  })) {
    r.homeImages.forEach((u, i) => record('Onboarding', r.id, 'homeImages', u, i));
    record('Onboarding', r.id, 'coverImage', r.coverImage);
  }

  // Property.images (Json: [{ url, publicId }]) + coverImage
  for (const r of await prisma.property.findMany({
    select: { id: true, images: true, coverImage: true },
  })) {
    const images = Array.isArray(r.images) ? r.images : [];
    images.forEach((img: any, i) => record('Property', r.id, 'images', img?.url, i));
    record('Property', r.id, 'coverImage', r.coverImage);
  }

  // Amenity / TransportOption / SurroundingType .icon
  for (const r of await prisma.amenity.findMany({ select: { id: true, icon: true } })) {
    record('Amenity', r.id, 'icon', r.icon);
  }
  for (const r of await prisma.transportOption.findMany({ select: { id: true, icon: true } })) {
    record('TransportOption', r.id, 'icon', r.icon);
  }
  for (const r of await prisma.surroundingType.findMany({ select: { id: true, icon: true } })) {
    record('SurroundingType', r.id, 'icon', r.icon);
  }

  // Article.image
  for (const r of await prisma.article.findMany({ select: { id: true, image: true } })) {
    record('Article', r.id, 'image', r.image);
  }

  // ChatMessage.attachmentUrl
  for (const r of await prisma.chatMessage.findMany({
    select: { id: true, attachmentUrl: true },
  })) {
    record('ChatMessage', r.id, 'attachmentUrl', r.attachmentUrl);
  }

  // Badge.icon
  for (const r of await prisma.badge.findMany({ select: { id: true, icon: true } })) {
    record('Badge', r.id, 'icon', r.icon);
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(
    path.join(OUT, 'url-map.json'),
    JSON.stringify(Object.fromEntries(map), null, 2),
  );
  fs.writeFileSync(path.join(OUT, 'references.json'), JSON.stringify(refs, null, 2));
  if (unparsed.length) {
    fs.writeFileSync(path.join(OUT, 'unparsed.json'), JSON.stringify(unparsed, null, 2));
  }

  // ---- summary ----
  const byModel = new Map<string, number>();
  for (const r of refs) {
    const k = `${r.model}.${r.field}`;
    byModel.set(k, (byModel.get(k) ?? 0) + 1);
  }

  console.log('References found (a URL used in two rows counts twice):');
  for (const [k, n] of [...byModel.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(30)} ${n}`);
  }

  console.log(`\n  total references : ${refs.length}`);
  console.log(`  unique assets    : ${map.size}`);

  if (foreignHosts.size) {
    console.log('\nNon-Cloudinary URLs (left untouched by this migration):');
    for (const [h, n] of [...foreignHosts.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${h.padEnd(40)} ${n}`);
    }
  }

  if (unparsed.length) {
    console.log(
      `\n!! ${unparsed.length} Cloudinary URL(s) did not match the parser - see out/unparsed.json`,
    );
    console.log('   These will NOT be migrated until the parser handles them.');
  }

  console.log(`\nWrote ${OUT}\\url-map.json and references.json`);
  console.log('Next: npm run migrate:verify');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
