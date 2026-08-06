/**
 * Phase 2 - verify cld-full-dump/ actually covers every asset the database references.
 *
 * This is the gate. Until it passes, do not rewrite any URLs: a missing file here
 * means a live image that would 404 after Cloudinary goes away.
 *
 * Read-only. Writes scripts/migration/out/missing-assets.json when something is absent.
 *
 * Run:  npm run migrate:verify
 */
import * as fs from 'fs';
import * as path from 'path';
import { AssetRef } from './lib';

const OUT = path.join(__dirname, 'out');
const DUMP = process.env.CLD_DUMP_DIR ?? path.join(__dirname, '..', '..', 'cld-full-dump');

interface Missing {
  key: string;
  url: string;
  reason: 'absent' | 'empty';
  usedBy: string[];
}

function main(): void {
  const mapPath = path.join(OUT, 'url-map.json');
  const refsPath = path.join(OUT, 'references.json');

  if (!fs.existsSync(mapPath) || !fs.existsSync(refsPath)) {
    console.error('Missing out/url-map.json or out/references.json - run migrate:extract first.');
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(DUMP)) {
    console.error(`Backup directory not found: ${DUMP}`);
    console.error('Set CLD_DUMP_DIR if it lives somewhere else.');
    process.exitCode = 1;
    return;
  }

  const map: Record<string, string> = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  const refs: AssetRef[] = JSON.parse(fs.readFileSync(refsPath, 'utf8'));

  // key -> which rows use it, for a useful failure report
  const usedBy = new Map<string, string[]>();
  for (const r of refs) {
    const list = usedBy.get(r.key) ?? [];
    list.push(`${r.model}.${r.field}${r.index !== undefined ? `[${r.index}]` : ''} id=${r.id}`);
    usedBy.set(r.key, list);
  }

  const missing: Missing[] = [];
  let ok = 0;
  let bytes = 0;

  for (const [url, key] of Object.entries(map)) {
    const file = path.join(DUMP, key);
    if (!fs.existsSync(file)) {
      missing.push({ key, url, reason: 'absent', usedBy: usedBy.get(key) ?? [] });
      continue;
    }
    const size = fs.statSync(file).size;
    if (size === 0) {
      missing.push({ key, url, reason: 'empty', usedBy: usedBy.get(key) ?? [] });
      continue;
    }
    ok++;
    bytes += size;
  }

  // Files present in the dump that no DB row points at. Not a problem - they are
  // uploaded anyway, since something outside the DB may reference them.
  const onDisk = new Set<string>();
  const walk = (dir: string): void => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else onDisk.add(path.relative(DUMP, full).split(path.sep).join('/'));
    }
  };
  walk(DUMP);
  const referenced = new Set(Object.values(map));
  const orphans = [...onDisk].filter((f) => !referenced.has(f));

  console.log(`Backup dir : ${DUMP}`);
  console.log(`DB assets  : ${Object.keys(map).length} unique (${refs.length} references)`);
  console.log(`Files on disk: ${onDisk.size}\n`);
  console.log(`  present & non-empty : ${ok}  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  MISSING             : ${missing.length}`);
  console.log(`  unreferenced on disk: ${orphans.length}`);

  if (orphans.length) {
    const folders = new Map<string, number>();
    for (const o of orphans) {
      const f = o.includes('/') ? o.slice(0, o.indexOf('/')) : '(root)';
      folders.set(f, (folders.get(f) ?? 0) + 1);
    }
    console.log('\nUnreferenced files by folder (harmless - uploaded anyway):');
    for (const [f, n] of [...folders.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${f.padEnd(25)} ${n}`);
    }
  }

  if (missing.length) {
    fs.writeFileSync(path.join(OUT, 'missing-assets.json'), JSON.stringify(missing, null, 2));
    console.log('\n=========================================');
    console.log(`FAIL - ${missing.length} referenced asset(s) are not in the backup.`);
    console.log('=========================================\n');
    for (const m of missing.slice(0, 20)) {
      console.log(`  [${m.reason}] ${m.key}`);
      for (const u of m.usedBy.slice(0, 3)) console.log(`      used by ${u}`);
    }
    if (missing.length > 20) console.log(`  ... and ${missing.length - 20} more`);
    console.log('\nFull list: out/missing-assets.json');
    console.log('Re-download these from Cloudinary while access still works.');
    process.exitCode = 1;
    return;
  }

  console.log('\n=========================================');
  console.log('PASS - every DB-referenced asset is in the backup.');
  console.log('=========================================');
  console.log('Safe to upload cld-full-dump/ to R2 and rewrite URLs.');
}

main();
