import dotenv from "dotenv";
import { connectDb, getClient } from "../src/db.js";

dotenv.config();

async function init() {
  const db = await connectDb();
  const productsCollection = db.collection("products");
  const purchasesCollection = db.collection("purchases");

  await productsCollection.createIndex({ id: 1 }, { unique: true });
  await productsCollection.createIndex({ name: 1 }, { unique: true });
  await purchasesCollection.createIndex({ id: 1 }, { unique: true });
  await purchasesCollection.createIndex({ product_id: 1, created_at: -1 });

  const seedProducts = [
    { id: 1, name: "Classic White Tee", description: "100% cotton minimal everyday t-shirt.", price_cents: 1999, stock: 25 },
    { id: 2, name: "Urban Backpack", description: "Water-resistant backpack for daily commute.", price_cents: 4599, stock: 12 },
    { id: 3, name: "Wireless Earbuds", description: "Compact audio companion with charging case.", price_cents: 6999, stock: 18 },
    { id: 4, name: "Stainless Bottle", description: "750ml insulated bottle for hot and cold drinks.", price_cents: 2499, stock: 30 }
  ];

  for (const product of seedProducts) {
    await productsCollection.updateOne(
      { id: product.id },
      { $setOnInsert: product },
      { upsert: true }
    );
  }

  console.log("MongoDB initialized with indexes and sample products.");
}

init()
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });
