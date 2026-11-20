# Bill-Z — Full Stack Billing & Invoice Management Platform

## 1. Project Overview

Bill-Z is a full-stack web application for vendors/business owners to manage their products, customers, invoices/bills, and payment status.

The main goal is to provide a simple billing system where a vendor can:

1. Register/login using email + OTP.
2. Add and manage their products.
3. Add and manage their customers.
4. Create a bill/invoice by selecting products and quantities.
5. Automatically calculate subtotal, taxes/discounts if applicable, and final amount.
6. Generate an invoice/bill as a PDF.
7. Track whether the invoice payment is pending or completed.
8. Allow customers to log in and view all invoices generated for them.
9. Allow customers to track the payment status of their invoices.
10. Provide a Super Admin panel for managing the entire platform.

The system will have three main user roles:

* `SUPER_ADMIN`
* `VENDOR`
* `CUSTOMER`

---

# 2. Main Applications

Bill-Z will consist of three major applications.

## A. Backend API

Technology:

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM or the ORM already established in the existing boilerplate
* JWT/session-based authentication as appropriate
* Email OTP authentication
* PDF invoice generation
* REST API architecture

The backend is the central source of truth for:

* Authentication
* Users
* Vendors
* Customers
* Products
* Invoices
* Invoice items
* Payments/payment status
* PDF generation
* Admin operations
* Authorization
* Data validation

---

## B. Admin Panel

Technology:

* React
* Tailwind CSS

The admin panel is only for administrative users.

The existing React + Tailwind boilerplate is already available.

IMPORTANT:

Before implementing anything:

1. Review the existing admin boilerplate.
2. Understand its folder structure.
3. Understand its routing.
4. Understand its authentication structure.
5. Understand its API/service structure.
6. Understand its reusable components.
7. Preserve existing coding standards where possible.
8. Do not unnecessarily replace or restructure the boilerplate.

Admin functionality will be expanded incrementally.

---

## C. Vendor + Customer Progressive Web App

Technology:

* React
* Tailwind CSS
* Progressive Web App (PWA)

The same PWA can support both:

* Vendor users
* Customer users

The UI shown to the user should depend on their role.

For example:

Vendor:

Dashboard → Products → Customers → Create Bill → Bills → Profile

Customer:

Dashboard → My Bills → Bill Details → Payment Status → Profile

The PWA should be installable on supported mobile/desktop devices and should behave like an application while still being a web application.

The PWA implementation should be introduced carefully because the developer may not have previous PWA experience.

Do not over-engineer the PWA initially.

First create a reliable responsive web application, then add the PWA requirements such as:

* Web app manifest
* Service worker
* Installability
* Offline handling where useful
* Application icons
* Splash/start behavior where supported
* Appropriate caching strategy

Do NOT make invoice creation dependent on offline functionality unless explicitly required later.

---

# 3. Core Business Example

Example:

A vendor sells computers.

Vendor:

`ABC Computers`

Product:

`Dell OptiPlex 7010`

Price:

`₹45,000`

Customer:

`John Doe`

John purchases:

`10 × Dell OptiPlex 7010`

The vendor:

1. Logs into Bill-Z.

2. Opens Create Bill.

3. Selects John Doe.

4. Selects Dell OptiPlex 7010.

5. Enters quantity = 10.

6. System calculates:

   Unit Price = ₹45,000
   Quantity = 10
   Line Total = ₹4,50,000

7. Vendor confirms the bill.

8. System generates an invoice.

9. Invoice gets a unique invoice number.

10. Payment status is initially:

`PENDING`

11. Vendor can later mark the invoice as:

`PAID`

12. Customer can log in and see the invoice in their account.
13. Customer can open the invoice and view/download the PDF.

---

# 4. User Roles

## 4.1 SUPER_ADMIN

The Super Admin controls the entire Bill-Z platform.

Possible responsibilities:

* Login to admin panel.
* View platform statistics.
* Manage vendors.
* Manage customers.
* View products.
* View invoices.
* View payment statuses.
* Suspend/activate vendors.
* Suspend/activate customers if required.
* View system activity.
* Manage platform-level settings.
* View reports.

Super Admin should NOT automatically have access to modify vendor-owned business data unless the business rules explicitly allow it.

Admin authorization must be implemented separately from vendor/customer authorization.

---

# 4.2 VENDOR

A vendor is the business/user who sells products and creates invoices.

Vendor capabilities:

### Authentication

* Register using email.
* Receive OTP.
* Verify OTP.
* Login using email + OTP.
* Logout.
* Session/token management.

### Vendor Profile

Vendor should have business information such as:

* Business name
* Owner/contact name
* Email
* Phone
* Business address
* City
* State
* Country
* Postal code
* Tax/GST information if required later
* Business logo if required later

Do not assume all tax/business fields are mandatory until confirmed.

### Products

Vendor can:

* Add product.
* Edit product.
* Delete/deactivate product.
* View products.
* Search products.
* Filter products.
* Set selling price.
* Set product SKU/code if required.
* Store product description.
* Store product category.
* Store product brand.
* Store product tax information if required later.
* Store product status.

Products must belong to the vendor.

Vendor A must never see or modify Vendor B's products.

### Customers

Vendor can:

* Add customer.
* Edit customer.
* View customer.
* Search customer.
* Deactivate customer if required.

Customer information may include:

* Name
* Email
* Phone
* Address
* City
* State
* Country
* Postal code
* Tax/GST information if required

Customers created by a vendor must be associated with that vendor/business.

### Bills / Invoices

Vendor can:

* Create invoice.
* View invoices.
* Search invoices.
* Filter invoices.
* View invoice details.
* Download invoice PDF.
* Change payment status.
* Cancel/void invoice if the business rules later allow this.

---

# 4.3 CUSTOMER

A customer is the person/business who receives invoices from vendors.

Customer capabilities:

* Register/login using email + OTP.
* View profile.
* View invoices.
* View invoice details.
* Download invoice PDF.
* View payment status.
* View invoice history.

Important:

A customer should only see invoices that belong to them.

A customer must never be able to access another customer's invoices.

---

# 5. Authentication

Authentication will initially use:

## Email + OTP

Flow:

1. User enters email.
2. Backend generates OTP.
3. OTP is sent to email.
4. User submits OTP.
5. Backend verifies OTP.
6. Backend creates/authenticates the user.
7. Backend returns authentication token/session.
8. Frontend stores authentication state securely.
9. Backend authorization middleware validates the authenticated user.

OTP requirements should include:

* Expiration time.
* Maximum attempts.
* Resend cooldown.
* Rate limiting.
* One-time usage.
* Secure OTP storage where possible.
* Never store plain OTP unnecessarily.

OTP functionality should be reusable for both:

* Vendor
* Customer

Admin authentication may use a separate admin authentication flow depending on the existing admin boilerplate.

---

# 6. Initial Database Domain Model

The database should be designed around ownership and relationships.

Initial entities:

## User

Represents the authentication identity.

Possible fields:

* id
* email
* phone
* role
* status
* emailVerified
* createdAt
* updatedAt

Role:

```text
SUPER_ADMIN
VENDOR
CUSTOMER
```

---

## Vendor

Represents vendor/business-specific information.

Possible fields:

* id
* userId
* businessName
* ownerName
* phone
* email
* address
* city
* state
* country
* postalCode
* taxNumber
* logo
* status
* createdAt
* updatedAt

Relationship:

```text
User 1 → 1 Vendor
Vendor 1 → N Products
Vendor 1 → N Customers
Vendor 1 → N Invoices
```

---

## Customer

Customer profile.

Possible fields:

* id
* userId
* vendorId (if customer ownership is vendor-specific)
* name
* email
* phone
* address
* city
* state
* country
* postalCode
* taxNumber
* status
* createdAt
* updatedAt

IMPORTANT DESIGN QUESTION:

The system must eventually decide whether one customer can belong to multiple vendors.

Do not hard-code an incorrect relationship without considering this requirement.

If a customer can receive bills from multiple vendors, a global customer identity and vendor-customer relationship may be more appropriate.

This should be designed before finalizing the database schema.

---

## Product

Vendor-owned product.

Possible fields:

* id
* vendorId
* name
* sku
* description
* categoryId
* brandId
* unit
* sellingPrice
* costPrice if required
* taxRate if required
* status
* createdAt
* updatedAt

Important:

Products belong to a vendor.

---

## Category

Possible future/shared entity.

Fields:

* id
* name
* description
* status
* createdAt
* updatedAt

Determine later whether categories are:

* global platform categories
* vendor-specific categories

Prefer global categories if the business requires consistent categorization.

---

## Brand

Possible entity.

Fields:

* id
* name
* status
* createdAt
* updatedAt

The exact requirement will be finalized later.

---

# 7. Invoice Database Design

Invoice should be treated as an important immutable business record.

## Invoice

Possible fields:

* id
* invoiceNumber
* vendorId
* customerId
* invoiceDate
* dueDate
* subtotal
* discountAmount
* taxAmount
* totalAmount
* currency
* paymentStatus
* status
* notes
* pdfUrl if generated/stored
* createdAt
* updatedAt

Payment status initially:

```text
PENDING
PAID
```

Potential future statuses:

```text
PARTIALLY_PAID
OVERDUE
CANCELLED
REFUNDED
```

Do not implement future statuses until required.

---

# 8. Invoice Item

Each invoice contains multiple products.

Example:

Invoice:

`INV-2026-000001`

Items:

| Product           | Quantity | Unit Price |     Total |
| ----------------- | -------: | ---------: | --------: |
| Dell OptiPlex     |       10 |    ₹45,000 | ₹4,50,000 |
| Logitech Keyboard |       10 |     ₹1,000 |   ₹10,000 |

Invoice Item fields:

* id
* invoiceId
* productId
* productNameSnapshot
* productSkuSnapshot
* quantity
* unitPrice
* discountAmount
* taxAmount
* totalAmount
* createdAt

IMPORTANT:

Invoice items should store product information snapshots.

Do NOT depend only on the current Product record.

For example:

Today:

Dell OptiPlex price = ₹45,000

Tomorrow:

Vendor changes product price = ₹50,000

The old invoice must still show:

₹45,000

Therefore the invoice item should preserve the price/product information used when the invoice was created.

---

# 9. Invoice Creation Transaction

Invoice creation must be transactional.

When vendor creates an invoice:

1. Validate authenticated vendor.
2. Validate customer ownership/access.
3. Validate all products.
4. Validate quantities.
5. Read current product prices.
6. Calculate invoice totals on the backend.
7. Create invoice.
8. Create invoice items.
9. Generate invoice number.
10. Commit transaction.
11. Generate/store PDF if architecture requires it.
12. Return invoice details.

The frontend must NEVER be trusted for final totals.

Frontend calculations are only for UI preview.

Backend calculates the authoritative amount.

---

# 10. Invoice Number

Every invoice should have a unique invoice number.

Example:

```text
INV-2026-000001
INV-2026-000002
INV-2026-000003
```

The final invoice-number strategy should be designed to prevent duplicates under concurrent invoice creation.

Do not generate invoice numbers using only frontend logic.

---

# 11. Payment Tracking

Initial requirement:

Each invoice has payment status:

```text
PENDING
PAID
```

Vendor can change:

```text
PENDING → PAID
```

Customer can view the status but should not directly modify it.

Future payment functionality may include:

* Partial payments
* Payment history
* Payment methods
* Online payment gateway
* Payment receipts
* Refunds

These should not be implemented unless added to the requirements later.

---

# 12. PDF Invoice

Bill-Z must generate a professional invoice PDF.

Invoice should contain:

### Vendor Information

* Business name
* Logo if available
* Address
* Contact information
* Tax/GST details if applicable

### Customer Information

* Customer name
* Email/phone
* Address
* Tax/GST information if applicable

### Invoice Information

* Invoice number
* Invoice date
* Due date if applicable
* Payment status

### Items

* Product
* SKU
* Quantity
* Unit price
* Tax
* Discount
* Total

### Summary

* Subtotal
* Discount
* Tax
* Grand total

### Footer

* Notes
* Payment terms
* Business information

PDF generation should happen on the backend.

Customer/vendor should be able to download the generated invoice.

---

# 13. Vendor Dashboard

Initial dashboard can contain:

* Total products
* Total customers
* Total invoices
* Pending payment amount
* Paid amount
* Recent invoices
* Quick action: Create Bill

Possible layout:

```text
Vendor Dashboard

---------------------------------
Products       Customers
120            85

Total Invoices     Pending Amount
450                ₹2,50,000

---------------------------------

Recent Bills

Invoice       Customer       Amount       Status
INV-001       John Doe       ₹50,000      PAID
INV-002       ABC Ltd        ₹25,000      PENDING

---------------------------------

[ Create New Bill ]
```

Exact UI will be finalized later.

---

# 14. Customer Dashboard

Customer dashboard should provide:

* Total bills
* Pending bills
* Paid bills
* Total pending amount
* Recent invoices

Example:

```text
My Bills

Total Bills       Pending
12                3

Paid Amount       Pending Amount
₹2,50,000         ₹75,000
```

Customer can click an invoice to view details and download PDF.

---

# 15. Vendor Bill Creation UX

The bill creation flow should be simple and optimized for mobile.

Suggested flow:

### Step 1 — Select Customer

Search existing customers.

Option:

`+ Add New Customer`

### Step 2 — Add Products

Search products.

For each product:

```text
Dell OptiPlex 7010
₹45,000

Quantity: [-] 10 [+]
```

Allow multiple products.

### Step 3 — Review

Display:

```text
Dell OptiPlex 7010
10 × ₹45,000 = ₹4,50,000

Keyboard
10 × ₹1,000 = ₹10,000

-----------------------
Subtotal      ₹4,60,000
Tax            ₹82,800
-----------------------
Total          ₹5,42,800
```

### Step 4 — Generate Bill

Button:

`Generate Invoice`

Backend creates invoice and PDF.

### Step 5 — Result

Display:

```text
Invoice Created Successfully

Invoice: INV-2026-000001
Amount: ₹5,42,800
Payment: PENDING

[ View Invoice ]
[ Download PDF ]
[ Create Another Bill ]
```

---

# 16. Important Security Rules

The backend must enforce authorization.

Never rely only on frontend route protection.

Examples:

Vendor A:

```text
GET /products
```

must only return Vendor A's products.

Vendor A must NOT be able to access:

```text
Vendor B's product
Vendor B's customer
Vendor B's invoice
```

Customer A must NOT be able to access:

```text
Customer B's invoice
```

Customer must only access invoices where they are the authorized customer.

Super Admin has platform-level access according to admin permissions.

Every protected API should verify:

1. Authentication.
2. Role.
3. Resource ownership/access.

---

# 17. API Architecture

Backend should be organized cleanly.

Suggested structure:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── repositories/
│   ├── validators/
│   ├── utils/
│   ├── constants/
│   ├── modules/
│   └── app.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── tests/
├── .env
└── package.json
```

If the existing backend boilerplate has a different but clean architecture, preserve it instead of blindly applying this structure.

---

# 18. API Domains

Expected API domains:

```text
/auth
/vendors
/customers
/products
/categories
/brands
/invoices
/invoice-items
/dashboard
/admin
```

Example:

```text
POST /auth/request-otp
POST /auth/verify-otp
POST /auth/logout

GET /products
POST /products
GET /products/:id
PUT /products/:id
DELETE /products/:id

GET /customers
POST /customers
GET /customers/:id
PUT /customers/:id

GET /invoices
POST /invoices
GET /invoices/:id
GET /invoices/:id/pdf
PATCH /invoices/:id/payment-status
```

Exact API naming should follow the existing backend conventions.

---

# 19. Backend Validation

All important request bodies must be validated.

Examples:

Product:

* name required
* selling price valid
* quantity-related fields valid where applicable
* SKU rules if required

Customer:

* name required
* valid email if provided
* phone validation if required

Invoice:

* customer required
* at least one item
* quantity > 0
* valid product
* backend price calculation

Never trust client-side validation alone.

---

# 20. Error Handling

Use consistent API responses.

Example successful response:

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {}
}
```

Example error:

```json
{
  "success": false,
  "message": "Customer not found"
}
```

The exact response structure should follow the existing backend boilerplate if one already exists.

Do not introduce a second response pattern unnecessarily.

---

# 21. PWA Requirements

The vendor/customer frontend should eventually support:

## Installability

Users should be able to install Bill-Z from supported browsers.

Required concepts:

* `manifest.json`
* App name
* Short name
* Icons
* Theme color
* Start URL
* Display mode
* Service worker

## Responsive Design

The application must work well on:

* Mobile
* Tablet
* Desktop

Priority:

```text
Mobile-first
```

because vendors may create invoices directly from their phones.

## Offline

Offline support should initially be limited.

Do NOT attempt to make the entire billing system offline-first unless explicitly requested.

Potential offline features later:

* Cached shell
* Cached products
* Cached recent invoices
* Offline draft invoice

Online connection should be required for final invoice creation unless a robust offline-sync architecture is intentionally implemented.

---

# 22. Frontend Architecture

The PWA should have clear separation between:

```text
Authentication
Vendor
Customer
Shared Components
API Services
State Management
PWA
```

Suggested structure:

```text
pwa/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── vendor/
│   │   └── customer/
│   ├── services/
│   ├── hooks/
│   ├── store/
│   ├── utils/
│   ├── constants/
│   ├── routes/
│   └── App.jsx
│
├── public/
│   └── icons/
│
└── package.json
```

This is only a starting point.

If a boilerplate or selected architecture already exists, follow it.

---

# 23. Admin Panel

Admin panel will manage platform-level data.

Initial screens:

### Dashboard

* Total vendors
* Total customers
* Total products
* Total invoices
* Paid invoices
* Pending invoices
* Revenue/transaction summary if applicable

### Vendors

* Vendor list
* Vendor details
* Vendor status
* Vendor products
* Vendor invoices

### Customers

* Customer list
* Customer details
* Customer invoices

### Products

* Product list
* Product details
* Vendor association

### Invoices

* Invoice list
* Invoice details
* Payment status
* Vendor
* Customer
* Amount
* Date

More admin functionality can be added later.

---

# 24. Data Ownership

This is one of the most important rules in the project.

Vendor-owned data must always have an ownership relationship.

For example:

```text
Vendor
 ├── Products
 ├── Customers
 └── Invoices
       └── Invoice Items
```

Never build APIs that return all vendor data without applying authorization.

Example:

BAD:

```sql
SELECT * FROM products;
```

for a vendor request.

GOOD:

```sql
SELECT * FROM products
WHERE vendor_id = authenticated_vendor_id;
```

The same principle applies to:

* Customers
* Invoices
* Products
* Other vendor resources

---

# 25. Invoice Immutability

Invoices represent historical financial/business records.

After an invoice is generated:

Changing the product price must NOT change the invoice.

Changing the product name must NOT change the invoice.

Changing the customer information should not unexpectedly rewrite historical invoice information.

Therefore invoice records should preserve the required snapshots.

If invoice editing is introduced later, it should use explicit business rules.

---

# 26. Important Future Requirements

The following features may be added later but should be considered when designing the architecture:

* GST/tax support
* Multiple tax rates
* Discounts
* Partial payments
* Payment history
* Online payment gateway
* UPI payments
* Payment reminders
* WhatsApp invoice sharing
* Email invoice sharing
* Recurring invoices
* Inventory management
* Stock tracking
* Purchase management
* Expense tracking
* Business reports
* Revenue reports
* Vendor subscriptions
* Multiple employees per vendor
* Vendor branches
* Multiple currencies
* Multi-language invoices
* Invoice templates
* Custom business branding

Do not implement these now unless explicitly requested.

However, avoid database decisions that make these future features impossible.

---

# 27. Initial Development Principle

Bill-Z should be developed incrementally.

Do NOT attempt to build the entire application in one huge implementation.

Recommended order:

## Phase 1 — Understand Existing Code

Review:

* Backend boilerplate
* Admin boilerplate
* Existing package dependencies
* Folder structures
* Database configuration
* Authentication patterns
* API patterns
* Error handling
* Frontend routing
* UI components

Do not modify anything before understanding it.

---

## Phase 2 — Database

Finalize:

* User
* Vendor
* Customer
* Product
* Category
* Brand
* Invoice
* InvoiceItem
* OTP/authentication-related tables

Create migrations.

Test relationships.

---

## Phase 3 — Authentication

Implement:

* Vendor email OTP
* Customer email OTP
* Authentication middleware
* Role authorization
* Session/token handling
* Logout
* Protected routes

---

## Phase 4 — Vendor

Implement:

* Vendor profile
* Product CRUD
* Customer CRUD
* Vendor dashboard

---

## Phase 5 — Invoice

Implement:

* Create invoice
* Add multiple products
* Quantity
* Backend calculation
* Invoice transaction
* Invoice number
* Payment status
* Invoice history

---

## Phase 6 — PDF

Implement:

* Invoice template
* PDF generation
* PDF storage/access
* Download

---

## Phase 7 — Customer

Implement:

* Customer authentication
* Customer dashboard
* Invoice list
* Invoice details
* PDF download
* Payment status

---

## Phase 8 — Admin

Implement:

* Dashboard
* Vendor management
* Customer management
* Product visibility
* Invoice visibility
* Payment tracking

---

## Phase 9 — PWA

Implement:

* Manifest
* Service worker
* Installability
* Icons
* Responsive/mobile-first UI
* Appropriate caching

---

# 28. Vibe Coding Rules

This project will be developed using AI-assisted/vibe coding.

Therefore, maintain strict project discipline.

Before making major changes:

1. Understand existing implementation.
2. Check existing conventions.
3. Identify affected modules.
4. Explain the intended changes.
5. Implement the smallest logical change.
6. Run/build/test the affected application.
7. Fix errors.
8. Do not rewrite unrelated code.

Do not create duplicate:

* Services
* Controllers
* API clients
* Components
* Models
* Utilities

Reuse existing functionality where possible.

---

# 29. Antigravity Project Documentation

At the beginning of development, maintain:

```text
Project.md
requirements.md
plan.md
```

## Project.md

Contains:

* Project context
* Architecture
* Technologies
* Roles
* Core business rules
* Database concepts
* Development principles

## requirements.md

Contains the current detailed requirements.

Every new requirement added later should be recorded here.

Requirements should be marked as:

```text
[ ] Not started
[~] In progress
[x] Completed
```

## plan.md

Contains the current implementation plan.

When requirements change:

1. Update requirements.md.
2. Update plan.md.
3. Implement only the required changes.
4. Keep Project.md updated if architecture/business rules change.

---

# 30. Requirement Change Rule

Future requirements will be added incrementally.

When a new requirement is provided, do NOT assume that the entire system needs to be redesigned.

First determine:

1. Which existing module is affected?
2. Whether the database needs changes.
3. Whether backend API changes are required.
4. Whether admin changes are required.
5. Whether PWA changes are required.
6. Whether existing functionality can be reused.
7. Whether the requirement conflicts with an existing business rule.

Then update the implementation plan.

---

# 31. Important Questions That Must Be Resolved Before Final Database Design

The initial concept is clear, but these business decisions should NOT be guessed.

### Customer Ownership

Can one customer purchase from multiple vendors?

Example:

```text
Customer: John

Vendor A → John
Vendor B → John
Vendor C → John
```

If yes, Customer should probably be a global user/profile with a vendor-customer relationship rather than simply belonging to one vendor.

---

### Product Inventory

Does the vendor need to track:

```text
Stock quantity
```

or is Bill-Z only for billing?

Initial assumption:

> Bill-Z is a billing/invoice management system and does not yet manage inventory.

Confirm before implementing stock logic.

---

### Tax/GST

Does every product require:

* GST rate?
* HSN/SAC?
* CGST?
* SGST?
* IGST?

Do not hard-code Indian GST logic until confirmed.

---

### Invoice Editing

Can a vendor edit an invoice after generating it?

Or should invoices become immutable?

Recommended initial approach:

> Generated invoices should be treated as historical records and should not be freely edited.

---

### Payment

Initially:

```text
PENDING
PAID
```

No online payment processing unless explicitly requested.

---

# 32. Overall Architecture

Conceptually:

```text
                    ┌──────────────────────┐
                    │      SUPER ADMIN     │
                    │    React + Tailwind  │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
┌─────────────────────────────────────────────────────┐
│                    BILL-Z BACKEND                   │
│                                                     │
│              Node.js + Express + PostgreSQL        │
│                                                     │
│ Authentication                                      │
│ Vendors                                             │
│ Customers                                           │
│ Products                                            │
│ Invoices                                            │
│ Payments                                            │
│ PDF Generation                                      │
│ Authorization                                      │
└─────────────────────────┬───────────────────────────┘
                          │
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
     ┌────────────────┐      ┌────────────────┐
     │     VENDOR     │      │    CUSTOMER    │
     │      PWA       │      │      PWA       │
     └────────────────┘      └────────────────┘
              │                       │
              │                       │
              └──────── REST API ─────┘

                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  └───────────────┘
```

---

# 33. Primary Success Criteria

Bill-Z MVP will be considered functional when:

### Vendor

A vendor can:

* Register with email + OTP.
* Login.
* Create products.
* Create customers.
* Create an invoice.
* Add multiple products.
* Set quantities.
* Generate correct totals.
* Generate invoice PDF.
* View invoice history.
* Mark invoices as paid/pending.

### Customer

A customer can:

* Register/login.
* View invoices associated with them.
* Open invoice details.
* Download invoice PDF.
* See payment status.

### Super Admin

An admin can:

* Login.
* View platform dashboard.
* View vendors.
* View customers.
* View products.
* View invoices.
* Monitor payment statuses.

### Technical

The system must:

* Enforce role-based authorization.
* Enforce vendor data ownership.
* Preserve historical invoice data.
* Calculate invoice totals on the backend.
* Use database transactions for invoice creation.
* Have responsive UI.
* Be installable as a PWA.
* Have maintainable and scalable architecture.

---

# 34. Instruction to Antigravity

You are working on an existing full-stack project.

Do not immediately start coding.

First:

1. Inspect the existing backend.
2. Inspect the existing admin frontend.
3. Understand their architecture and coding conventions.
4. Identify the database/ORM setup.
5. Identify existing authentication implementation.
6. Identify reusable components and utilities.
7. Compare the existing implementation with this Project.md.
8. Create/update `requirements.md`.
9. Create/update `plan.md`.
10. Identify questions that must be answered before making irreversible database decisions.

After this analysis, provide a concise implementation plan.

Only then start implementation.

When implementing future requirements, preserve existing functionality unless the new requirement explicitly changes it.

The goal is to build Bill-Z as a clean, maintainable, production-oriented application rather than a collection of disconnected AI-generated features.
