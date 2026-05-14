# E-Commerce Sample (React + Express + MongoDB Atlas)

This project demonstrates a simple e-commerce flow:
- Browse products from MongoDB Atlas
- Simulate a purchase that updates inventory atomically

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas

## Quick local run

1. Backend setup:
   - `cd backend`
   - `npm install`
   - `cp .env.example .env`
   - Set `MONGODB_URI` in `.env`
   - Optionally set `MONGODB_DB_NAME` (defaults to `ecommerce_db`)
   - `npm run init-db`
   - `npm run dev`

2. Frontend setup:
   - `cd ../frontend`
   - `npm install`
   - `cp .env.example .env`
   - `npm run dev`

3. Open frontend:
   - http://localhost:5173

## API endpoints
- `GET /api/health`
- `GET /api/products`
- `POST /api/purchases`

Sample purchase payload:

```json
{
  "productId": 1,
  "quantity": 2,
  "buyerEmail": "buyer@example.com"
}
```

## Deployment
See `DEPLOYMENT_GUIDE_EC2.md` for a full production-style EC2 deployment process.
