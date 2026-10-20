# Shopverse — MERN e-commerce starter

**Stack:** MongoDB · Express · React (Vite) · Node.js

## Features
- Browse products with search, category filter, sort and pagination
- Product page, cart (saved in localStorage), checkout, order history
- JWT auth (register / login), bcrypt-hashed passwords
- Admin area: add/edit/delete products, view all orders, update order status
- Customer and admin dashboards with live order/store summaries
- Razorpay online checkout (UPI, cards, netbanking) with server-side signature and payment verification; cash on delivery remains available
- Server re-prices every order from the database and checks stock (client can't tamper with totals)

## Setup
Requires Node 18+ and MongoDB (local, or an Atlas connection string).

```bash
npm run install:all      # installs root, server and client deps
# edit server/.env if your MongoDB isn't at mongodb://127.0.0.1:27017
# add Razorpay test/live keys to server/.env to enable online payments
npm run seed             # add 37 sample products + admin without deleting existing users/products
npm run dev              # API on :5000, client on :5173
```
Open http://localhost:5173

Use **Sign in as → Admin** to sign in to the admin dashboard. The seeded admin account is `admin@shop.com` / `admin123` (only when newly created by the seed script). Admins can add products or edit their name, description, price, category, stock, and image URL; saved changes are served by the same product API used by the storefront.

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
| POST | /api/orders/razorpay/order, /api/orders/razorpay/verify | user |
| GET | /api/orders/mine | user |
| GET | /api/orders, PUT /api/orders/:id/status | admin |

## Next steps
Online payments (Razorpay/Stripe), image uploads (Cloudinary), reviews, wishlist, email receipts, rate limiting + helmet before deploying. Change `JWT_SECRET` in production.
