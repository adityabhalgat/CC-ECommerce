import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required. Add it to backend/.env");
}

const dbName = process.env.MONGODB_DB_NAME || "ecommerce_db";
const client = new MongoClient(process.env.MONGODB_URI);

let dbRef;

export async function connectDb() {
  if (!dbRef) {
    await client.connect();
    dbRef = client.db(dbName);
  }
  return dbRef;
}

export function getClient() {
  return client;
}
