# Figma implementation handoff

Source: [Bill-Z Figma design](https://www.figma.com/design/fIjIKc2bHQNAjMocIJpVQ0/Untitled?node-id=0-1).

## Design context retrieved

The following frames were retrieved through high-fidelity Figma design context and used as implementation references:

| Frame                    | Node ID | Website area                                   |
| ------------------------ | ------- | ---------------------------------------------- |
| Vendor email login       | 2:58267 | /auth                                          |
| Vendor OTP verification  | 2:58311 | /auth verification step                        |
| Vendor registration      | 2:58360 | /auth account step                             |
| Business setup           | 2:58402 | /auth business step and shared business fields |
| Vendor dashboard         | 2:58461 | /vendor, mobile                                |
| Desktop vendor dashboard | 2:60636 | /vendor, desktop                               |
| Products catalogue       | 2:58615 | /vendor/products                               |
| Add product              | 2:58703 | /vendor/products/new                           |
| Product details          | 2:58863 | /vendor/products/:id                           |
| Select customer          | 2:58926 | Create Bill, step 1                            |
| Add customer             | 2:58990 | /vendor/customers/new                          |
| Select products          | 2:59050 | Create Bill, step 2                            |
| All invoices             | 2:59360 | /vendor/invoices                               |
| Vendor account           | 2:59771 | /vendor/account                                |
| Invoice settings         | 2:59893 | /vendor/invoice-settings                       |

The mobile vendor dashboard screenshot supplied by Figma was the primary visual comparison target. Desktop layout uses the retrieved hierarchy, sizes and styles. At 390px the dashboard uses 20px content padding, 16px cards, 50px actions, the navy sales panel, and the original product/icon assets. Desktop adds the 220px sidebar, 80px header, three metrics, 618px reference chart column and invoice table. Tablet widths adapt using the mobile navigation.

The available design assets are bundled under `public/figma/`: 168 non-empty files, with screen mappings and natural SVG dimensions in `src/design/`.

## Comparison still required

Figma returned: “You've reached the Figma MCP tool call limit on the Starter plan.” Additional design-context requests could not be retrieved.

Direct pixel comparison is therefore still required for the splash screen, edit-product frame, invoice dates/review/success/detail/PDF frames, profile overview, edit-business frame, notification/help frames, the customer-specific frames, and desktop invoice review. Existing content/workflows for these areas were adapted to the shared retrieved tokens/components; they are not certified as pixel-perfect matches.

Once Figma access is available again, retrieve these frames and compare their local routes before claiming exact parity across the entire file. Do not replace the editable React UI with screenshots.

## Deliberate implementation behavior

- App buttons, inputs, tabs, navigation and quantity controls are interactive.
- Figma's static device status/home indicator is shown in a mobile browser preview and hidden when installed in standalone mode.
- “Synced” copy is changed to “saved on this device” because the requested version is local mock data.
- All API-facing operations are behind asynchronous adapters.
- SVGs retain their original intrinsic dimensions; product imagery remains data supplied.
- The existing favicon/brand update present in the workspace was preserved, including the install-card mark.
- The documented sign-in uses one email OTP factor; this implementation does not invent a separate second factor.
- Demo OTP limits are configurable examples, not thresholds specified by the PRD.
- Native PDF output uses Print / Save PDF until a PDF endpoint is integrated.
