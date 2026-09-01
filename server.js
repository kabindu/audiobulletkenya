require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Pool } = require('pg');
const { put } = require('@vercel/blob');
const adminCredentials = require('./admin-config');

const app = express();
const port = Number(process.env.PORT || 3000);
const uploadDirectory = process.env.VERCEL ? path.join('/tmp', 'audiobullet-uploads') : path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const pool = new Pool(process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
} : {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'audiobulletkenya',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || process.env.PG_PASSWORD || '',
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
});

pool.on('error', error => console.error('PostgreSQL pool error:', error.message));

const upload = multer({
  storage: process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
    destination: uploadDirectory,
    filename: (_request, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    },
  }),
  fileFilter: (_request, file, callback) => callback(null, file.mimetype.startsWith('image/')),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
const sessionCookie = 'audiobullet_admin';
const sessionLifetime = 8 * 60 * 60 * 1000;

function sessionToken(username, expiresAt) {
  const payload = `${username}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', adminCredentials.password).update(payload).digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

function isAuthenticated(request) {
  const cookies = Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map(cookie => {
    const separator = cookie.indexOf('=');
    return [cookie.slice(0, separator).trim(), decodeURIComponent(cookie.slice(separator + 1))];
  }));
  const [encodedPayload, signature] = (cookies[sessionCookie] || '').split('.');
  if (!encodedPayload || !signature) return false;
  const payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  const expectedSignature = crypto.createHmac('sha256', adminCredentials.password).update(payload).digest('hex');
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return false;
  const [username, expiresAt] = payload.split(':');
  return username === adminCredentials.username && Number(expiresAt) > Date.now();
}

function requireAdmin(request, response, next) {
  if (isAuthenticated(request)) return next();
  if (request.path === '/' || request.path.endsWith('.html')) return response.redirect('/admin/login');
  response.status(401).json({ error: 'Admin authentication required.' });
}

app.get('/admin/login', (_request, response) => response.sendFile(path.join(__dirname, 'admin', 'login.html')));
app.post('/admin/login', (request, response) => {
  const { username, password } = request.body || {};
  if (username !== adminCredentials.username || password !== adminCredentials.password) return response.status(401).json({ error: 'Invalid username or password.' });
  const expiresAt = Date.now() + sessionLifetime;
  response.set('Set-Cookie', `${sessionCookie}=${encodeURIComponent(sessionToken(username, expiresAt))}; HttpOnly; SameSite=Lax; ${process.env.VERCEL ? 'Secure; ' : ''}Path=/; Max-Age=${sessionLifetime / 1000}`);
  response.json({ ok: true });
});
app.post('/admin/logout', requireAdmin, (_request, response) => {
  response.set('Set-Cookie', `${sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  response.sendStatus(204);
});
app.get('/favicon.ico', (_request, response) => response.sendStatus(204));
app.use('/admin', requireAdmin);
app.use('/api', (request, response, next) => (request.path === '/catalog' || request.path.startsWith('/mpesa/') || request.path.startsWith('/card/')) ? next() : requireAdmin(request, response, next));
app.use('/uploads', express.static(uploadDirectory));
if (process.env.VERCEL) app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      brand_id INTEGER NOT NULL REFERENCES brands(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      original_price NUMERIC(12, 2) CHECK (original_price >= 0),
      stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
      badge VARCHAR(50),
      specifications VARCHAR(255),
      description TEXT,
      image_path TEXT,
      status VARCHAR(10) NOT NULL DEFAULT 'in' CHECK (status IN ('in', 'low', 'out')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE products ALTER COLUMN image_path TYPE TEXT;
    UPDATE products SET image_path = NULL WHERE image_path = '/uploads/undefined' OR image_path LIKE '%/undefined';
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      customer_name VARCHAR(150) NOT NULL,
      customer_phone VARCHAR(20) NOT NULL,
      customer_email VARCHAR(150),
      delivery_address TEXT NOT NULL,
      items JSONB NOT NULL,
      subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
      merchant_request_id VARCHAR(100),
      checkout_request_id VARCHAR(100) UNIQUE,
      mpesa_receipt VARCHAR(50),
      result_desc TEXT,
      payment_method VARCHAR(10) NOT NULL DEFAULT 'mpesa' CHECK (payment_method IN ('mpesa', 'card')),
      card_last4 VARCHAR(4),
      card_brand VARCHAR(20),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(10) NOT NULL DEFAULT 'mpesa';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);
  `);
}

async function initializeDatabaseWithRetry() {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await initializeDatabase();
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 1) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

const databaseReady = initializeDatabaseWithRetry();
app.use('/api', async (_request, _response, next) => {
  try {
    await databaseReady;
    next();
  } catch (error) {
    next(error);
  }
});

async function queryWithRetry(text, values = [], attempts = 2) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await pool.query(text, values);
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw lastError;
}

app.get('/api/catalog', async (_request, response) => {
  try {
    const [categories, brands, products] = await Promise.all([
      queryWithRetry('SELECT id, name FROM categories ORDER BY name'),
      queryWithRetry(`SELECT b.id, b.name, b.category_id, c.name AS category_name FROM brands b JOIN categories c ON c.id = b.category_id ORDER BY b.name`),
      queryWithRetry(`SELECT p.id, p.name, p.category_id, c.name AS category, p.brand_id, b.name AS brand, p.price, p.original_price AS "originalPrice", p.stock_quantity AS stock, p.badge, p.specifications AS spec, p.description, CASE WHEN p.image_path LIKE '%/undefined' THEN NULL ELSE p.image_path END AS image, p.status FROM products p JOIN categories c ON c.id = p.category_id JOIN brands b ON b.id = p.brand_id ORDER BY p.id DESC`),
    ]);
    response.json({ categories: categories.rows, brands: brands.rows, products: products.rows });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Could not load catalog data.' });
  }
});

/* ============================================================
   M-PESA (Daraja) STK PUSH CHECKOUT
   ============================================================ */
const mpesaBaseUrl = process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

function normalizeMpesaPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return null;
}

async function getMpesaAccessToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const response = await fetch(`${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!response.ok) throw new Error('Could not authenticate with M-Pesa.');
  const data = await response.json();
  return data.access_token;
}

app.post('/api/mpesa/stkpush', async (request, response) => {
  const body = request.body || {};
  const customer = body.customer || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const name = String(customer.name || '').trim();
  const address = String(customer.address || '').trim();
  const email = customer.email ? String(customer.email).trim() : null;
  const phone = normalizeMpesaPhone(customer.phone);
  if (!name || !address || !phone) return response.status(400).json({ error: 'Name, phone, and delivery address are required.' });
  if (!items.length) return response.status(400).json({ error: 'Your cart is empty.' });
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) return response.status(503).json({ error: 'M-Pesa payments are not configured yet.' });

  try {
    const ids = items.map(item => Number(item.productId)).filter(Boolean);
    const priced = await queryWithRetry('SELECT id, price FROM products WHERE id = ANY($1)', [ids]);
    const priceMap = new Map(priced.rows.map(row => [row.id, Number(row.price)]));
    let subtotal = 0;
    const orderItems = items.map(item => {
      const id = Number(item.productId);
      const qty = Math.max(1, Number(item.qty) || 1);
      const price = priceMap.get(id);
      if (price == null) throw new Error('One or more cart items are no longer available.');
      subtotal += price * qty;
      return { productId: id, qty, price };
    });
    const amount = Math.round(subtotal);
    if (amount < 1) return response.status(400).json({ error: 'Order total must be at least KSh 1.' });

    const orderResult = await queryWithRetry(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, items, subtotal) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, phone, email, address, JSON.stringify(orderItems), amount]
    );
    const orderId = orderResult.rows[0].id;

    const accessToken = await getMpesaAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const shortcode = process.env.MPESA_SHORTCODE;
    const password = Buffer.from(`${shortcode}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const stkResponse = await fetch(`${mpesaBaseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `AudioBullet-${orderId}`,
        TransactionDesc: `AudioBullet order #${orderId}`,
      }),
    });
    const stkData = await stkResponse.json();
    if (!stkResponse.ok || stkData.ResponseCode !== '0') {
      await queryWithRetry(`UPDATE orders SET status = 'failed', result_desc = $2, updated_at = NOW() WHERE id = $1`, [orderId, stkData.errorMessage || stkData.ResponseDescription || 'STK push failed.']);
      return response.status(502).json({ error: stkData.errorMessage || stkData.ResponseDescription || 'Could not start the M-Pesa payment.' });
    }

    await queryWithRetry(
      `UPDATE orders SET merchant_request_id = $2, checkout_request_id = $3, updated_at = NOW() WHERE id = $1`,
      [orderId, stkData.MerchantRequestID, stkData.CheckoutRequestID]
    );
    response.json({ orderId, checkoutRequestId: stkData.CheckoutRequestID });
  } catch (error) {
    console.error('STK push error:', error);
    response.status(500).json({ error: error.message || 'Could not start the M-Pesa payment.' });
  }
});

app.post('/api/mpesa/callback', async (request, response) => {
  try {
    const callback = request.body?.Body?.stkCallback;
    if (!callback) return response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callback;
    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const receipt = items.find(item => item.Name === 'MpesaReceiptNumber')?.Value || null;
      await queryWithRetry(
        `UPDATE orders SET status = 'paid', mpesa_receipt = $2, result_desc = $3, updated_at = NOW() WHERE checkout_request_id = $1`,
        [CheckoutRequestID, receipt, ResultDesc]
      );
    } else {
      await queryWithRetry(
        `UPDATE orders SET status = 'failed', result_desc = $2, updated_at = NOW() WHERE checkout_request_id = $1`,
        [CheckoutRequestID, ResultDesc]
      );
    }
    response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

app.get('/api/mpesa/status/:checkoutRequestId', async (request, response) => {
  try {
    const result = await queryWithRetry('SELECT id, status, mpesa_receipt, result_desc FROM orders WHERE checkout_request_id = $1', [request.params.checkoutRequestId]);
    if (!result.rowCount) return response.status(404).json({ error: 'Order not found.' });
    const order = result.rows[0];
    response.json({ orderId: order.id, status: order.status, mpesaReceipt: order.mpesa_receipt, message: order.result_desc });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Could not check payment status.' });
  }
});

/* ============================================================
   CARD CHECKOUT (demo/simulated — no gateway configured)
   Raw card numbers and CVVs are never persisted; only the last 4
   digits and detected brand are stored for the order record.
   ============================================================ */
function luhnCheck(digits) {
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function detectCardBrand(digits) {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return 'Card';
}

app.post('/api/card/charge', async (request, response) => {
  const body = request.body || {};
  const customer = body.customer || {};
  const card = body.card || {};
  const items = Array.isArray(body.items) ? body.items : [];
  const name = String(customer.name || '').trim();
  const address = String(customer.address || '').trim();
  const phone = String(customer.phone || '').trim();
  const email = customer.email ? String(customer.email).trim() : null;
  if (!name || !address || !phone) return response.status(400).json({ error: 'Name, phone, and delivery address are required.' });
  if (!items.length) return response.status(400).json({ error: 'Your cart is empty.' });

  const cardNumber = String(card.number || '').replace(/\s+/g, '');
  const cardName = String(card.name || '').trim();
  const expiry = String(card.expiry || '').trim();
  const cvv = String(card.cvv || '').trim();
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!/^\d{12,19}$/.test(cardNumber) || !luhnCheck(cardNumber)) return response.status(400).json({ error: 'Enter a valid card number.' });
  if (!cardName) return response.status(400).json({ error: 'Enter the name on the card.' });
  if (!expiryMatch) return response.status(400).json({ error: 'Enter the expiry as MM/YY.' });
  if (!/^\d{3,4}$/.test(cvv)) return response.status(400).json({ error: 'Enter a valid CVV.' });
  const expiryDate = new Date(2000 + Number(expiryMatch[2]), Number(expiryMatch[1]));
  if (Number(expiryMatch[1]) < 1 || Number(expiryMatch[1]) > 12 || expiryDate < new Date()) return response.status(400).json({ error: 'This card has expired.' });

  try {
    const ids = items.map(item => Number(item.productId)).filter(Boolean);
    const priced = await queryWithRetry('SELECT id, price FROM products WHERE id = ANY($1)', [ids]);
    const priceMap = new Map(priced.rows.map(row => [row.id, Number(row.price)]));
    let subtotal = 0;
    const orderItems = items.map(item => {
      const id = Number(item.productId);
      const qty = Math.max(1, Number(item.qty) || 1);
      const price = priceMap.get(id);
      if (price == null) throw new Error('One or more cart items are no longer available.');
      subtotal += price * qty;
      return { productId: id, qty, price };
    });
    const amount = Math.round(subtotal);
    if (amount < 1) return response.status(400).json({ error: 'Order total must be at least KSh 1.' });

    const orderResult = await queryWithRetry(
      `INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, items, subtotal, status, payment_method, card_last4, card_brand)
       VALUES ($1,$2,$3,$4,$5,$6,'paid','card',$7,$8) RETURNING id`,
      [name, phone, email, address, JSON.stringify(orderItems), amount, cardNumber.slice(-4), detectCardBrand(cardNumber)]
    );
    response.json({ orderId: orderResult.rows[0].id, status: 'paid' });
  } catch (error) {
    console.error('Card charge error:', error);
    response.status(500).json({ error: error.message || 'Could not process the card payment.' });
  }
});

app.use((error, _request, response, _next) => {
  console.error('Unhandled server error:', error);
  response.status(500).json({ error: 'Catalog service temporarily unavailable.' });
});

app.post('/api/categories', async (request, response) => {
  const name = String(request.body.name || '').trim();
  if (!name) return response.status(400).json({ error: 'Category name is required.' });
  try {
    const result = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id, name', [name]);
    response.status(201).json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Category already exists.' : 'Could not save category.' });
  }
});

app.put('/api/categories/:id', async (request, response) => {
  const name = String(request.body.name || '').trim();
  if (!name) return response.status(400).json({ error: 'Category name is required.' });
  try {
    const result = await pool.query('UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name', [name, request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Category not found.' });
    response.json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23505' ? 409 : 500).json({ error: error.code === '23505' ? 'Category already exists.' : 'Could not update category.' });
  }
});

app.delete('/api/categories/:id', async (request, response) => {
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Category not found.' });
    response.sendStatus(204);
  } catch (error) {
    response.status(error.code === '23503' ? 409 : 500).json({ error: error.code === '23503' ? 'This category is used by a brand or product.' : 'Could not delete category.' });
  }
});

app.post('/api/brands', async (request, response) => {
  const name = String(request.body.name || '').trim();
  const categoryId = Number(request.body.categoryId);
  if (!name || !categoryId) return response.status(400).json({ error: 'Brand name and category are required.' });
  try {
    const result = await pool.query('INSERT INTO brands (name, category_id) VALUES ($1, $2) RETURNING id, name, category_id', [name, categoryId]);
    response.status(201).json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23505' ? 409 : error.code === '23503' ? 400 : 500).json({ error: error.code === '23505' ? 'Brand already exists.' : error.code === '23503' ? 'Selected category does not exist.' : 'Could not save brand.' });
  }
});

app.put('/api/brands/:id', async (request, response) => {
  const name = String(request.body.name || '').trim();
  const categoryId = Number(request.body.categoryId);
  if (!name || !categoryId) return response.status(400).json({ error: 'Brand name and category are required.' });
  try {
    const result = await pool.query('UPDATE brands SET name = $1, category_id = $2, updated_at = NOW() WHERE id = $3 RETURNING id, name, category_id', [name, categoryId, request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Brand not found.' });
    response.json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23505' ? 409 : error.code === '23503' ? 400 : 500).json({ error: error.code === '23505' ? 'Brand already exists.' : error.code === '23503' ? 'Selected category does not exist.' : 'Could not update brand.' });
  }
});

app.delete('/api/brands/:id', async (request, response) => {
  try {
    const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING id', [request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Brand not found.' });
    response.sendStatus(204);
  } catch (error) {
    response.status(error.code === '23503' ? 409 : 500).json({ error: error.code === '23503' ? 'This brand is used by a product.' : 'Could not delete brand.' });
  }
});

async function imageUrl(file) {
  if (!file) return null;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`products/${Date.now()}-${file.originalname}`, file.buffer || fs.readFileSync(file.path), {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.mimetype,
    });
    return blob.url;
  }
  if (file.buffer) return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  return `/uploads/${file.filename}`;
}

app.post('/api/products', upload.single('image'), async (request, response) => {
  const body = request.body;
  const values = [body.name, Number(body.categoryId), Number(body.brandId), Number(body.price), body.originalPrice ? Number(body.originalPrice) : null, Number(body.stock || 0), body.badge || null, body.spec || null, body.description || null];
  if (!body.name || !values[1] || !values[2] || Number.isNaN(values[3])) return response.status(400).json({ error: 'Name, category, brand, and price are required.' });
  const status = values[5] === 0 ? 'out' : values[5] <= 5 ? 'low' : 'in';
  try {
    const image = await imageUrl(request.file);
    const result = await pool.query(`INSERT INTO products (name, category_id, brand_id, price, original_price, stock_quantity, badge, specifications, description, image_path, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`, [...values, image, status]);
    response.status(201).json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23503' ? 400 : 500).json({ error: error.code === '23503' ? 'Selected category or brand does not exist.' : 'Could not save product.' });
  }
});

app.put('/api/products/:id', upload.single('image'), async (request, response) => {
  const body = request.body;
  const stock = Number(body.stock || 0);
  const values = [body.name, Number(body.categoryId), Number(body.brandId), Number(body.price), body.originalPrice ? Number(body.originalPrice) : null, stock, body.badge || null, body.spec || null, body.description || null];
  if (!body.name || !values[1] || !values[2] || Number.isNaN(values[3])) return response.status(400).json({ error: 'Name, category, brand, and price are required.' });
  const status = stock === 0 ? 'out' : stock <= 5 ? 'low' : 'in';
  try {
    const imageClause = request.file ? ', image_path = $10' : '';
    const image = request.file ? await imageUrl(request.file) : null;
    const queryValues = request.file ? [...values, image, status, request.params.id] : [...values, status, request.params.id];
    const result = await pool.query(`UPDATE products SET name = $1, category_id = $2, brand_id = $3, price = $4, original_price = $5, stock_quantity = $6, badge = $7, specifications = $8, description = $9${imageClause}, status = $${request.file ? 11 : 10}, updated_at = NOW() WHERE id = $${request.file ? 12 : 11} RETURNING id`, queryValues);
    if (!result.rowCount) return response.status(404).json({ error: 'Product not found.' });
    response.json(result.rows[0]);
  } catch (error) {
    response.status(error.code === '23503' ? 400 : 500).json({ error: error.code === '23503' ? 'Selected category or brand does not exist.' : 'Could not update product.' });
  }
});

app.delete('/api/products/:id', async (request, response) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [request.params.id]);
    if (!result.rowCount) return response.status(404).json({ error: 'Product not found.' });
    response.sendStatus(204);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Could not delete product.' });
  }
});

app.get(['/', '/admin', '/admin/', '/index.html', '/home.html'], (request, response) => {
  const page = request.path.startsWith('/admin') ? path.join(__dirname, 'admin', 'index.html') : path.join(__dirname, 'index.html');
  response.sendFile(page);
});

if (require.main === module) {
  databaseReady
    .then(() => app.listen(port, () => console.log(`AudioBullet server running at http://localhost:${port}/`)))
    .catch(error => { console.error('Database connection failed:', error.message); process.exit(1); });
}

module.exports = app;
