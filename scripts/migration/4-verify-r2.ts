/**
 * Verify R2 contents against the local backup, by key and size.
 *
 * Independent of the uploader's own reporting - lists what the bucket actually
 * holds and diffs it. Also re-checks that every DB-referenced asset is present.
 *
 * Run:  npm run migrate:verify-r2
 */
import 'dotenv/config';
import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const DUMP = process.env.CLD_DUMP_DIR ?? path.join(__dirname, '..', '..', 'cld-full-dump');
const OUT = path.join(__dirname, 'out');
const BUCKET = process.env.R2_BUCKET!;
const ENDPOINT =
  process.env.R2_ENDPOINT ??
  `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`;

function walk(dir: string, root: string, out = new Map<string, number>()): Map<string, number> {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, root, out);
    else out.set(path.relative(root, full).split(path.sep).join('/'), fs.statSync(full).size);
  }
  return out;
}

async function main(): Promise<void> {
  const client = new S3Client({
    region: 'auto',
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const remote = new Map<string, number>();
  let token: string | undefined;
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: BUCKET, ContinuationToken: token, MaxKeys: 1000 }),
    );
    for (const o of res.Contents ?? []) {
      if (o.Key) remote.set(o.Key, o.Size ?? 0);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  const local = walk(DUMP, DUMP);

  const missing: string[] = [];
  const sizeMismatch: string[] = [];
  for (const [key, size] of local) {
    const r = remote.get(key);
    if (r === undefined) missing.push(key);
    else if (r !== size) sizeMismatch.push(`${key} (local ${size} vs r2 ${r})`);
  }
  const extra = [...remote.keys()].filter((k) => !local.has(k));

  const remoteBytes = [...remote.values()].reduce((a, b) => a + b, 0);
  console.log(`Bucket : ${BUCKET}`);
  console.log(`  objects in R2  : ${remote.size}  (${(remoteBytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  files locally  : ${local.size}`);
  console.log(`  missing in R2  : ${missing.length}`);
  console.log(`  size mismatch  : ${sizeMismatch.length}`);
  console.log(`  extra in R2    : ${extra.length}`);

  // Cross-check the assets the database actually depends on.
  const mapPath = path.join(OUT, 'url-map.json');
  if (fs.existsSync(mapPath)) {
    const map: Record<string, string> = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    const needed = new Set(Object.values(map));
    const notInR2 = [...needed].filter((k) => !remote.has(k));
    console.log(`\n  DB-referenced assets : ${needed.size}`);
    console.log(`  of those missing     : ${notInR2.length}`);
    if (notInR2.length) {
      for (const k of notInR2.slice(0, 20)) console.log(`    ${k}`);
      process.exitCode = 1;
    }
  }

  for (const m of missing.slice(0, 20)) console.log(`  MISSING: ${m}`);
  for (const m of sizeMismatch.slice(0, 20)) console.log(`  MISMATCH: ${m}`);

  if (missing.length || sizeMismatch.length) {
    console.log('\nFAIL - re-run `npm run migrate:upload` (it resumes).');
    process.exitCode = 1;
    return;
  }
  console.log('\nPASS - R2 matches the local backup exactly.');
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
