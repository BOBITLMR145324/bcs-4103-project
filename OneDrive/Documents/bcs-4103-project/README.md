# E-commerce Products REST API & Database Optimization

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)](https://www.postgresql.org/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-brightgreen.svg)](https://swagger.io/)
[![Postman](https://img.shields.io/badge/Postman-Passed-orange.svg)](https://www.postman.com/)

An optimized, production-ready **RESTful API** for managing e-commerce product catalogs, customer data, and order processing. Built with **Node.js**, **Express.js**, and **PostgreSQL**, this project features interactive **Swagger UI documentation**, database query optimization, automated triggers, stored procedures, dynamic connection pooling with environment-aware SSL handling, fast dataset batch ingestion, and automated API testing using Postman.

---

# 🚀 Live Deployment & Interactive Documentation

### 🌐 Live Swagger UI
https://bcs-4103-ecom-api.onrender.com/api-docs/

### 🌍 Base API URL
https://bcs-4103-ecom-api.onrender.com

> **Note:** Visiting the base URL automatically redirects to the interactive Swagger documentation.

---

# 📁 Project Structure

```text
bcs-4103-project/
│
├── .env
│   └── Environment variables (Database connection, Port, Environment)
│
├── app.js
│   └── Main Express application and Swagger configuration
│
├── db.js
│   └── PostgreSQL connection pool with automatic SSL detection
│
├── populate.js
│   └── Streams and imports 45,200+ real records from the UCI Machine Learning Repository
│
├── package.json
│   └── Project dependencies
│
├── package-lock.json
│
├── Capacity of the database Query.sql
│   └── SQL optimization queries, triggers, functions and procedures
│
├── BCS-4103-Ecom-API.postman_collection.json
│   └── Automated Postman test collection
│
└── README.md
```

---

# ✨ Key Features

## 📖 Interactive Swagger UI

- Built using **swagger-ui-express** and **swagger-jsdoc**
- OpenAPI 3.0 Specification
- Interactive browser-based API testing
- Automatically generated documentation from route annotations
- Live request/response examples

---

## 📊 Direct Ingestion of Official Machine Learning Dataset

This project integrates directly with the **UCI Machine Learning Repository (Bank Marketing Dataset)**.

Features include:

- Streams CSV data directly over HTTP
- No temporary file storage required
- Imports **45,200+ real-world records**
- SQL multi-row parameterized batch insertion
- Fast PostgreSQL ingestion
- Maps dataset values into flexible **JSONB** columns

---

## 🚀 Complete REST API

Supports full CRUD functionality.

### Create

- Add new products
- Request validation
- Automatic SKU uniqueness

### Read

- Retrieve all products
- Pagination support
- Retrieve products by ID

### Update

- Update prices
- Update stock
- Modify product attributes

### Delete

- Remove obsolete products

---

## 🗄 PostgreSQL JSONB Support

Products utilize PostgreSQL's **JSONB** datatype to support flexible product metadata.

Example:

```json
{
  "source": "UCI Bank Marketing Dataset",
  "education": "tertiary",
  "housing_loan": "no",
  "marital_status": "single"
}
```

This enables schema flexibility without requiring database migrations.

---

## ⚡ Database Optimization & Security

### Stored Procedures

- Aggregated reporting
- Inventory analytics
- Performance optimization

### Database Triggers

Automatic stock management including:

- Inventory validation
- Stock deduction after order creation

### Smart PostgreSQL Connection Pool

Uses **pg.Pool** with automatic environment detection.

**Development**

- Direct PostgreSQL connection
- SSL disabled

**Production (Render / OCI / AWS)**

- SSL enabled automatically
- `rejectUnauthorized: false`

---

## 🧪 Automated API Testing

A complete Postman Collection is included.

Tests cover:

- CRUD endpoints
- Status code validation
- JSON response validation
- Environment variables
- Automated assertions

---

# 🛠 Technology Stack

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript Runtime |
| Express.js | REST API Framework |
| PostgreSQL | Relational Database |
| pg | PostgreSQL Driver & Connection Pool |
| Axios | HTTP Streaming Client |
| csv-parser | Streaming CSV Processing |
| Swagger UI Express | Interactive API Documentation |
| Swagger JSDoc | OpenAPI Documentation Generation |
| Postman | API Testing |
| Render | Cloud Deployment |
| GitHub | Version Control |

---

# 🗄 Database Architecture

The application uses a normalized relational schema while leveraging PostgreSQL JSONB for flexible metadata storage.

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
| GET | `/api/products` | Retrieve all products (supports pagination) |
| GET | `/api/products/:id` | Retrieve a product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |

---

# ⚙ Local Setup & Execution

## Prerequisites

- Node.js v18+
- PostgreSQL 15+

---

## 1. Clone the Repository

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

DATABASE_URL=postgresql://postgres:password@localhost:5432/ecommerce_db

NODE_ENV=development
```

---

## 4. Populate the Database

Import the UCI Machine Learning dataset.

```bash
node populate.js
```

This streams and inserts over **45,200 records** directly into PostgreSQL.

---

## 5. Start the API

```bash
node app.js
```

Server:

```text
http://localhost:10000
```

Swagger UI:

```text
http://localhost:10000/api-docs/
```

---

# 🧪 Testing & Validation

Import the supplied Postman Collection:

```text
BCS-4103-Ecom-API.postman_collection.json
```

Run the collection using the **Collection Runner**.

Validation includes:

- ✅ 200 OK
- ✅ 201 Created
- ✅ 404 Not Found
- ✅ Payload validation
- ✅ JSON Schema validation
- ✅ CRUD endpoint testing

---

# 📈 Performance Highlights

- Streams data directly from the UCI Repository
- Imports over **45,200 records** in seconds
- Uses parameterized multi-row SQL inserts
- PostgreSQL connection pooling
- Environment-aware SSL configuration
- Optimized JSONB storage
- Stored procedures for analytics
- Trigger-based inventory management

---

# 👥 Authors

**Course Unit**

**BCS 4103 – Advanced Database Systems**

**Project Title**

Optimizing PostgreSQL Database for Cloud Deployment & Node.js REST API Architecture

**Course Lecturer**

Cecilia

### Group Members

- **BOBITLMR145324** — Samuel Mutuku Ngina
- **BOBITLMR127024** — Alvin Kuria Macharia
- **BOBITLMR539523** — Emmanuel Langat

---

# 📄 License

This repository was developed for **academic evaluation** under the **BCS 4103 – Advanced Database Systems** curriculum.

---

## ⭐ Acknowledgements

- UCI Machine Learning Repository
- PostgreSQL
- Node.js
- Express.js
- Swagger
- Postman
- Render

---

## 📬 Contact

For questions regarding this academic project, please contact any of the listed project members or open an issue within the repository.