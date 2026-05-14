import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    res.locals.db = await connectDb();
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await res.locals.db.command({ ping: 1 });
    res.json({ status: "ok", db: result.ok === 1 ? "connected" : "disconnected" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/api/products", async (_req, res) => {
  try {
    const products = await res.locals.db
      .collection("products")
      .find({}, { projection: { _id: 0, id: 1, name: 1, description: 1, price_cents: 1, stock: 1 } })
      .sort({ id: 1 })
      .toArray();
    res.json(products);
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

  try {
    const db = res.locals.db;
    const productsCollection = db.collection("products");
    const purchasesCollection = db.collection("purchases");

    const product = await productsCollection.findOne(
      { id: Number(productId) },
      { projection: { _id: 0, id: 1, name: 1, price_cents: 1, stock: 1 } }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < normalizedQuantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const totalCents = product.price_cents * normalizedQuantity;

    const stockUpdateResult = await productsCollection.findOneAndUpdate(
      { id: Number(productId), stock: { $gte: normalizedQuantity } },
      { $inc: { stock: -normalizedQuantity } },
      {
        returnDocument: "after",
        projection: { _id: 0, id: 1, name: 1, stock: 1 }
      }
    );

    if (!stockUpdateResult) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const lastPurchase = await purchasesCollection.findOne(
      {},
      { projection: { id: 1 }, sort: { id: -1 } }
    );
    const nextPurchaseId = (lastPurchase?.id || 0) + 1;

    const purchase = {
      id: nextPurchaseId,
      product_id: Number(productId),
      quantity: normalizedQuantity,
      total_cents: totalCents,
      buyer_email: buyerEmail,
      created_at: new Date()
    };

    await purchasesCollection.insertOne(purchase);

    res.status(201).json({
      message: "Purchase simulated successfully",
      purchase,
      productName: product.name,
      remainingStock: stockUpdateResult.stock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
