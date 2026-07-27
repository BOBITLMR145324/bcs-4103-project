# Horizon Financial — FinTech Product Catalog & Portfolio Engine

> **Enterprise-grade financial product catalog and institutional deposit management platform built with Node.js, Express.js, and PostgreSQL.**

Horizon Financial is a full-stack financial services application designed to manage institutional deposit prospects and retail portfolio offerings. The platform delivers real-time server-side searching, dynamic filtering, analytical reporting, and complete CRUD operations while maintaining high performance for large datasets through optimized PostgreSQL queries.

---

# 📌 Overview

The application provides an enterprise dashboard for managing financial products and institutional investment opportunities with features including:

- Server-side pagination
- Real-time database search
- Dynamic filtering
- Advanced sorting
- Portfolio analytics
- CSV exporting
- Interactive Swagger API documentation
- Full CRUD functionality
- PostgreSQL-powered backend

---

# ✨ Features

## 1. Server-Side Database Pagination

Designed to efficiently handle large datasets without loading every record into the browser.

### Features

- PostgreSQL OFFSET/LIMIT pagination
- Parameterized SQL queries
- Configurable page sizes:
  - 50 items
  - 100 items
  - 200 items
- Previous / Next navigation
- Direct page jumping
- Dynamic pagination metadata

---

## 2. Global Full-Database Search

Unlike client-side filtering, searches execute directly against PostgreSQL for maximum scalability.

### Capabilities

- Real-time search across all records
- PostgreSQL `ILIKE` pattern matching
- Search by:
  - Product Name
  - Institutional Account Name
  - SKU
- 350ms debounced search inputs
- Minimal database load during typing

---

## 3. Dynamic Category Filtering

Server-side category filters instantly update results across the entire database.

Supported categories include:

- MANAGEMENT
- TECHNICIAN
- ENTREPRENEUR
- RETIRED

Filtering remains fully compatible with:

- Pagination
- Search
- Sorting
- CSV Export

---

## 4. Server-Side Sorting

Native PostgreSQL ordering provides fast and secure sorting.

Available sorting options:

- Newest First
- Highest Balance
- Lowest Balance
- Alphabetical

Security features include backend whitelist validation to prevent SQL Injection attacks.

---

## 5. Portfolio Analytics Dashboard

A dedicated analytics endpoint provides live financial metrics.

Endpoint:

```
GET /api/products/stats
```

Metrics include:

- Total Database Records
- Average Portfolio Balance
- Total Portfolio Value
- Filtered Result Count

Powered entirely using PostgreSQL aggregate functions:

- COUNT(*)
- AVG(price)
- SUM(price)

---

## 6. CSV Data Export

Export filtered datasets with a single click.

Endpoint:

```
GET /api/products/export
```

Exports respect active:

- Search query
- Category filter

Ideal for:

- Reporting
- Auditing
- Excel analysis
- Financial record sharing

---

## 7. Interactive API Documentation

Integrated Swagger UI provides live API testing directly from the browser.

Available at:

```
/api-docs
```

Supports:

- OpenAPI 3.0
- Live endpoint testing
- Request examples
- Response schemas

---

# 🏗 Technology Stack

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL
- pg (node-postgres)
- Connection Pooling

## Frontend

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript (ES6)
- Font Awesome 6

## API Documentation

- Swagger UI Express
- Swagger JSDoc
- OpenAPI 3.0

---

# 📂 Project Structure

```text
bcs-4103-project/
│
├── app.js                 # Main Express server & API routes
├── db.js                  # PostgreSQL connection pool
├── package.json           # Project dependencies
│
├── public/
│   ├── index.html         # Glassmorphism dashboard UI
│   └── app.js             # Frontend state management & API calls
│
└── README.md              # Project documentation
```

---

# 📡 API Reference

## Portfolio Analytics

### Get Global Statistics

```http
GET /api/products/stats
```

Returns:

- Total Records
- Average Balance
- Portfolio Value
- Filtered Match Count

---

### Export CSV

```http
GET /api/products/export
```

Query Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| search | string | Search keyword |
| category | string | Category filter |

---

## Product Catalog

### Retrieve Products

```http
GET /api/products
```

Query Parameters

| Parameter | Description |
|------------|------------|
| page | Current page |
| limit | Page size |
| search | Search term |
| category | Category filter |
| sortBy | Sorting field |
| sortOrder | ASC / DESC |

---

### Retrieve Single Product

```http
GET /api/products/:id
```

Returns one product by UUID.

---

### Create Product

```http
POST /api/products
```

Example Request

```json
{
  "sku": "SKU-1001",
  "name": "Corporate Fixed Deposit",
  "price": 250000,
  "stock_quantity": 50,
  "attributes": {
    "interestRate": "8.5%",
    "tenure": "12 Months"
  }
}
```

---

### Update Product

```http
PUT /api/products/:id
```

Updates an existing product.

---

### Delete Product

```http
DELETE /api/products/:id
```

Deletes a product by UUID.

---

# ⚡ Performance Optimizations

- Server-side pagination
- PostgreSQL query optimization
- Connection pooling
- Debounced searching
- Efficient SQL aggregation
- Secure parameterized queries
- SQL injection prevention
- Lightweight frontend architecture

---

# 🔒 Security

Security measures implemented include:

- Parameterized SQL queries
- Backend sort-column whitelist validation
- Input validation
- UUID-based resource identification
- Connection pooling
- RESTful API architecture

---

# 🚀 Getting Started

## Prerequisites

- Node.js v16+
- PostgreSQL

---

## Clone Repository

```bash
git clone https://github.com/yourusername/horizon-financial.git

cd horizon-financial
```

---

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=10000

PGUSER=your_postgres_user
PGHOST=your_database_host
PGDATABASE=your_database_name
PGPASSWORD=your_database_password
PGPORT=5432
```

---

## Install Dependencies

```bash
npm install
```

---

## Start Server

```bash
node app.js
```

---

## Open the Application

Dashboard

```
https://bcs-4103-ecom-api.onrender.com
```

Swagger Documentation

```
http://localhost:10000/api-docs
```

---

# 📊 Key Capabilities

- Enterprise Financial Dashboard
- Institutional Deposit Management
- Product Portfolio Engine
- Live Database Analytics
- RESTful API
- PostgreSQL Integration
- CSV Reporting
- Swagger Documentation
- Full CRUD Operations
- Real-Time Search
- Dynamic Filtering
- Secure Sorting
- Responsive UI

---

# 📈 Future Enhancements

Potential roadmap items include:

- JWT Authentication
- Role-Based Access Control (RBAC)
- Financial Charts & Dashboards
- Audit Logging
- Email Notifications
- Multi-Tenant Support
- Docker Deployment
- Kubernetes Support
- Redis Caching
- Automated Testing (Jest + Supertest)
- CI/CD Pipelines
- Cloud Deployment (Render, Railway, AWS)

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

Distributed under the **MIT License**.

See the `LICENSE` file for more information.

---

Enterprise FinTech Product Catalog & Institutional Deposit Management System

Built using **Node.js**, **Express.js**, **PostgreSQL**, and **Tailwind CSS**.