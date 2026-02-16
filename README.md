# 🛒 Role-Based Shop API

A role-based REST API built using Node.js, Express, and MongoDB where:

- 🏪 Shopkeepers manage products and inventory  
- 🛍 Customers place orders  
- 📦 Stock updates automatically using MongoDB transactions  
- 🔐 JWT authentication secures protected routes  

---

## 🚀 Features

### 🔐 Authentication
- User Registration (Shopkeeper / Customer)
- User Login
- JWT-based protected routes
- Password hashing using bcrypt

### 📦 Product Management (Shopkeeper Only)
- Add new product
- View all products
- View single product
- Update product
- Delete product
- Add stock quantity

### 🛒 Order Management
- Place order with multiple products (Customer only)
- View orders (role-based access)
- View single order
- Mark order as completed (Shopkeeper only)

### 📊 Stock Logic
- Stock increases when shopkeeper adds inventory
- Stock decreases when customer places order
- Prevents order if stock is insufficient
- Uses MongoDB transactions for atomic updates

---

## 🏗 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Joi Validation
- MVC Architecture
- MongoDB Transactions

---

## 📁 Project Structure

```
src/
│
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── validations/
└── utils/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Shreya-Wani/inventory-order-management-api
cd role-based-shop-api
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Setup Environment Variables

Create a `.env` file in root:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/roleBasedShopDB
JWT_SECRET=your_secret_key
```

### 4️⃣ Run Server

```bash
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

## 🔐 API Endpoints

### 🧾 Auth Routes

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |

---

### 📦 Product Routes (Shopkeeper Only)

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/products | Add product |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| PATCH | /api/products/:id/add-stock | Add stock |

---

### 🛒 Order Routes

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/orders | Place order (Customer) |
| GET | /api/orders | View orders |
| GET | /api/orders/:id | View single order |
| PATCH | /api/orders/:id/complete | Mark as completed (Shopkeeper) |

---

## 🔒 Role-Based Access Rules

- Only shopkeepers can manage products
- Only customers can place orders
- Shopkeepers can manage only their own products
- Customers can view only their own orders
- Stock updates automatically during order creation

---

## 🧠 Business Logic Highlights

- Uses MongoDB transactions for order creation
- Validates stock before placing order
- Prevents negative inventory
- Implements centralized error handling
- Proper HTTP status codes and structured responses

---

## 📌 Sample Response Format

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

---

## 🧪 Testing

You can test all APIs using:
- Postman
- Thunder Client
- Insomnia

---

## 👩‍💻 Author

Shreya Wani  
Backend Developer | Node.js | REST APIs | MongoDB  

---