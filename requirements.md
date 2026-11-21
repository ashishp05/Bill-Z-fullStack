# Bill-Z — Requirements Specification

This document tracks all project requirements for the Bill-Z platform across Backend, Admin Panel, and Vendor/Customer PWA.

Status Legend:
- `[ ]` Not started
- `[~]` In progress
- `[x]` Completed

---

## 1. System Architecture & Foundation

- [x] Backend Express 5 + TypeScript + Prisma + PostgreSQL boilerplate setup
- [x] Admin Vite + React 18 + Tailwind CSS + Redux Toolkit boilerplate setup
- [x] Dual Storage Engine (Local `/uploads/` and AWS S3) via Storage Facade
- [x] Email dispatch service with Nodemailer & Handlebars templates
- [x] Align database schema with complete Bill-Z domain (Vendor, VendorSettings, Customer, VendorCustomer, Category, Brand, Product, Invoice, InvoiceItem, OtpVerification). Migration `20261121090000_billing_domain`, additive only.
- [ ] Initialize Vendor & Customer PWA workspace (React + Tailwind CSS)

---

## 2. Authentication & Authorization

### 2.1 Admin Authentication
- [x] Admin registration & login with email and password (`POST /api/v1/admin/login`)
- [x] Dedicated Add Admin API (`POST /api/v1/admin/add` and `POST /api/v1/add/admin` alias)
- [x] Super Admin JWT authentication and role guards (`SUPER_ADMIN`, `ADMIN`)
- [x] Admin Profile retrieval (`GET /api/v1/admin/profile`) and Change Password (`POST /api/v1/admin/change-password`)
- [x] Admin Logout endpoint (`POST /api/v1/admin/logout`)
- [x] Admin auth state in Redux with encrypted localStorage persistence
- [x] Admin panel integration: real API login flow, UserMenu display, ChangePassword modal, and AddAdminModal UI

### 2.2 Vendor & Customer Email + OTP Authentication
- [x] OTP generation with cryptographic hashing (HMAC-SHA256), 10-minute expiry, 5 attempts, 30 s resend cooldown, 5 codes/hour per email, one-time use
- [x] Email OTP delivery via existing Handlebars + Nodemailer email service (`templates/auth/otp_code.hbs`)
- [x] Rate limiting for OTP request and verification endpoints (`otpRateLimiter` per IP + per-email limits)
- [x] Vendor registration / login via Email + OTP (`purpose: register` creates the vendor after verification)
- [x] Customer login via Email + OTP. Customers do not self-register; their vendor adds them (design decision).
- [x] JWT token issuance with role payloads (`vendor`, `customer`)
- [x] Strict multi-tenant authorization: role guard on every vendor/customer route, all queries scoped by `vendorId` / `customerId`
- [x] Unified identifier lookup (`POST /auth/lookup`, email or mobile → vendor/customer role; OTP delivered by email in v1, destination masked)

### 2.3 Security Hardening (Phase 0, from 20 Nov 2026 audit)
- [x] Role guard on all protected `/vendor/*` routes
- [ ] Admin tokens carry the admin's real role (currently always `super_admin`)
- [x] Remove logging of vendor records/password hashes (and the request body with the plaintext password) in vendor login
- [x] Tune global rate limit so normal PWA usage is not throttled (100 → 600 per 15 min per IP)
- [~] Deactivated vendors/customers are rejected at OTP lookup and verification; an already-issued token still works until it expires

---

## 3. Vendor Domain

### 3.1 Vendor Profile & Business Settings
- [x] Basic vendor registration (email/password) & profile retrieval
- [x] Profile picture upload and storage
- [~] Extended vendor business details: business name/type, GSTIN, GST-registered flag, address, city, state, PIN code, UPI ID. Country and logo not added yet.
- [x] Update vendor business profile endpoint (`PUT /vendor/profile`, also used for onboarding)

### 3.2 Product Management
- [x] Product model with name, description, price, quantity, unlimitedStock, images
- [x] Add product with multi-image upload
- [x] Fetch products by vendor with ownership verification
- [x] Get single product details
- [x] Update product details and images
- [x] Delete product
- [x] Support SKU (unique per vendor), Unit, and Category (global table) on Product
- [x] Per-product GST rate (0/5/12/18/28) and HSN code; brand (global table)
- [ ] Product list pagination and search (name, SKU, category)
- [ ] Soft-delete products referenced by invoices
- [x] Money representation decided: whole Indian rupees as `Int` everywhere; invoice math rounds GST per line to the rupee
- [x] Vendor invoice settings (`GET/PUT /vendor/settings`: prefix, next number, default GST, payment terms, note, notification toggles)
- [x] Vendor dashboard metrics endpoint (`GET /vendor/invoices/summary`)

### 3.3 Customer Management (Vendor Scope)
- [x] Customer entity creation and relationship design (global `Customer` + per-vendor `VendorCustomer`)
- [~] Vendor Customer CRUD: create, read, update done; deactivate not yet
- [x] Search and filter customers by name, email, and phone
- [ ] Quick customer creation during invoice generation flow

---

## 4. Invoice & Billing Engine

### 4.1 Invoice Data Model & Immutability
- [x] Invoice entity (`invoiceNumber`, `vendorId`, `customerId`, `invoiceDate`, `dueDate`, `subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `currency`, `paymentStatus`, `status`, `pdfUrl`, `notes`)
- [x] Invoice Item entity with product snapshot (`productNameSnapshot`, `productSkuSnapshot`, `quantity`, `unitPrice`, `discountAmount`, `taxAmount`, `totalAmount`)
- [x] Ensure historical invoice immutability (price/name updates on products and customers do not alter existing invoices; verified end-to-end)

### 4.2 Invoice Creation & Calculation
- [x] Transactional invoice creation endpoint (`POST /api/v1/vendor/invoices`)
- [x] Authoritative backend total calculation (frontend preview only; same algorithm, tested on both sides)
- [~] Concurrent-safe sequential invoice number generator (`<prefix>000001`, default prefix `INV-YYYY-`), per vendor. Automatic reset per financial year not implemented yet.
- [x] Initial payment status assignment (`PENDING`)
- [x] CGST/SGST vs IGST split (vendor state vs customer state); seller and buyer snapshots on the invoice

### 4.3 Invoice Payment Tracking
- [x] Update payment status endpoint (`PATCH /vendor/invoices/:id/payment`) restricted to vendor
- [x] Record payment mode and paid-at timestamp
- [x] Customer invoice status read-only access (`GET /customer/invoices`, across all vendors)
- [x] Derived "overdue" (`PENDING` and past due date in IST); never stored as a status
- [x] Record first customer view (`viewedAt`) for the payment-progress timeline

### 4.4 PDF Generation
- [ ] Professional Handlebars HTML invoice template (Vendor branding, Customer info, line items, summary totals, payment notes)
- [ ] Backend PDF generation (e.g. Puppeteer, PDFKit, or html-pdf-node)
- [ ] Secure PDF storage and signed/static URL access
- [ ] Endpoint for downloading invoice PDF (`GET /api/v1/invoices/:id/pdf`)

---

## 5. Super Admin Panel

- [x] Admin login & dashboard shell
- [x] Admin vendor listing with pagination and status toggling (`PATCH /api/v1/admin/vendors/:id/status`)
- [ ] Super Admin Platform Statistics (Total Vendors, Customers, Products, Invoices, Paid/Pending metrics)
- [ ] Vendor Management screen (detailed view of vendor products, invoices, and activity)
- [ ] Global Customer Management screen
- [ ] Platform Invoices & Payment oversight screen
- [~] Global categories and brands: admin API done (`/catalog/categories`, `/catalog/brands`); admin panel screen not built

---

## 6. Vendor & Customer PWA (Design Reference Alignment)

### 6.1 Design System & Architecture
- [x] Align color palette with official reference:
  - Navy: `#183153`
  - Primary blue: `#2563EB`
  - Success green: `#16845B`
  - Warning amber: `#B7791F`
  - Error red: `#C0392B`
  - Background: `#F6F8FB`
  - White surfaces: `#FFFFFF`
  - Primary text: `#172033`
  - Secondary text: `#667085`
  - Borders: `#E4E7EC`
  - Accent/Action Orange: `#EA580C` / `#F97316`
  - Pastel metric card backgrounds (Blue `#E0F2FE`, Yellow `#FEF3C7`, Mint `#DCFCE7`, Lavender `#F3E8FF`)
- [x] Typography: Inter, crisp weights, modest border radii (`rounded-xl`, `rounded-2xl`), subtle shadows.
- [x] Indian Market Format: INR (`₹`), Indian numbering (`₹2,32,000`), phone `+91`, GSTIN, CGST/SGST/IGST.
- [x] Responsive layout: Mobile-first with bottom navigation; desktop responsive layout with navigation header.

### 6.2 Vendor PWA Screens
_`[~]` = UI built on mock data (Phase 7); completes when connected to the real API (Phase 8)._
1. [~] Email/Phone Login & OTP verification.
2. [~] Vendor Business Onboarding (Business Name, GSTIN, Address, State, PIN).
3. [~] Vendor Dashboard (Deep blue banner, Promo GST card, 2x2 Analytics metrics, Explore quick actions, Recent transactions with Paid/Due pills, Floating "+ New invoice").
4. [~] Product Management (Search, Category filter, Active/Inactive status, Add/Edit product).
5. [~] Customer Management (Search, Add/Edit customer with GSTIN & address).
6. [~] Guided 4-Step Invoice Creation (matching center reference screen):
   - Progress bar (e.g., "2 of 4 sections done - 50%").
   - Section 1: Invoice details (Invoice #, Date, Due date).
   - Section 2: Billing details (Customer & Vendor state for GST).
   - Section 3: Items & services (Line items with qty, unit price, GST rate, total, `+ Add line item`, `Save & continue`).
   - Section 4: Taxes & adjustments (CGST + SGST or IGST calculation).
   - Sticky bottom bar: Total payable (`₹32,200 Incl. GST`) + `Preview` CTA.
7. [~] Invoice Details & Verification (matching right reference screen):
   - Scannable QR Code card ("Scan To View Invoice").
   - Payment Progress timeline (Invoice Sent -> Viewed by Client -> Payment Pending -> Payment Received).
   - Customer Contact Bar with instant WhatsApp & Phone Call quick actions.
   - PDF download / Print & Share invoice.
8. [~] Invoice History & Filters (Tabs: All, Paid, Pending, Overdue).
9. [~] Payment Status Management (Mark as Paid, record payment mode).
10. [~] Business Profile, Settings, Help & Logout.

### 6.3 Customer PWA Screens
1. [~] Customer Login via Email/Phone + OTP.
2. [~] Customer Dashboard (Outstanding amount, recent bills).
3. [~] My Bills list with status filters.
4. [~] Customer Invoice Details with QR code, payment progress, and "Pay Now via UPI".
5. [~] Invoice PDF Viewer/Download.
6. [~] Customer Profile & Settings.

### 6.4 PWA Capabilities
- [x] Web App Manifest with standalone display mode.
- [x] Service Worker caching for static assets.
- [x] Offline fallback and online/offline connectivity indicator.
- [x] One-click Install App banner.

## 7. Figma Website Prototype — 16 October 2026

- [x] Implement the retrieved Bill-Z Figma frames in the existing React/TypeScript website, with mobile and desktop layouts.
- [x] Keep the active website on dummy JSON data; isolate asynchronous auth/billing services for later API integration.
- [x] Bundle the original Figma assets and Inter font locally for offline use.
- [x] Wire demo OTP, search/filtering, product/customer forms, invoice creation, payment updates and settings.
- [x] Consolidate the manifest/service worker into the Vite PWA build and provide PNG installation icons.
- [x] Verify build, five calculation tests, core browser interactions, responsive widths and production offline reload.
- [x] Updated unified login screen (Figma node 2:58283, 18 November 2026): one login for everyone via email or mobile number, role resolved from the account, "Register your business" for owners, customers onboarded by their vendor.
- [ ] Complete direct pixel comparison for frames unavailable after the Figma Starter-plan tool limit. See website/DESIGN_HANDOFF.md for scope.
- [~] Integrate production authentication, authorization, authoritative invoice calculations and API persistence (done); PDF delivery pending.
- [x] Replace mock services with HTTP adapters behind the existing `AuthService`/`BillingService` contracts (`VITE_DATA_SOURCE=mock|api`). `OVERDUE` is now display-only: derived from the server's `isOverdue` (API) or the reference date (mock).

---

## 8. Demo Data & Credentials (21 November 2026)

- [x] Backend demo seed (`npm run db:seed`, idempotent): Super Admin, two vendors (Gujarat and Kerala), 9 products, 7 customers (one shared across both vendors), 10 invoices covering paid, pending, overdue, IGST, B2B GSTIN and discount cases. Invoices are created through the real invoice service.
- [x] Fixed demo OTP via `DEMO_OTP_CODE` (ignored when `NODE_ENV=production`); with `DISABLE_EMAIL=true` the code is also logged in development.
- [x] PWA mock data (`website/src/data/demo.json`) mirrors the seed, so mock and API mode show the same bills and totals.
- [x] Demo account shortcuts on the PWA sign-in screen (always in mock mode; in API mode only with `VITE_SHOW_DEMO_LOGINS=true`).
- [x] Verified end to end: 58 API checks (auth, ownership, math, concurrency, immutability) and a headless-browser run of the PWA in API mode.

