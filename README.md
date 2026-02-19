# 🛒 Inventory & Order Management API

A role-based REST API for inventory and order management built with **Node.js**, **Express**, and **MongoDB**. Features batch-level stock tracking with expiry management, FIFO order fulfillment, automated cron jobs, and email notifications.

---

## ✨ Features

- **JWT Authentication** — Register, login, role-based access (Shopkeeper / Customer)
- **Product CRUD** — Shopkeepers manage their own products and stock
- **Batch Management** — Create batches with expiry dates; stock updates atomically via MongoDB transactions
- **FIFO Order Fulfillment** — Orders consume stock from earliest-expiring batches first
- **Automated Expiry** — Daily cron job marks expired batches, deducts stock, and emails shopkeepers
- **Push Notifications** — Firebase Admin SDK (FCM) token management
- **Input Validation** — Joi schemas on all request bodies
- **Centralized Error Handling** — Consistent `ApiError` / `ApiResponse` pattern

---

## 🏗 Tech Stack

Node.js (ES Modules) · Express v5 · MongoDB + Mongoose · JWT + bcryptjs · Joi · node-cron · Nodemailer · Firebase Admin SDK

---

## 📁 Project Structure

```
src/
├── config/          # DB connection, Firebase init
├── controllers/     # Auth, Product, Order, Batch logic
├── models/          # User, Product, Order, Batch schemas
├── routes/          # Route definitions
├── middlewares/     # JWT auth + global error handler
├── validations/     # Joi validation schemas
├── utils/           # ApiError, ApiResponse, asyncHandler, sendEmail
└── cron/            # Daily batch expiry job
```

---

## ⚙️ Setup

```bash
git clone https://github.com/Shreya-Wani/inventory-order-management-api.git
cd inventory-order-management-api
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/inventoryOrderDB
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

For push notifications, place your Firebase service account JSON at `src/config/firebaseServiceAccount.json`.

```bash
npm run dev    # Development (hot-reload)
npm start      # Production
```

---

## 🔗 API Endpoints

> **Base URL:** `/api/v1`

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Register user |
| `POST` | `/login` | Public | Login & get JWT |
| `GET` | `/profile` | Protected | Get current user |
| `PUT` | `/fcm-token` | Protected | Update FCM token |

### Products — `/products`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Shopkeeper | Create product |
| `GET` | `/` | Public | List all products |
| `GET` | `/:id` | Public | Get single product |
| `PUT` | `/:id` | Shopkeeper | Update product |
| `DELETE` | `/:id` | Shopkeeper | Delete product |
| `PATCH` | `/:id/add-stock` | Shopkeeper | Add stock |

### Batches — `/batches`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Shopkeeper | Create batch with expiry |

### Orders — `/orders`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | Customer | Place order |
| `GET` | `/` | Protected | Get orders (role-based) |
| `GET` | `/:id` | Protected | Get single order |
| `PATCH` | `/:id/complete` | Shopkeeper | Mark completed |

---

## 🔒 Access Control

| Action | Shopkeeper | Customer |
|--------|:----------:|:--------:|
| Manage products & batches | ✅ | ❌ |
| Place orders | ❌ | ✅ |
| View orders | ✅ *(own products)* | ✅ *(own orders)* |
| Complete orders | ✅ | ❌ |
| Receive expiry alerts | ✅ | ❌ |

---

## 📌 Response Format

```json
{
  "statusCode": 201,
  "data": { ... },
  "message": "Product created successfully",
  "success": true
}
```

---

## 🧪 Testing

Use [Postman](https://www.postman.com/), [Thunder Client](https://www.thunderclient.com/), or [Insomnia](https://insomnia.rest/) to test the API.

---

## 👩‍💻 Author

**Shreya Wani**
Backend Developer | Node.js | REST APIs | MongoDB

---