# E-Commerce Sample (React + Express + NeonDB)

This project demonstrates a simple e-commerce flow:
- Browse products from PostgreSQL (NeonDB)
- Simulate a purchase that updates inventory transactionally

## Tech stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL (NeonDB)

## Quick local run

1. Backend setup:
   - `cd backend`
   - `npm install`
   - `cp .env.example .env`
   - Set `DATABASE_URL` in `.env`
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
