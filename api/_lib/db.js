import crypto from "node:crypto";
import pg from "pg";
import { products as seedProducts } from "../../src/store/catalog.js";

const { Pool } = pg;

let pool;
let schemaReady = false;
let adminReady = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : {
            rejectUnauthorized: false,
          },
    });
  }

  return pool;
}

export async function query(text, params = []) {
  const client = getPool();
  return client.query(text, params);
}

async function ensureUsersAndCommerceSchema() {
  await query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS affiliates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      code TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      commission_rate NUMERIC(5,2) NOT NULL DEFAULT 3.00,
      total_clicks INTEGER NOT NULL DEFAULT 0,
      total_conversions INTEGER NOT NULL DEFAULT 0,
      total_commission NUMERIC(14,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT NOT NULL UNIQUE,
      external_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      price NUMERIC(14,2) NOT NULL,
      rating NUMERIC(3,2) NOT NULL DEFAULT 0,
      availability TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      images JSONB NOT NULL DEFAULT '[]'::jsonb,
      short_description TEXT NOT NULL,
      description TEXT NOT NULL,
      features JSONB NOT NULL DEFAULT '[]'::jsonb,
      variants JSONB NOT NULL DEFAULT '[]'::jsonb,
      related_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number TEXT NOT NULL UNIQUE,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      subtotal NUMERIC(14,2) NOT NULL,
      delivery_fee NUMERIC(14,2) NOT NULL,
      total NUMERIC(14,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_reference TEXT UNIQUE,
      payment_provider TEXT NOT NULL DEFAULT 'paystack',
      referral_code TEXT,
      affiliate_id UUID REFERENCES affiliates(id) ON DELETE SET NULL,
      commission_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      external_product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price NUMERIC(14,2) NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
      code TEXT NOT NULL,
      order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'clicked',
      commission_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export async function ensureSchema() {
  if (schemaReady) {
    return;
  }

  await ensureUsersAndCommerceSchema();
  schemaReady = true;
}

export async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }

  const [salt, key] = storedHash.split(":");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(crypto.timingSafeEqual(Buffer.from(key, "hex"), derivedKey));
    });
  });
}

export function createOrderNumber() {
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SM-${Date.now()}-${suffix}`;
}

export async function ensureAdminUser() {
  if (adminReady) {
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    adminReady = true;
    return;
  }

  await ensureSchema();
  const existing = await query("SELECT id FROM users WHERE email = $1", [adminEmail.toLowerCase()]);

  if (!existing.rows.length) {
    const passwordHash = await hashPassword(adminPassword);
    await query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      ["SolarMart Admin", adminEmail.toLowerCase(), passwordHash],
    );
  }

  adminReady = true;
}

export async function syncSeedProducts() {
  await ensureSchema();

  for (const product of seedProducts) {
    await query(
      `INSERT INTO products (
        slug, external_id, name, category, brand, sku, price, rating, availability, stock,
        images, short_description, description, features, variants, related_ids
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11::jsonb, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb
      )
      ON CONFLICT (external_id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        brand = EXCLUDED.brand,
        sku = EXCLUDED.sku,
        price = EXCLUDED.price,
        rating = EXCLUDED.rating,
        availability = EXCLUDED.availability,
        stock = EXCLUDED.stock,
        images = EXCLUDED.images,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        variants = EXCLUDED.variants,
        related_ids = EXCLUDED.related_ids,
        updated_at = NOW()`,
      [
        product.slug,
        product.id,
        product.name,
        product.category,
        product.brand,
        product.sku,
        product.price,
        product.rating,
        product.availability,
        product.stock,
        JSON.stringify(product.images || []),
        product.shortDescription,
        product.description,
        JSON.stringify(product.features || []),
        JSON.stringify(product.variants || []),
        JSON.stringify(product.relatedIds || []),
      ],
    );
  }
}

export function mapProductRow(row) {
  return {
    id: row.external_id,
    dbId: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    brand: row.brand,
    sku: row.sku,
    price: Number(row.price),
    rating: Number(row.rating),
    availability: row.availability,
    stock: Number(row.stock),
    images: row.images || [],
    shortDescription: row.short_description,
    description: row.description,
    features: row.features || [],
    variants: row.variants || [],
    relatedIds: row.related_ids || [],
  };
}
