# Shopverse — MERN e-commerce starter

**Stack:** MongoDB · Express · React (Vite) · Node.js

## Features
- Browse products with search, category filter, sort and pagination
- Product page, cart (saved in localStorage), checkout, order history
- JWT auth (register / login), bcrypt-hashed passwords
- Admin area: add/delete products, view all orders, update order status
- Server re-prices every order from the database and checks stock (client can't tamper with totals)

## Setup
Requires Node 18+ and MongoDB (local, or an Atlas connection string).

```bash
npm run install:all      # installs root, server and client deps
# edit server/.env if your MongoDB isn't at mongodb://127.0.0.1:27017
npm run seed             # sample products + admin (admin@shop.com / admin123)
npm run dev              # API on :5000, client on :5173
```
Open http://localhost:5173

## Structure
```
server/  config/ models/ middleware/ routes/ server.js seed.js
client/  src/{pages,context} api.js App.jsx index.css
```

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | user |
| GET | /api/products?search&category&sort&page | public |
| GET | /api/products/:id | public |
| POST/PUT/DELETE | /api/products(/:id) | admin |
| POST | /api/orders | user |
| GET | /api/orders/mine | user |
| GET | /api/orders, PUT /api/orders/:id/status | admin |

## Next steps
Online payments (Razorpay/Stripe), image uploads (Cloudinary), reviews, wishlist, email receipts, rate limiting + helmet before deploying. Change `JWT_SECRET` in production.
