# E-commerce Products REST API & Database Optimization

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-brightgreen.svg)](https://swagger.io/)
[![Postman](https://img.shields.io/badge/Postman-Passed-orange.svg)](https://www.postman.com/)

An optimized, production-ready RESTful API for managing e-commerce product catalogs, customer data, and order processing. Built with **Node.js**, **Express.js**, and **PostgreSQL**, this project features interactive **Swagger UI documentation**, database query optimization, automated triggers, stored procedures, connection pooling, and Postman automated testing.

---

# 🚀 Live Deployment & Interactive Documentation

- **Live Swagger UI:** https://bcs-4103-ecom-api.onrender.com/api-docs/
- **Base API URL:** https://bcs-4103-ecom-api.onrender.com

> **Note:** Opening the base URL automatically redirects to the interactive Swagger documentation.

---

# 📁 Project Structure

bcs-4103-project/
│
├── .env                                        # Environment variables
├── app.js                                      # Main Express application & Swagger setup
├── db.js                                       # PostgreSQL connection pool
├── populate.js                                 # Seeds 10,000+ database records
├── package.json                                # Project dependencies
├── package-lock.json                           # Dependency lock file
├── BCS-4103-Ecom-API.postman_collection.json   # Postman API Collection
└── README.md
```

---

# ✨ Key Features

## Interactive Swagger UI

- Built with **swagger-ui-express**
- OpenAPI 3.0 documentation
- Test API endpoints directly from your browser
- Automatically generated from Swagger annotations

---

## Full REST API

Supports complete CRUD operations:

- Create Products
- Read Products
- Update Products
- Delete Products

---

## PostgreSQL JSONB Support

Products include an **attributes** column using PostgreSQL JSONB for flexible product metadata.

Example:

```json
{
  "color": "Black",
  "weight": "2kg",
  "category": "Electronics"
}
```

---

## Database Optimization

### Stored Procedures

Precompiled PostgreSQL procedures for reporting and analytics.

### Triggers

Automatic inventory stock reduction whenever an order is created.

### Indexing

- Composite indexes
- GIN indexes
- Optimized JSONB searching
- Faster query execution

---

## Large Scale Dataset

The project includes a database seeding script that generates more than **10,000 records**, including:

- Customers
- Products
- Orders
- Order Items

This provides realistic benchmarking and performance testing.

---

## Connection Pooling

Uses the **pg** PostgreSQL driver with connection pooling for efficient database connections.

---

## Automated API Testing

Includes a complete Postman Collection Runner test suite with dynamic environment variables.

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | REST API Framework |
| PostgreSQL | Database |
| pg | PostgreSQL Driver |
| Swagger UI Express | Interactive API Documentation |
| Swagger JSDoc | OpenAPI Specification |
| Postman | API Testing |
| Render | Cloud Deployment |
| GitHub | Version Control |

---

# 🗄 Database Architecture

The project uses four normalized relational tables.

```text
+-------------------+       +-------------------+
|     CUSTOMERS     |       |     PRODUCTS      |
+-------------------+       +-------------------+
| customer_id (PK)  |       | product_id (PK)   |
| first_name        |       | sku (UNIQUE)      |
| last_name         |       | name              |
| email (UNIQUE)    |       | price             |
+---------+---------+       | stock_quantity    |
          |                 | attributes(JSONB) |
          |                 +---------+---------+
          |                           |
          | 1                         | 1
          |                           |
          | N                         | N
+---------v---------+       +---------v---------+
|      ORDERS       |       |    ORDER_ITEMS    |
+-------------------+       +-------------------+
| order_id (PK)     |       | item_id (PK)      |
| customer_id (FK)  |       | order_id (FK)     |
| status            |       | product_id (FK)   |
| created_at        |       | quantity          |
+-------------------+       | unit_price        |
                            +-------------------+
```

---

# 📌 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Redirects to Swagger UI |
| GET | `/api-docs/` | Interactive Swagger Documentation |
| GET | `/api/products` | Retrieve all products |
| GET | `/api/products/:id` | Retrieve a product by ID |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

---

# ⚙ Local Installation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL 15+

---

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/bcs-4103-project.git

cd bcs-4103-project
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
PORT=10000

DATABASE_URL=postgresql://username:password@localhost:5432/ecommerce_db
```

---

## 4. Seed the Database

Populate the database with over **10,000 benchmark records**.

```bash
node populate.js
```

---

## 5. Start the Server

```bash
node app.js
```

The API will start on:

```
http://localhost:10000
```

Swagger UI will be available at:

```
http://localhost:10000/api-docs/
```

---

# 🧪 Testing

Run API tests using the included Postman Collection.

```
BCS-4103-Ecom-API.postman_collection.json
```

The collection includes automated tests for:

- GET endpoints
- POST endpoints
- PUT endpoints
- DELETE endpoints

---

# 📊 Performance Features

- PostgreSQL Connection Pooling
- JSONB Query Optimization
- Composite Indexes
- GIN Indexes
- Stored Procedures
- Database Triggers
- Large-scale Benchmark Dataset
- Production-ready REST API
- Interactive Swagger Documentation

---

# 👥 Authors & Contributors

**Unit Code**

**BCS 4103 – Advanced Database Systems**

**Project Title**

Optimizing PostgreSQL Database for Oracle Cloud (OCI) & Node.js REST API

**Course Lecturer**

Cecilia

**Group Members**

- Student Name 1 – Registration Number
- Student Name 2 – Registration Number
- Student Name 3 – Registration Number
- Student Name 4 – Registration Number

---

# 📄 License

This project was developed for academic purposes as part of the **BCS 4103 Advanced Database Systems** course.

---

## ⭐ Project Summary

This project demonstrates the design and implementation of a scalable e-commerce REST API using **Node.js**, **Express.js**, and **PostgreSQL**, with a strong focus on database optimization through indexing, JSONB support, stored procedures, triggers, connection pooling, and large-scale performance benchmarking. The application is fully documented with Swagger UI and validated using automated Postman testing.