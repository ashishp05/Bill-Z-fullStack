# CLAUDE.md — Bill-Z

Bill-Z is a billing and invoice platform for Indian vendors. Vendors manage products and customers, create GST invoices and track payment. Customers view their bills. A Super Admin oversees the whole platform.

Source-of-truth docs (read the relevant one before any non-trivial change):
- [project.md](project.md): business rules, domain model, security rules, open questions. Do not edit it unless the architecture or business rules change.
- [requirements.md](requirements.md): the requirement checklist (`[ ]` / `[~]` / `[x]`). **Update it whenever a requirement is added or completed.**
- [plan.md](plan.md): the phased roadmap. **Update it when the plan changes.**

## Repo layout (not a git repo)

| Folder | What it is | Stack | Conventions doc |
|---|---|---|---|
| `backend/` | REST API, single source of truth | Node ≥24, Express 5, TypeScript, Prisma 7, PostgreSQL, Zod, Nodemailer + Handlebars, local/S3 storage facade | `backend/.agents/*.md` (AGENTS, controller, service, route, schema, zod, enum, env, helper, cron, postman, code-formation), `backend/PRISMA_GUIDELINES.md` |
| `admin/` | Super Admin panel | Vite, React 18, TS, Tailwind, Redux Toolkit, axios `http-service`, Yup | `admin/AGENTS.md` (reference module: `src/pages/projects/`) |
| `website/` | Vendor and Customer PWA, one codebase with role-based views | Vite, React, TS, Tailwind, Vite PWA | `website/DESIGN_HANDOFF.md`, `website/README.md` |

### Commands
- backend: `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npx prisma migrate dev --name <name>`
- admin: `npm run dev` · `npm run build` · `npm run lint`
- website: `npm run dev` · `npm run build` · `npm run lint` (oxlint) · `npm test` (node test runner, `tests/*.test.ts`)

Always run the affected app's build, lint or typecheck after changes, and fix errors before reporting done.

## Current state (as of 2026-11-18)

**Backend**
- Feature modules in `src/features/{admin,vendor,product}/`. Each one uses **folder-per-layer**: `controllers/ repositories/ routes/ schemas/ services/ types/`. Follow that pattern for new features (customer, invoice, auth/otp), not the flat-file layout that plan.md describes.
- Prisma models: `Admin`, `User`, `Roles`, `Vendor`, `Product`. Missing: `Customer`, `Invoice`, `InvoiceItem`, `OtpVerification`, Category/Brand.
- Done: admin password auth + JWT (`SUPER_ADMIN`/`ADMIN`), admin vendor listing and status toggle, basic vendor auth (email/password), product CRUD with images.
- Not done: email OTP auth, customers, invoices, PDF, the extended vendor business profile, admin platform stats.

**Admin**: real login, profile, change-password and add-admin are wired. The vendor list exists. The dashboard metrics, customers and invoices screens are not built.

**Website (PWA)**: the full Figma-based UI is built (Phases 7.1–7.9). **It runs on mock data**: `src/data/demo.json` plus typed async mocks in `src/services/auth.service.ts` and `billing.service.ts`. Those service files are the seams where real API adapters will go. Manifest, service worker, offline banner and install prompt are done.

## Non-negotiable rules

1. **Ownership on every query.** Vendor resources are always filtered by the authenticated vendor (`WHERE vendorId = <auth vendor>`). Customers only see their own invoices. Every protected endpoint checks authentication → role → resource ownership. Never rely on frontend route guards alone.
2. **Backend calculations are authoritative.** Invoice totals, tax and discounts are computed on the server, inside a `$transaction`, from current DB prices. Frontend math is only a preview.
3. **Invoices are immutable.** `InvoiceItem` stores snapshots (product name, SKU, unit price, tax). A later change to a product or customer must never change a past invoice.
4. **Invoice numbers** (`INV-YYYY-000001`) are generated on the backend and must be safe under concurrent requests. Never generate them on the frontend.
5. **Payment status**: only `PENDING` and `PAID` for now. The vendor changes it; the customer has read-only access. Don't add PARTIALLY_PAID/OVERDUE/etc. or payment gateways until they are requested. "Overdue" in the UI is derived, not stored.
6. **OTP**: store it hashed, with an expiry, a max-attempts limit, a resend cooldown, rate limiting and one-time use. Share the same flow between vendor and customer. Admin keeps password login.
7. **Admin separation**: admin auth and permissions are separate from vendor/customer auth. Super Admin does not modify vendor business data by default.
8. **PWA offline is limited**: cache the shell and assets only. Invoice creation requires a network connection.
9. **One response shape**: use the backend's existing response and error helpers (`{ success, message, data }`). Don't introduce a second pattern.
10. **Money**: store amounts in a consistent representation. The integer paise vs Decimal decision is still open (see below), so don't mix the two. Display amounts with `formatINR` (Indian grouping, ₹2,32,000) and dates with `formatDateIndian`.

## Working discipline

- Before a change, read the existing code and its conventions doc, then make the **smallest logical change**. Don't rewrite unrelated code or restructure the boilerplates.
- Reuse what exists: don't duplicate services, API clients, components, models or utilities.
- When a new requirement arrives, work out which modules it affects (DB, API, admin, PWA) and whether it conflicts with an existing rule. Then update requirements.md and plan.md before implementing.
- Don't implement "future" features from project.md §26 (inventory, partial payments, UPI gateway, recurring invoices, etc.) unless explicitly asked. Do avoid schema decisions that would block them.
- Never commit or print `.env` contents (both `backend/.env` and `admin/.env` exist).

## Open decisions — ask before making irreversible schema choices

- **Customer ownership:** can one customer buy from several vendors? If so, use a global customer identity plus a `VendorCustomer` link table, not a single `vendorId` on Customer. This is still unresolved.
- **Inventory:** assume billing only, with no stock logic. The existing `Product.quantity` and `unlimitedStock` fields predate this assumption; leave them as they are.
- **GST:** the PWA UI already shows CGST/SGST/IGST and GSTIN. Confirm the backend tax model (per-product rate? HSN/SAC?) before hard-coding it.
- **Invoice editing / void:** assume generated invoices are immutable unless the user decides otherwise.
- **Categories/Brands:** are they global or per vendor? Global is preferred but not confirmed.
- **Money representation:** integer paise or Prisma Decimal?
- **User vs Admin/Vendor models:** the schema has both a `User` and role-specific tables. Check how they relate before adding Customer/OTP identity.

## Design tokens (PWA)

Navy `#183153` · Primary `#2563EB` · Success `#16845B` · Amber `#B7791F` · Error `#C0392B` · Action orange `#EA580C` · BG `#F6F8FB` · Surface `#FFFFFF` · Text `#172033` / `#667085` · Border `#E4E7EC` · Metric pastels: blue `#E0F2FE`, yellow `#FEF3C7`, mint `#DCFCE7`, lavender `#F3E8FF`. Font: Inter (bundled locally). Radii: `rounded-xl` / `rounded-2xl`. Mobile-first, with bottom nav on mobile.

## Likely next steps (from plan.md)

1. Phase 1: finalize the Prisma domain models and migration (after the open decisions above are answered).
2. Phase 2: OtpService, `/api/v1/auth/request-otp` and `/verify-otp`, role and ownership middleware.
3. Phases 3–5: customer module, invoice engine (transactional), PDF (Handlebars + headless renderer, stored through the storage facade).
4. Phase 6: admin dashboard metrics and invoice oversight.
5. Replace the website's mock services with real API adapters.
