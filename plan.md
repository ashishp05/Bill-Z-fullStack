# Bill-Z — Implementation & Migration Plan

This plan covers building **Bill-Z** on the existing **Backend** and **Admin** boilerplates and connecting the already-built **Vendor & Customer PWA** (currently on mock data) to the real API.

> Revised 20 November 2026 after a code audit of `backend/`, `admin/` and `website/`. The phase numbers stay stable: Phase 7 (PWA UI) is done, Phases 0–6 are backend and admin, and Phase 8 connects the PWA to the API.

---

## 🏗️ Architecture Summary

```
                       ┌─────────────────────────────┐
                       │      SUPER ADMIN PANEL      │
                       │ React 18 + Tailwind + Redux │
                       └──────────────┬──────────────┘
                                      │ /api/v1/admin/*
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          BILL-Z BACKEND API                            │
│           Node.js (>=24) + Express 5 + TypeScript + Prisma + PG        │
│  [Auth & OTP]  [Vendors]  [Customers]  [Products]  [Invoices & Items]  │
│      [Authoritative Calculations]  [PDF Engine]  [Storage Facade]      │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │ /api/v1/auth/*, /api/v1/vendor/*         │ /api/v1/customer/*
               ▼                                          ▼
        ┌──────────────────────────────────────────────────────┐
        │   VENDOR + CUSTOMER PWA (one codebase, role views)   │
        └──────────────────────────────────────────────────────┘
```

---

## 🔍 Code Audit Findings (20 November 2026)

What exists, and what the plan must account for.

| # | Area | Finding | Impact |
|---|---|---|---|
| A1 | `backend` auth | `/vendor/*` and `/vendor/products/*` use `auth` only, with **no role check**. Any valid token (including an admin's) passes. | Breaks rule 1 (auth → role → ownership). Fix in Phase 0. |
| A2 | `backend` admin | `admin-auth.service.ts` always signs tokens with `AdminRoles.SUPER_ADMIN`, even for `ADMIN` accounts. `Admin.roleId` is not used. | An `ADMIN` gets super-admin rights. Fix in Phase 0. |
| A3 | `backend` vendor | `vendor.service.ts#login` runs `console.log` on the full vendor record, **including the password hash**. | Leaks secrets into the logs. Fix in Phase 0. |
| A4 | `backend` security | The global rate limiter allows 100 requests per 15 minutes per IP for the **whole API**. | Normal PWA use will hit 429 errors. Tune in Phase 0. |
| A5 | `backend` product | `product.routes.ts` creates an unused `ProductRepository`, and `ProductService` creates its own. Products are hard-deleted. The list has no pagination or search. | Once invoices reference products, a hard delete either fails on the FK or orphans the item. |
| A6 | `backend` schema | `Product.price` is an `Int` that holds **rupees** (demo data: `1800` = ₹1,800). There is no SKU, HSN, GST rate, unit, category or brand. `Vendor.password` is required. | The money decision (D3) and OTP sign-up (no password) both need a migration. |
| A7 | `backend` schema | The `User` and `Roles` models are not referenced anywhere in `src/`. | Leave them as they are. Do **not** build Customer/OTP identity on them (see D2). |
| A8 | `backend` email | `email.service.ts` still has boilerplate branding (`appName = 'Prisma With PostgreSQL'`, placeholder logo), and `APP_NAME = 'Node With Prisma'`. | Brand to Bill-Z when the OTP template is added. |
| A9 | `website` | `InvoicePaymentStatus` includes `'OVERDUE'` as a stored value. | Conflicts with rule 5. Overdue must be derived from `PENDING` + `dueDate < today` (IST). |
| A10 | `website` | The mock numbers invoices with a vendor-chosen prefix (`BZ-2026-0422`), while CLAUDE.md specifies `INV-YYYY-000001`. | Needs decision D4. |
| A11 | `website` | Login accepts email **or mobile**, and the mock reports an `sms` channel. The backend only supports email OTP. | Needs decision D5. |
| A12 | `website` | Invoice lines always come from a product, quantities are integers, there is one invoice-level discount (spread proportionally across lines, in paise, in `utils/invoiceMath.ts`), and there is no round-off. | The backend v1 should copy this algorithm exactly and add tests, so the preview and the final total match. |
| A13 | `website` | `BillingService.getData()` loads every product, customer and invoice in one call. | The real adapter needs per-resource, paginated calls, which changes that contract (Phase 8). |
| A14 | `backend` | There is no test runner. | Add `node:test` + `tsx` (same approach as `website`) for the invoice maths and number generator. |

---

## ⚖️ Decisions Gate (answer before Phase 1 migration)

Each decision has a **recommended default**. The plan below assumes these defaults. If you change one, update the affected phases.

| ID | Decision | Recommended default | Why |
|---|---|---|---|
| D1 | Can one customer buy from several vendors? | **Yes.** A global `Customer` identity (unique email) plus a `VendorCustomer` link that holds each vendor's own name, phone, GSTIN and address. | The PWA has one unified login, and customers are created by vendors. One person who buys from two shops should see both sets of bills under one login. |
| D2 | Identity model | Keep `Admin`, `Vendor` and the new `Customer` as **separate auth tables**. Don't use `User`/`Roles`. If one email is both a vendor and a customer, `request-otp` returns both roles and the PWA asks which one to use. | Smallest change, keeps admin separate (rule 7), and avoids rewriting the existing vendor auth. |
| D3 | Money representation | **`Decimal(14,2)` rupees in the DB** for all money columns, and `Decimal(5,2)` for GST rates. The API sends rupee numbers with 2 decimals. Services calculate in **integer paise** internally (a port of `invoiceMath.ts`). | `Int` paise overflows at ₹2.14 crore, which is too small for B2B invoices. `BigInt` makes JSON handling awkward. Decimal matches the PWA's rupee values. `Product.price Int → Decimal` is a lossless migration. |
| D4 | Invoice numbering | **Per vendor, per Indian financial year (Apr–Mar)**, using an optional vendor prefix (default `INV`): `INV-2026-000001`. Max 16 characters (GST rule 46). | GST law requires one consecutive series per supplier per financial year. A single global series would leak volume across vendors. |
| D5 | Mobile login | **v1: look up by mobile, but send the OTP to the account's email** and show the masked email. SMS delivery is out of scope until a provider is chosen. | Keeps the PWA's single input field without adding an SMS gateway. |
| D6 | GST tax model | **Per-product `gstRate`** (0/5/12/18/28), plus optional `hsnCode` and unit. Intra-state means CGST + SGST (half each). Inter-state means IGST. Place of supply = the customer's state, falling back to the vendor's state. | Matches the PWA's UI and demo data. |
| D7 | Categories / brands | **Free-text `category` and `brand` strings on Product for v1.** Global Category/Brand tables come later, managed by admin. | The PWA only needs a filter. Strings can be normalised into tables later without blocking anything. |
| D8 | Invoice editing / void | **Immutable. No edit or void in v1.** Only `paymentStatus`, `paymentMode`, `paidAt` and `viewedAt` can change after creation. | Rule 3. A `status`/void column can be added later without breaking anything. |
| D9 | PDF engine | **Puppeteer** rendering a Handlebars template. Generate on first request, cache the file in the storage facade, and leave the paid/pending status off the PDF so the cache never goes stale. | Reuses the existing Handlebars pipeline. Puppeteer gives a high-quality GST invoice layout. |

---

## 📋 Phase-by-Phase Roadmap

### Phase 0: Hardening the Existing Backend (no schema change)
- **Objective:** Fix audit issues A1–A5 before building on top of them.
- **Tasks:**
  1. Add a shared `Roles` constant (`super_admin`, `admin`, `vendor`, `customer`, matching the lowercase values already in issued tokens) in `src/constants/` or an enum file following `.agents/enum.md`. Make `AdminRoles` reuse it.
  2. Add a `vendorGuard = [auth, checkUserRole([Roles.VENDOR])]` and apply it to the protected `/vendor/*` and `/vendor/products/*` routes. Confirm the vendor is still `active` (a deactivated vendor's existing token should stop working).
  3. Admin tokens should carry the admin's real role (A2). Add `role` to `Admin`, or resolve it from `roleId`. Restrict `POST /admin/add` to `super_admin`.
  4. Remove the `console.log` calls in `vendor.service.ts` (A3).
  5. Raise the global limit (for example 1000 per 15 minutes) and keep the strict `authRateLimiter` on auth routes only (A4).
  6. Product module cleanup: remove the duplicate repository, add pagination and search (`name`, `sku`) using the `{ total, records }` pattern from `findAllVendors`, and filter the `where` by `vendorId` in the repository (`findFirst({ id, vendorId })`) instead of comparing after the fetch.
  7. Add a `node:test` + `tsx` test script to `backend/package.json`.
- **Verify:** `npm run lint && npm run typecheck && npm run build`. Manually check that an admin token gets 403 on `/vendor/products`.

### Phase 1: Core Database Modeling (after the Decisions Gate)
- **Objective:** One migration (`add_billing_domain_models`) that adds the whole domain and keeps existing data.
- **Models (assuming defaults D1–D8):**
  - `Vendor` (extend): `password String?` (OTP accounts have none), `gstin`, `isGstRegistered`, `addressLine`, `city`, `state`, `stateCode` (the 2-digit GST code), `pincode`, `country @default("India")`, `upiId`, `logo`, `onboardedAt`, plus settings: `invoicePrefix @default("INV")`, `defaultPaymentTermsDays`, `defaultNote`.
  - `Product` (extend): `sku` (`@@unique([vendorId, sku])` when set), `hsnCode`, `unit`, `gstRate Decimal(5,2) @default(0)`, `category`, `brand`. `price Int → Decimal(14,2)` (lossless cast of the existing rupee values). Leave `quantity` and `unlimitedStock` as they are.
  - `Customer` (new, global identity): `id`, `email @unique` (lowercased), `phone` (indexed, normalised to the last 10 digits), `name`, `active`, timestamps.
  - `VendorCustomer` (new link): `vendorId`, `customerId`, `@@unique([vendorId, customerId])`, plus vendor-specific `displayName`, `phone`, `gstin`, `addressLine`, `city`, `state`, `stateCode`, `pincode`, `active`.
  - `Invoice` (new): `vendorId`, `customerId`, `vendorCustomerId`, `invoiceNumber`, `fiscalYear`, `sequence`, `invoiceDate`, `dueDate`, `placeOfSupplyStateCode`, `isInterState`, `subtotal`, `discountAmount`, `taxableAmount`, `cgstAmount`, `sgstAmount`, `igstAmount`, `taxAmount`, `totalAmount`, `currency @default("INR")`, `paymentStatus PaymentStatus @default(PENDING)`, `paymentMode?`, `paidAt?`, `viewedAt?`, `notes?`, `pdfKey?`. **Seller snapshot:** business name, GSTIN, address, state, email, phone, UPI ID. **Buyer snapshot:** name, email, phone, GSTIN, address, state. `@@unique([vendorId, invoiceNumber])`, `@@index([vendorId, createdAt])`, `@@index([customerId])`, `@@index([vendorId, paymentStatus])`. Relations use `onDelete: Restrict` (invoices are never cascade-deleted).
  - `InvoiceItem` (new): `invoiceId` (Cascade), `productId?` (`onDelete: SetNull`), `position`, plus snapshots `productName`, `productSku`, `hsnCode`, `unit`, `quantity Int`, `unitPrice`, `gstRate`, `lineSubtotal`, `discountAmount`, `taxableAmount`, `cgstAmount`, `sgstAmount`, `igstAmount`, `taxAmount`, `totalAmount`.
  - `InvoiceSequence` (new): `vendorId`, `fiscalYear`, `lastValue`, `@@id([vendorId, fiscalYear])`.
  - `OtpVerification` (new): `email`, `purpose` (`LOGIN`, `VENDOR_SIGNUP`), `codeHash`, `attempts`, `maxAttempts`, `expiresAt`, `resendAvailableAt`, `consumedAt?`, `requestIp?`, `createdAt`, `@@index([email, purpose, createdAt])`.
  - `enum PaymentStatus { PENDING PAID }`. No other values (rule 5).
- **Tasks:** update `schema.prisma` following `PRISMA_GUIDELINES.md`, then `npx prisma migrate dev --name add_billing_domain_models`, then `prisma generate`, then typecheck. Update the product Zod schemas and types for the new fields.

### Phase 2: OTP Authentication & Authorization
- **Objective:** Email OTP login and sign-up for vendors and customers. Admin keeps password login.
- **Tasks:**
  1. Create `src/features/auth/` (folder-per-layer): `OtpRepository`, `OtpService`, `AuthService`, controller, Zod schemas, routes.
  2. `OtpService`: 6-digit code from `crypto.randomInt`, stored as **HMAC-SHA256(code, JWT_SECRET-derived key)**, TTL 10 minutes, 5 attempts, 60-second resend cooldown. Requesting a new code invalidates any older unused one. Verification is one atomic `updateMany` (`consumedAt IS NULL AND attempts < max AND expiresAt > now`), and codes are compared with `timingSafeEqual`.
  3. Add a `src/templates/auth/otp.hbs` email and a `sendOtpEmail` helper in `email.service.ts`. Brand it Bill-Z (A8). Add `OTP_TTL_SECONDS`, `OTP_MAX_ATTEMPTS` and `OTP_RESEND_SECONDS` to the env schema (`.agents/env.md`). In development, when `DISABLE_EMAIL=true`, log the code to the console only.
  4. Endpoints (mounted at `/api/v1/auth`, each with `authRateLimiter` plus a per-email limit):
     - `POST /auth/request-otp` with `{ identifier, purpose }`. Resolves an email or a mobile number to a vendor and/or customer (D2, D5), then sends the OTP. Returns `{ roles, destination (masked), expiresAt, resendAt }`. For `LOGIN`, the response for an unknown account must not reveal whether the account exists beyond what the PWA design needs. Use one generic message and rely on rate limiting.
     - `POST /auth/verify-otp` with `{ email, code, role, purpose }`. Returns `{ token, user, role }`. For `VENDOR_SIGNUP`, it creates the `Vendor` with only an email, and `onboardedAt` stays null.
     - `POST /auth/logout`: stateless, so the client discards the token. It exists for API symmetry.
  5. Add a `customerGuard = [auth, checkUserRole([Roles.CUSTOMER])]` and an active-account check.
  6. Keep the old `/vendor/register` and `/vendor/login` (password) until Phase 8 is done, then remove them.
- **Verify:** unit tests for expiry, attempts, cooldown, reuse and wrong code.

### Phase 3: Vendor Business Profile & Product Extensions
- **Tasks:**
  1. Extend `vendorUpdateProfileSchema` and the service for the business fields and settings: GSTIN format validation, a state-to-state-code map in `src/constants/`, and logo upload through `uploadFor('vendors/logos')`.
  2. `PUT /vendor/profile` also completes onboarding: it sets `onboardedAt` once business name and state are present.
  3. Products: change delete to a **soft delete** (`active=false`) when the product is referenced by an `InvoiceItem`, and a hard delete otherwise. Add the new fields to the Zod schemas and the list filters (`category`, `active`, `search`).
  4. `GET /vendor/dashboard`: total sales, tax collected, customer count, bill count, paid vs pending (including derived overdue), and the 5 most recent invoices. All aggregates are filtered by `vendorId`.

### Phase 4: Customer Management (Vendor Scope)
- **Tasks:**
  1. Create `src/features/customer/` (folder-per-layer). Mount it at `/vendor/customers` with `vendorGuard`.
  2. `POST /vendor/customers`: upsert the global `Customer` by email, then create the `VendorCustomer` link (409 if already linked). Vendor-entered details go on the link only. **Never overwrite another vendor's view of the customer**, and never expose other vendors' links.
  3. `GET /vendor/customers` (paginated; search by name, email or phone), `GET /:id`, `PUT /:id`, `PATCH /:id/status` (deactivate). `:id` is the `VendorCustomer.id`, and every query filters by `vendorId`.
  4. `GET /customer/profile` and `PUT /customer/profile` (name and phone on the global identity), mounted at `/customer` with `customerGuard`.

### Phase 5: Invoice Engine (Transactional)
- **Tasks:**
  1. Create `src/features/invoice/` (folder-per-layer). Put the calculation in a pure function `calculateInvoice(lines, discount, interState)` (paise maths, a port of `website/src/utils/invoiceMath.ts`) and test it against the same cases as `website/tests`.
  2. `POST /vendor/invoices` with body `{ vendorCustomerId, invoiceDate, dueDate?, items: [{ productId, quantity }], discount?, notes? }`. **Prices, rates and names are never accepted from the client.** It runs in one `prisma.$transaction`:
     1. Load the vendor (must be onboarded) and the `VendorCustomer` where `vendorId = auth`.
     2. Load the products where `id IN (...) AND vendorId = auth AND active`. Reject unknown, inactive or duplicate IDs.
     3. Work out the place of supply and whether the sale is inter-state, then calculate totals.
     4. Get the next number atomically: `INSERT INTO "InvoiceSequence" ... ON CONFLICT (vendorId, fiscalYear) DO UPDATE SET lastValue = lastValue + 1 RETURNING lastValue` (`$queryRaw`). The row lock serialises concurrent requests per vendor, and `@@unique([vendorId, invoiceNumber])` is the backstop.
     5. Create the `Invoice` with its seller and buyer snapshots, and the `InvoiceItem` snapshots.
  3. `GET /vendor/invoices/next-number`: preview only, nothing is reserved (for the PWA's step 1).
  4. `GET /vendor/invoices`: paginated; filters for `status=ALL|PAID|PENDING|OVERDUE` (OVERDUE becomes `PENDING AND dueDate < today IST`), customer, date range and search by number. `GET /vendor/invoices/:id`.
  5. `PATCH /vendor/invoices/:id/payment-status` with `{ status: PENDING|PAID, paymentMode? }`: sets or clears `paidAt`. Vendor only. Nothing else on the invoice can be changed.
  6. Customer endpoints (`customerGuard`, filtered by `customerId = auth`): `GET /customer/invoices` (across all vendors, with filters), `GET /customer/invoices/:id` (sets `viewedAt` on the first view), and `GET /customer/dashboard` (outstanding amount and recent bills).
  7. Each response carries a derived `isOverdue` and a `timeline` (created, viewed, pending, paid) built from the timestamps, so the PWA no longer builds them itself.
- **Verify:** a concurrency test (N parallel creates give N distinct consecutive numbers), the maths tests, and ownership tests (vendor B gets 404 on vendor A's invoice and customer).

### Phase 6: PDF Generation & Admin Panel
- **PDF tasks:**
  1. `src/templates/invoice/invoice.hbs`: a GST tax invoice layout with seller and buyer GSTIN, place of supply, HSN, rate-wise CGST/SGST/IGST, amount in words (Indian system), UPI details and the footer note. Built only from the invoice snapshots.
  2. `InvoicePdfService`: Puppeteer (one browser instance reused across requests) to a buffer, then the storage facade at `invoices/{vendorId}/{invoiceId}.pdf`, saved as `pdfKey`.
  3. `GET /vendor/invoices/:id/pdf` and `GET /customer/invoices/:id/pdf`: ownership check, generate if missing, then stream or redirect to a signed S3 URL.
- **Admin backend tasks** (`/admin`, admin guard, read-only by default per rule 7):
  1. `GET /admin/stats`: vendors (active/inactive), customers, products, invoices, and paid vs pending amount and count.
  2. `GET /admin/vendors/:id` extended with counts. `GET /admin/customers` and `GET /admin/invoices` (paginated, read-only).
- **Admin panel tasks** (following `admin/AGENTS.md` and the `src/pages/projects/` reference module): replace the dashboard metrics in `dashboard-service.ts`, add a vendor detail view, and add Customers and Invoices pages using the existing table components.

### Phase 7: Vendor & Customer PWA UI — ✅ Done (built on mock data)
- **Visual Foundation:** Navy `#183153`, Primary Blue `#2563EB`, Success Green `#16845B`, Amber `#B7791F`, Error Red `#C0392B`, Surface `#FFFFFF`, BG `#F6F8FB`, Borders `#E4E7EC`, Action Orange `#EA580C`. Metric pastels: Blue `#E0F2FE`, Yellow `#FEF3C7`, Mint `#DCFCE7`, Lavender `#F3E8FF`. Inter, `rounded-xl` / `rounded-2xl`.
  - **7.1** Design tokens, `formatINR`, `formatDateIndian`, core components, app shell. [x]
  - **7.2** Authentication, OTP and business onboarding. [x]
  - **7.3** Vendor dashboard. [x]
  - **7.4** Product and customer management. [x]
  - **7.5** 4-step invoice creation with sticky total bar. [x]
  - **7.6** Invoice details, QR, payment progress, WhatsApp/call, filter tabs. [x]
  - **7.7** Customer portal. [x]
  - **7.8** PWA installability, offline banner, build verification. [x]

#### Phase 7.9 — Figma Website Prototype (16 October 2026)
- [x] Reuse the existing React, Tailwind and PWA stack, applying retrieved Figma layouts and local assets.
- [x] Replace active backend calls with typed asynchronous mock services and a separate JSON fixture.
- [x] Wire reusable product/customer forms, email OTP, invoice steps, saved preferences and customer bill filtering.
- [x] Verify production build, calculation tests, core interactions and offline shell loading.
- [x] Unified login (Figma node 2:58283, 18 November 2026): removed the Business/Customer toggle; mock `authService.findAccount` resolves email or mobile to the account role. Backend provides the equivalent lookup in `/auth/request-otp` (Phase 2).
- [ ] Resume direct comparison of the remaining Figma frames when the plan tool limit is cleared; frame coverage is documented in website/DESIGN_HANDOFF.md.

### Phase 8: Connect the PWA to the API
- **Objective:** Replace the mock services behind the existing contracts without changing the UI components.
- **Tasks:**
  1. Add `website/src/api/*.api.ts` adapters (auth, profile, products, customers, invoices, dashboard) on top of the existing `apiClient`. Unwrap `{ success, message, data }` in one place and map API errors to the messages the UI already shows.
  2. `VITE_USE_MOCK=true|false` chooses between the mock and HTTP implementations of `AuthService` and `BillingService`. Keep the mocks for demos and tests.
  3. Contract changes: split `getData()` into per-resource paginated calls (A13). `createInvoice` sends only `{ vendorCustomerId, dates, items: [{ productId, quantity }], discount, notes }` and shows the server's totals and number. Remove `'OVERDUE'` from `InvoicePaymentStatus` and use the server's `isOverdue` (A9). `findAccount` + `requestOtp` become one `request-otp` call that returns `roles`.
  4. Token handling: store the JWT, send it as `Authorization: Bearer`, and on 401 clear the session and redirect to login. Delete the password-based `auth.api.ts` methods and the customer "simulated fallback".
  5. Offline behaviour (rule 8): turn off invoice creation and payment updates while offline, and do not let the service worker cache API responses.
  6. Remove the backend password endpoints (Phase 2.6).
- **Verify:** `npm run build`, `npm run lint`, `npm test`. End-to-end check: vendor sign-up → onboarding → product → customer → invoice → mark paid → customer login sees the bill and PDF.

### Phase 9: Release Readiness
- Postman collection updated per `backend/.agents/postman.md` for every new endpoint.
- Seed script (one vendor, products, customers, invoices) to replace `demo.json` for local runs.
- Production env checklist: `JWT_SECRET`, SMTP, `USE_S3`, `WHITE_LIST_URLS` including the PWA and admin origins, and the Puppeteer/Chromium runtime in the deploy image.

---

## 🗺️ Execution Order & Dependencies

```
Phase 0 ──► Decisions Gate ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6 ──► Phase 9
                                              │                                   │
                                              └──── Phase 8 (auth slice) ◄────────┴── Phase 8 (billing slice)
```

- Phase 0 can start right away. It needs no decisions and no migration.
- Phase 8 can be done in slices. Connect auth and profile after Phase 2/3, then products, customers and invoices after Phase 5. The PWA stays on mocks until then.
- Each phase ends with the affected app's `lint`, `typecheck`/`build` and tests passing, plus updates to `requirements.md` and this file.
