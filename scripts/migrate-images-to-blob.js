/* One-off migration: moves product images stored as base64 data URIs
   directly in the database over to Vercel Blob storage, replacing each
   data: URI column with the resulting https:// blob URL. Run manually:

     node scripts/migrate-images-to-blob.js [--dry-run]

   Requires BLOB_READ_WRITE_TOKEN and DATABASE_URL to be set (.env is
   loaded automatically). --dry-run reports what would change without
   writing anything. Safe to re-run: only touches columns that still
   start with "data:". */
require('dotenv').config();
const { Pool } = require('pg');
const { put } = require('@vercel/blob');

const dryRun = process.argv.includes('--dry-run');

const EXTENSION_BY_MIME = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function parseDataUri(value) {
  if (typeof value !== 'string' || !value.startsWith('data:')) return null;
  const match = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  const [, mimeType, base64] = match;
  return { mimeType, buffer: Buffer.from(base64, 'base64') };
}

async function migrateColumn(pool, productId, columnLabel, columnSql, value, stats) {
  const parsed = parseDataUri(value);
  if (!parsed) return null;
  const ext = EXTENSION_BY_MIME[parsed.mimeType] || 'bin';
  const beforeKb = Math.round(value.length / 1024);
  console.log(`Product ${productId} ${columnLabel}: ${beforeKb}KB base64 -> uploading (${parsed.mimeType})`);
  stats.bytesBefore += value.length;
  if (dryRun) return null;
  const blob = await put(`products/${productId}-${columnLabel}-${Date.now()}.${ext}`, parsed.buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: parsed.mimeType,
  });
  console.log(`  -> ${blob.url}`);
  return { columnSql, url: blob.url };
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN is not set. Add it to .env (from your Vercel Blob store) before running this.');
    process.exit(1);
  }
  const pool = new Pool(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  } : undefined);

  const stats = { productsTouched: 0, columnsMigrated: 0, bytesBefore: 0, errors: 0 };

  try {
    const { rows } = await pool.query(
      `SELECT id, image_path, image_path_2, image_path_3 FROM products
       WHERE image_path LIKE 'data:%' OR image_path_2 LIKE 'data:%' OR image_path_3 LIKE 'data:%'
       ORDER BY id`
    );
    console.log(`Found ${rows.length} product(s) with base64 images.${dryRun ? ' (dry run, no writes)' : ''}`);

    for (const row of rows) {
      const updates = [];
      try {
        const results = await Promise.all([
          migrateColumn(pool, row.id, 'image_path', 'image_path', row.image_path, stats),
          migrateColumn(pool, row.id, 'image_path_2', 'image_path_2', row.image_path_2, stats),
          migrateColumn(pool, row.id, 'image_path_3', 'image_path_3', row.image_path_3, stats),
        ]);
        for (const result of results) if (result) updates.push(result);
      } catch (error) {
        stats.errors += 1;
        console.error(`Product ${row.id}: upload failed - ${error.message}`);
        continue;
      }

      if (!updates.length) continue;
      stats.productsTouched += 1;
      stats.columnsMigrated += updates.length;

      if (dryRun) continue;
      const setClause = updates.map((update, index) => `${update.columnSql} = $${index + 2}`).join(', ');
      const values = [row.id, ...updates.map(update => update.url)];
      await pool.query(`UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $1`, values);
    }

    console.log('---');
    console.log(`Products touched: ${stats.productsTouched}`);
    console.log(`Image columns migrated: ${stats.columnsMigrated}`);
    console.log(`Base64 bytes ${dryRun ? 'that would be removed' : 'removed'} from the database: ${Math.round(stats.bytesBefore / 1024)}KB`);
    if (stats.errors) console.log(`Errors: ${stats.errors} (see above)`);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
