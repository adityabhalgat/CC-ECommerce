import dotenv from "dotenv";
import { runQuery, pool } from "../src/db.js";

dotenv.config();

async function init() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
    );
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
      buyer_email TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const seedProducts = [
    ["Classic White Tee", "100% cotton minimal everyday t-shirt.", 1999, 25],
    ["Urban Backpack", "Water-resistant backpack for daily commute.", 4599, 12],
    ["Wireless Earbuds", "Compact audio companion with charging case.", 6999, 18],
    ["Stainless Bottle", "750ml insulated bottle for hot and cold drinks.", 2499, 30]
  ];

  for (const [name, description, priceCents, stock] of seedProducts) {
    await runQuery(
      `INSERT INTO products (name, description, price_cents, stock)
       SELECT $1, $2, $3, $4
       WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = $1)`,
      [name, description, priceCents, stock]
    );
  }

  console.log("Database initialized with schema and sample products.");
}

init()
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
