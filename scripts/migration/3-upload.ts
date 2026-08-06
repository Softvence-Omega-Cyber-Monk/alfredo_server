/**
 * Phase 4 - upload cld-full-dump/ to Cloudflare R2, preserving keys exactly.
 *
 * The on-disk path IS the R2 object key, so a DB URL rewrites to
 * `${R2_PUBLIC_URL}/${key}` with no further mapping.
 *
 * Resumable: objects already present in the bucket with a matching size are skipped,
 * so re-running after an interruption is cheap and safe.
 *
 * Run:  npm run migrate:upload
 */
import 'dotenv/config';
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const DUMP = process.env.CLD_DUMP_DIR ?? path.join(__dirname, '..', '..', 'cld-full-dump');
const BUCKET = process.env.R2_BUCKET;
const ENDPOINT =
  process.env.R2_ENDPOINT ??
  `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`;
const CONCURRENCY = 8;

/** Explicit map - a wrong Content-Type makes browsers download instead of display. */
const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
};

function requireEnv(): void {
  const missing = ['R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].filter(
    (k) => !process.env[k],
  );
  if (missing.length) {
    console.error(`Missing in .env: ${missing.join(', ')}`);
    process.exit(1);
  }
  if (!process.env.R2_ENDPOINT && !process.env.R2_ACCOUNT_ID) {
    console.error('Missing in .env: R2_ENDPOINT (or R2_ACCOUNT_ID)');
    process.exit(1);
  }
}

const s3 = () =>
  new S3Client({
    region: 'auto',
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

function walk(dir: string, root: string, out: string[] = []): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, root, out);
    else out.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return out;
}

async function main(): Promise<void> {
  requireEnv();

  if (!fs.existsSync(DUMP)) {
    console.error(`Backup directory not found: ${DUMP}`);
    process.exit(1);
  }

  const client = s3();
  const keys = walk(DUMP, DUMP);
  console.log(`Bucket   : ${BUCKET}`);
  console.log(`Endpoint : ${ENDPOINT}`);
  console.log(`Files    : ${keys.length}\n`);

  let uploaded = 0;
  let skipped = 0;
  let bytes = 0;
  const failed: { key: string; error: string }[] = [];
  const unknownType = new Set<string>();
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < keys.length) {
      const key = keys[cursor++];
      const file = path.join(DUMP, key);
      const size = fs.statSync(file).size;
      const ext = path.extname(key).toLowerCase();
      const contentType = MIME[ext];
      if (!contentType) unknownType.add(ext);

      try {
        // Skip if an object of the same size is already there.
        try {
          const head = await client.send(
            new HeadObjectCommand({ Bucket: BUCKET, Key: key }),
          );
          if (head.ContentLength === size) {
            skipped++;
            continue;
          }
        } catch {
          /* not present - fall through to upload */
        }

        await client.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: fs.readFileSync(file),
            ContentType: contentType ?? 'application/octet-stream',
            CacheControl: 'public, max-age=31536000, immutable',
            // SVG can carry <script>, which runs if the file is opened directly in a
            // browser tab. `attachment` blocks that navigation path; it is ignored for
            // subresource loads, so <img src="...svg"> still renders normally.
            ...(ext === '.svg' ? { ContentDisposition: 'attachment' } : {}),
          }),
        );
        uploaded++;
        bytes += size;
      } catch (e: any) {
        failed.push({ key, error: e?.message ?? String(e) });
      }

      const done = uploaded + skipped + failed.length;
      if (done % 100 === 0) {
        console.log(
          `  ${done}/${keys.length}  (${uploaded} uploaded, ${skipped} skipped, ${failed.length} failed)`,
        );
      }
    }
  }

  const started = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  const secs = ((Date.now() - started) / 1000).toFixed(0);

  console.log(`\nDone in ${secs}s`);
  console.log(`  uploaded : ${uploaded}  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  skipped  : ${skipped}  (already present, same size)`);
  console.log(`  failed   : ${failed.length}`);

  if (unknownType.size) {
    console.log(
      `\nNo Content-Type mapping for: ${[...unknownType].join(', ')} - sent as application/octet-stream.`,
    );
  }

  if (failed.length) {
    fs.writeFileSync(
      path.join(__dirname, 'out', 'upload-failures.json'),
      JSON.stringify(failed, null, 2),
    );
    console.log('\nFailures written to out/upload-failures.json');
    console.log('Re-run this command - it resumes and retries only what is missing.');
    process.exitCode = 1;
    return;
  }

  console.log('\nAll files present in R2.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
