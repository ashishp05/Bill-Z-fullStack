# Bill-Z website

React + TypeScript + Tailwind PWA, adapted from the Bill-Z Figma file. The running app uses local mock JSON and does not call the backend.

## Run

Use Node.js 22.12+.

```sh
npm install
npm run dev
```

Open http://localhost:5174. For an existing checkout with dependencies installed, only `npm run dev` is needed.

```sh
npm run build
npm run preview
npm run test
npm run lint
```

The installable PWA/service worker is enabled in production builds, not in the Vite development server. Use HTTPS when hosting; localhost is supported for local PWA checks.

## Try the demo

- Business email: `rohan@mehtatraders.in`
- Customer email: `aarav.mehta@gmail.com`
- Demo verification code: `482916` (prefilled to match the Figma state)
- Use the Business/Customer chip on the sign-in screen to switch portals.
- Register your business opens verification, account details, and business setup.
- Product and customer changes, invoice creation, payment status, and preferences persist in this browser.
- Invoice drafts survive navigation to Add Customer and page reloads.
- Print / Save PDF uses the browser's print dialog.

The OTP flow is a local simulation with no email delivery. The demo uses a 30-second resend cooldown, five attempts, ten-minute expiry and one-time consumption. These thresholds are editable in the fixture and are not a production security implementation.

## Mock data and API integration

Edit `src/data/demo.json` for the initial business, products, customers, invoices, preferences, and demo OTP configuration.

| File                              | Responsibility                                                     |
| --------------------------------- | ------------------------------------------------------------------ |
| `src/services/billing.service.ts` | Typed asynchronous repository contract and local implementation    |
| `src/services/auth.service.ts`    | Request/verify OTP contract and local implementation               |
| `src/context/BillingContext.tsx`  | Loading and UI state updates after repository operations           |
| `src/context/AuthContext.tsx`     | Demo session state and login/logout                                |
| `src/types/billing.types.ts`      | Product, customer and immutable invoice DTOs                       |
| `src/utils/invoiceMath.ts`        | Preview calculations in paise, including mixed rates and discounts |
| `src/design/assets.json`          | Screen-to-asset mapping for downloaded Figma images/SVGs           |
| `src/index.css`                   | Shared visual tokens, layout and responsive styles                 |

Replace the two service implementations with HTTP calls that return the same DTOs. The contexts already await asynchronous operations and surface errors in the forms. The existing Axios client under `src/api/` is retained for integration but is not imported by the active demo flow.

When adding a production API:

1. Let the server generate, deliver, expire, rate-limit and verify OTPs. Replace demo session persistence with the production session strategy.
2. Enforce role and invoice ownership on the server. Frontend route guards/customer-email filters are presentation logic.
3. Let the server authoritatively calculate totals and allocate invoice numbers. Keep frontend totals as previews.
4. Return a PDF URL or download response in place of the browser-print action.
5. Connect notification preferences to real delivery; the demo only saves preferences locally.

Storage keys: `billz-demo-data-v1` in localStorage, `billz-demo-session` in localStorage, and `billz-invoice-draft-v1` in sessionStorage. Clear these keys in browser site data to return to the original fixtures. Demo storage is specific to the browser and origin.

## Design coverage

See [DESIGN_HANDOFF.md](DESIGN_HANDOFF.md) for inspected Figma frame IDs, visual coverage and remaining comparison work.

The app uses locally downloaded Figma assets and bundled Inter fonts. It has no runtime dependency on expiring Figma URLs or Google Fonts. The font license is in `public/fonts/OFL.txt`.

## Verification

- TypeScript + Vite production build passes.
- Five calculation tests cover the Figma example, mixed GST rates, pre-tax discounts, paise rounding, and empty/fully discounted bills.
- Browser checks cover OTP rejection/success, search/category filtering, product edits persisting after reload, quantity recalculation, invoice creation, recording payment, customer-only bill visibility, and rejection of another customer's invoice.
- Responsive checks at 320, 390, 768 and 1280 pixels found no horizontal overflow or broken visible image assets on the dashboard.
- The production dashboard reloaded successfully after its preview server was stopped, verifying the cached shell and local assets.
- Oxlint completes with two provider/hook export warnings in the existing context-file pattern.

No backend, admin application, schema, deployment, or live billing data is changed by this implementation.
