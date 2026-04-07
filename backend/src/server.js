import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { pool, runQuery } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    const result = await runQuery("SELECT NOW() AS now");
    res.json({ status: "ok", dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const result = await runQuery(
      `SELECT id, name, description, price_cents, stock
       FROM products
       ORDER BY id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/purchases", async (req, res) => {
  const { productId, quantity = 1, buyerEmail = "guest@example.com" } = req.body;
  const normalizedQuantity = Number(quantity);

  if (!productId || !Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    return res.status(400).json({ message: "productId and valid quantity are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id, name, price_cents, stock FROM products WHERE id = $1 FOR UPDATE",
      [productId]
    );

    if (productResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productResult.rows[0];

    if (product.stock < normalizedQuantity) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const totalCents = product.price_cents * normalizedQuantity;

    const stockUpdateResult = await client.query(
      "UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock",
      [normalizedQuantity, productId]
    );

    const purchaseResult = await client.query(
      `INSERT INTO purchases (product_id, quantity, total_cents, buyer_email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, product_id, quantity, total_cents, buyer_email, created_at`,
      [productId, normalizedQuantity, totalCents, buyerEmail]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Purchase simulated successfully",
      purchase: purchaseResult.rows[0],
      productName: product.name,
      remainingStock: stockUpdateResult.rows[0].stock
    });
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
