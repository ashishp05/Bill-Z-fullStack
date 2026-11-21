import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { useBilling } from "../../context/BillingContext";
import { Button } from "../../components/common/Button";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import {
  Avatar,
  DesignIcon,
  DesignProvider,
  EmptyState,
  ErrorMessage,
  Notice,
  SearchField,
  SectionHeading,
  Tabs,
  Textarea,
} from "../../components/common/Design";
import {
  InvoiceDocument,
  InvoiceTotals,
} from "../../components/common/InvoiceDocument";
import type {
  InvoiceLineItem,
  InvoiceRecord,
  ProductItem,
} from "../../types/billing.types";
import { formatINR, todayISODate } from "../../utils/indianFormat";
import seed from "../../data/demo.json";
import { USE_API } from "../../config/dataSource";
import { invoiceTotals } from "../../utils/invoiceMath";
interface Draft {
  step: number;
  customerId: string;
  items: InvoiceLineItem[];
  invoiceDate: string;
  dueDate: string;
  notes: string;
  discount: number;
}
const draftKey = "billz-invoice-draft-v2";
/** Mock mode uses the design's reference date as "today" so the demo stays consistent. */
const draftToday = () =>
  USE_API ? todayISODate() : seed.referenceDate;
/** Pre-fill the design example (2 kettles + 3 flasks) using the vendor's real products, matched by SKU. */
const exampleItems = (products: ProductItem[]): InvoiceLineItem[] =>
  seed.invoices[0].items.flatMap((item) => {
    const product = products.find((p) => p.sku === item.sku && p.active);
    return product
      ? [
          {
            ...item,
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            gstRate: product.gstRate,
            lineTotal: product.price * item.quantity,
          },
        ]
      : [];
  });
export function CreateInvoice() {
  const { profile, products, customers, preferences, addInvoice } =
    useBilling();
  const navigate = useNavigate();
  const location = useLocation();
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey) || "null");
      if (saved?.items && saved?.customerId)
        return {
          ...saved,
          ...(location.state?.customerId
            ? { customerId: location.state.customerId, step: 1 }
            : {}),
        };
    } catch {
      /* Start a fresh draft. */
    }
    return {
      step: 1,
      customerId: location.state?.customerId || customers[0]?.id || "",
      items: exampleItems(products),
      invoiceDate: draftToday(),
      dueDate: new Date(
        new Date(draftToday() + "T12:00:00Z").getTime() +
          preferences.paymentTerms * 86400000,
      )
        .toISOString()
        .slice(0, 10),
      notes: preferences.note,
      discount: 0,
    };
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<InvoiceRecord | null>(null);
  useEffect(() => {
    if (!created) sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft, created]);
  const selected = customers.find((c) => c.id === draft.customerId);
  const round = (value: number) => Math.round(value * 100) / 100;
  const interstate =
    !!selected && selected.state?.toLowerCase() !== profile.state.toLowerCase();
  const { subtotal, discount, totalTax, cgst, sgst, igst, totalAmount } =
    invoiceTotals(draft.items, draft.discount, interstate);
  const preview: InvoiceRecord = {
    id: "draft",
    invoiceNumber:
      preferences.prefix + String(preferences.nextNumber).padStart(6, "0"),
    vendorId: "vendor-1",
    vendorName: profile.businessName,
    vendorEmail: profile.email,
    vendorGstin: profile.gstin,
    vendorState: profile.state,
    customer: selected || customers[0],
    items: draft.items,
    invoiceDate: draft.invoiceDate,
    dueDate: draft.dueDate,
    subtotal,
    discount,
    cgst,
    sgst,
    igst,
    totalTax,
    totalAmount,
    status: "PENDING",
    timeline: [],
    notes: draft.notes,
  };
  function advance() {
    setError("");
    if (draft.step === 1 && !selected) {
      setError("Select a customer to continue.");
      return;
    }
    if (draft.step === 2 && !draft.items.length) {
      setError("Add at least one product to continue.");
      return;
    }
    if (
      draft.step === 3 &&
      (!draft.invoiceDate ||
        !draft.dueDate ||
        draft.dueDate < draft.invoiceDate)
    ) {
      setError("Choose a due date on or after the invoice date.");
      return;
    }
    setSearch("");
    setDraft((d) => ({ ...d, step: Math.min(4, d.step + 1) }));
    window.scrollTo(0, 0);
  }
  function addProduct(product: ProductItem) {
    setDraft((d) => {
      const current = d.items.find((i) => i.productId === product.id);
      return {
        ...d,
        items: current
          ? d.items.map((i) =>
              i.productId === product.id
                ? {
                    ...i,
                    quantity: i.quantity + 1,
                    lineTotal: round((i.quantity + 1) * i.unitPrice),
                  }
                : i,
            )
          : [
              ...d.items,
              {
                id: crypto.randomUUID(),
                productId: product.id,
                name: product.name,
                sku: product.sku,
                quantity: 1,
                unitPrice: product.price,
                gstRate: product.gstRate,
                lineTotal: product.price,
              },
            ],
      };
    });
  }
  function quantity(id: string, delta: number) {
    setDraft((d) => ({
      ...d,
      items: d.items.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity: Math.max(1, i.quantity + delta),
              lineTotal: round(Math.max(1, i.quantity + delta) * i.unitPrice),
            }
          : i,
      ),
    }));
  }
  async function generate() {
    if (!selected || !draft.items.length) {
      setError("Select a customer and add at least one product.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const {
        id: _id,
        invoiceNumber: _number,
        timeline: _timeline,
        ...input
      } = preview;
      const saved = await addInvoice(input);
      setCreated(saved);
      sessionStorage.removeItem(draftKey);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to create invoice.");
    } finally {
      setBusy(false);
    }
  }
  if (created)
    return (
      <div className="success-state">
        <span className="success-symbol" aria-hidden="true">
          ✓
        </span>
        <h1>Bill generated successfully</h1>
        <p className="muted">
          {created.invoiceNumber} is ready for {created.customer.name}.
        </p>
        <Card className="w-full">
          <InvoiceTotals invoice={created} />
        </Card>
        <Button
          fullWidth
          onClick={() => navigate("/vendor/invoices/" + created.id)}
        >
          View Bill
        </Button>
        <Button
          fullWidth
          variant="outline"
          onClick={() => navigate("/vendor/invoices")}
        >
          All invoices
        </Button>
      </div>
    );
  const visibleCustomers = customers.filter((c) =>
    (c.name + c.email + c.phone).toLowerCase().includes(search.toLowerCase()),
  );
  const availableProducts = products.filter(
    (p) =>
      p.active &&
      !draft.items.some((i) => i.productId === p.id) &&
      (category === "All" || p.category === category) &&
      (p.name + p.sku).toLowerCase().includes(search.toLowerCase()),
  );
  const screen = draft.step === 1 ? "selectCustomer" : "selectProducts";
  return (
    <DesignProvider screen={screen}>
      <header className="mobile-header wizard-header">
        <button
          className="back-button"
          aria-label="Go back"
          onClick={() =>
            draft.step === 1
              ? navigate(-1)
              : setDraft((d) => ({ ...d, step: d.step - 1 }))
          }
        >
          <DesignIcon name="imgArrowLeft" />
        </button>
        <div className="header-title">
          <h1>Create Bill</h1>
          <p>
            {draft.step === 1
              ? "New invoice · " + preview.invoiceNumber
              : "Billing " + selected?.name}
          </p>
        </div>
      </header>
      <div className="stack">
        <h1 className="desktop-only">Create Bill</h1>
        <div className="stepper">
          <div className="stepper-track">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={draft.step >= step ? "complete" : ""}
              />
            ))}
          </div>
          <div className="stepper-labels">
            {["Customer", "Products", "Details", "Review"].map((label, i) => (
              <button
                key={label}
                type="button"
                className={draft.step === i + 1 ? "current" : ""}
                disabled={i + 1 > draft.step}
                onClick={() => setDraft((d) => ({ ...d, step: i + 1 }))}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>
        </div>
        {draft.step === 1 && (
          <>
            <h1>Who are you billing?</h1>
            <p className="muted">
              Select an existing customer or add someone new.
            </p>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search name, email or mobile"
            />
            <Button
              fullWidth
              variant="outline"
              leftIcon={<DesignIcon name="imgUserPlus" />}
              onClick={() =>
                navigate("/vendor/customers/new", {
                  state: { fromInvoice: true },
                })
              }
            >
              Add Customer
            </Button>
            <p className="selection-label">RECENT CUSTOMERS</p>
            <div className="customer-picker">
              {visibleCustomers.slice(0, search ? undefined : 3).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`customer-choice ${draft.customerId === c.id ? "selected" : ""}`}
                  onClick={() => setDraft((d) => ({ ...d, customerId: c.id }))}
                  aria-pressed={draft.customerId === c.id}
                >
                  <Avatar name={c.name} size={40} />
                  <div>
                    <h3>{c.name}</h3>
                    <p>{c.email}</p>
                  </div>
                  <span className="choice-check" aria-hidden="true" />
                </button>
              ))}
            </div>
            {!visibleCustomers.length && (
              <EmptyState title="No matching customers">
                Add a customer to continue.
              </EmptyState>
            )}
            {selected && (
              <Notice>
                {selected.name} · {selected.state}.{" "}
                {interstate ? "IGST" : "CGST + SGST"} will apply.
              </Notice>
            )}
          </>
        )}
        {draft.step === 2 && (
          <>
            <h1>Add your products</h1>
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search product name or SKU"
            />
            <Tabs
              options={["All", "Kitchen", "Drinkware"]}
              value={category}
              onChange={setCategory}
            />
            {availableProducts.map((p) => (
              <Card className="product-row" key={p.id}>
                {p.imageUrl && (
                  <img
                    className="product-thumbnail"
                    style={{ width: 64, height: 64 }}
                    src={p.pickerImageUrl || p.imageUrl}
                    alt={p.name}
                  />
                )}
                <div className="product-information">
                  <h2>{p.name}</h2>
                  <p>
                    {formatINR(p.price)} · GST {p.gstRate}%
                  </p>
                </div>
                <button className="text-link" onClick={() => addProduct(p)}>
                  Add +
                </button>
              </Card>
            ))}
            <p className="hint">
              {draft.items.map((i) => i.name).join(" & ")}
              {draft.items.length
                ? " added below"
                : "Choose products to add to this bill."}
            </p>
            <SectionHeading
              title="Selected products"
              action={
                draft.items.length +
                " items · " +
                draft.items.reduce((s, i) => s + i.quantity, 0) +
                " units"
              }
            />
            <div className="line-items">
              {draft.items.map((i) => {
                const p = products.find((p) => p.id === i.productId);
                return (
                  <Card className="line-item" key={i.id}>
                    <div className="product-row">
                      {p?.imageUrl && (
                        <img
                          className="product-thumbnail"
                          src={p.pickerImageUrl || p.imageUrl}
                          alt={i.name}
                        />
                      )}
                      <div className="product-information">
                        <h3>{i.name}</h3>
                        <p>
                          {formatINR(i.unitPrice)} × {i.quantity} · GST{" "}
                          {i.gstRate}%
                        </p>
                      </div>
                      <strong className="amount">
                        {formatINR(i.lineTotal)}
                      </strong>
                    </div>
                    <div className="quantity-row">
                      <div className="quantity-control">
                        <button
                          aria-label={"Decrease " + i.name}
                          disabled={i.quantity <= 1}
                          onClick={() => quantity(i.id, -1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{i.quantity}</span>
                        <button
                          aria-label={"Increase " + i.name}
                          onClick={() => quantity(i.id, 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        className="remove-item"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            items: d.items.filter((item) => item.id !== i.id),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
            <Card>
              <InvoiceTotals
                invoice={preview}
                compact
                subtotalLabel={
                  "Subtotal · " +
                  draft.items.reduce((s, i) => s + i.quantity, 0) +
                  " units"
                }
                taxLabel={
                  new Set(draft.items.map((i) => i.gstRate)).size === 1
                    ? "GST (" + draft.items[0]?.gstRate + "%)"
                    : "GST"
                }
              />
            </Card>
          </>
        )}
        {draft.step === 3 && (
          <>
            <h1>Dates and notes</h1>
            <p className="muted">Add the finishing details to your bill.</p>
            <Input
              label="Invoice number"
              value={preview.invoiceNumber}
              readOnly
            />
            <div className="field-row">
              <Input
                label="Invoice date *"
                type="date"
                value={draft.invoiceDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, invoiceDate: e.target.value }))
                }
                required
              />
              <Input
                label="Due date *"
                type="date"
                min={draft.invoiceDate}
                value={draft.dueDate}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, dueDate: e.target.value }))
                }
                required
              />
            </div>
            <Input
              label="Discount (₹)"
              type="number"
              min="0"
              max={subtotal}
              step=".01"
              value={draft.discount}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  discount: Math.max(0, Number(e.target.value)),
                }))
              }
            />
            <Textarea
              label="Notes"
              value={draft.notes}
              onChange={(e) =>
                setDraft((d) => ({ ...d, notes: e.target.value }))
              }
            />
            <Notice>
              {interstate
                ? "Interstate sale. IGST applies."
                : "Same-state sale. GST is split into CGST and SGST."}
            </Notice>
            <Card>
              <InvoiceTotals invoice={preview} />
            </Card>
          </>
        )}
        {draft.step === 4 && (
          <>
            <h1>Review your bill</h1>
            <p className="muted">
              Check every detail before generating the invoice.
            </p>
            <InvoiceDocument
              invoice={preview}
              profile={profile}
              showGst={preferences.showGst}
            />
            <Notice>The invoice will be saved in your Bills list.</Notice>
          </>
        )}
        <ErrorMessage>{error}</ErrorMessage>
        <div className="form-actions">
          {draft.step < 4 ? (
            <Button fullWidth onClick={advance}>
              Continue
            </Button>
          ) : (
            <Button fullWidth isLoading={busy} onClick={() => void generate()}>
              Generate Bill
            </Button>
          )}
          {draft.step > 1 && (
            <Button
              fullWidth
              variant="outline"
              onClick={() => {
                setError("");
                setDraft((d) => ({ ...d, step: d.step - 1 }));
              }}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </DesignProvider>
  );
}
