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
- [ ] Align database schema with complete Bill-Z domain (Vendor, Customer, Product, Invoice, InvoiceItem, OTP)
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
- [ ] OTP generation with cryptographic hashing, TTL expiry (e.g., 5-10 mins), and max attempts
- [ ] Email OTP delivery via existing Handlebars + Nodemailer email service
- [ ] Rate limiting for OTP request and verification endpoints
- [ ] Vendor registration / login via Email + OTP
- [ ] Customer registration / login via Email + OTP
- [ ] JWT token issuance with role payloads (`VENDOR`, `CUSTOMER`)
- [ ] Strict multi-tenant authorization middleware (verifying resource ownership)
- [ ] Unified identifier lookup in `request-otp` (email or mobile → vendor/customer role; OTP delivered by email in v1)

### 2.3 Security Hardening (Phase 0, from 20 Nov 2026 audit)
- [ ] Role guard on all protected `/vendor/*` routes (currently any valid token passes)
- [ ] Admin tokens carry the admin's real role (currently always `super_admin`)
- [ ] Remove logging of vendor records/password hashes in vendor login
- [ ] Tune global rate limit so normal PWA usage is not throttled
- [ ] Deactivated vendors/customers are rejected even with an unexpired token

---

## 3. Vendor Domain

### 3.1 Vendor Profile & Business Settings
- [x] Basic vendor registration (email/password) & profile retrieval
- [x] Profile picture upload and storage
- [ ] Extended vendor business details (Business Name, Address, City, State, Country, Postal Code, GST/Tax Number, Logo)
- [ ] Update vendor business profile endpoint

### 3.2 Product Management
- [x] Product model with name, description, price, quantity, unlimitedStock, images
- [x] Add product with multi-image upload
- [x] Fetch products by vendor with ownership verification
- [x] Get single product details
- [x] Update product details and images
- [x] Delete product
- [ ] Support SKU, Unit, and Category fields on Product model
- [ ] Per-product GST rate and HSN code; brand field
- [ ] Product list pagination and search (name, SKU, category)
- [ ] Soft-delete products referenced by invoices
- [ ] Currency / price representation audit (integer paise/cents vs decimal)
- [ ] Vendor invoice settings (prefix, default payment terms, default note)
- [ ] Vendor dashboard metrics endpoint

### 3.3 Customer Management (Vendor Scope)
- [ ] Customer entity creation and relationship design
- [ ] Vendor Customer CRUD (Create, Read, Update, Deactivate)
- [ ] Search and filter customers by name, email, and phone
- [ ] Quick customer creation during invoice generation flow

---

## 4. Invoice & Billing Engine

### 4.1 Invoice Data Model & Immutability
- [ ] Invoice entity (`invoiceNumber`, `vendorId`, `customerId`, `invoiceDate`, `dueDate`, `subtotal`, `discountAmount`, `taxAmount`, `totalAmount`, `currency`, `paymentStatus`, `status`, `pdfUrl`, `notes`)
- [ ] Invoice Item entity with product snapshot (`productNameSnapshot`, `productSkuSnapshot`, `quantity`, `unitPrice`, `discountAmount`, `taxAmount`, `totalAmount`)
- [ ] Ensure historical invoice immutability (price/name updates on products do not alter existing invoices)

### 4.2 Invoice Creation & Calculation
- [ ] Transactional invoice creation endpoint (`POST /api/v1/invoices` or `/api/v1/vendor/invoices`)
- [ ] Authoritative backend total calculation (frontend preview only)
- [ ] Concurrent-safe sequential invoice number generator (`INV-YYYY-XXXXXX`), per vendor per financial year
- [ ] Initial payment status assignment (`PENDING`)
- [ ] CGST/SGST vs IGST split from place of supply; seller and buyer snapshots on the invoice

### 4.3 Invoice Payment Tracking
- [ ] Update payment status endpoint (`PENDING` -> `PAID`) restricted to vendor
- [ ] Record payment mode and paid-at timestamp
- [ ] Customer invoice status read-only access
- [ ] Derived "overdue" (`PENDING` and past due date); never stored as a status
- [ ] Record first customer view (`viewedAt`) for the payment-progress timeline

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
- [ ] Global categories/settings management

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
- [ ] Integrate production authentication, authorization, authoritative invoice calculations, PDF delivery and API persistence in a future implementation.
- [ ] Replace mock services with HTTP adapters behind the existing `AuthService`/`BillingService` contracts (`VITE_USE_MOCK` toggle), and remove the stored `OVERDUE` status from the PWA types.
