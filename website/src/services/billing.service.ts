import seed from "../data/demo.json";
import type {
  CustomerItem,
  InvoiceRecord,
  ProductItem,
  VendorBusinessProfile,
  InvoicePaymentStatus,
} from "../types/billing.types";

export type Preferences = typeof seed.preferences;
export interface BillingData {
  profile: VendorBusinessProfile;
  products: ProductItem[];
  customers: CustomerItem[];
  invoices: InvoiceRecord[];
  preferences: Preferences;
}
export type NewInvoice = Omit<
  InvoiceRecord,
  "id" | "invoiceNumber" | "timeline"
>;
/** Replace this adapter with HTTP calls when the API is ready. UI components depend only on this contract. */
export interface BillingService {
  getData(): Promise<BillingData>;
  saveProfile(
    patch: Partial<VendorBusinessProfile>,
  ): Promise<VendorBusinessProfile>;
  saveProduct(
    product: Omit<ProductItem, "id"> & { id?: string },
  ): Promise<ProductItem>;
  deleteProduct(id: string): Promise<void>;
  saveCustomer(
    customer: Omit<CustomerItem, "id"> & { id?: string },
  ): Promise<CustomerItem>;
  createInvoice(invoice: NewInvoice): Promise<InvoiceRecord>;
  updatePayment(
    id: string,
    status: InvoicePaymentStatus,
    paymentMode?: string,
  ): Promise<InvoiceRecord>;
  savePreferences(patch: Partial<Preferences>): Promise<Preferences>;
}
const storageKey = "billz-demo-data-v1";
const clone = <T>(value: T): T => structuredClone(value);
function initialData(): BillingData {
  try {
    const stored = JSON.parse(
      localStorage.getItem(storageKey) || "null",
    ) as BillingData | null;
    if (
      stored &&
      Array.isArray(stored.products) &&
      Array.isArray(stored.invoices) &&
      stored.profile &&
      stored.preferences
    )
      return {
        ...stored,
        products: stored.products.map((product) => {
          const original = seed.products.find((p) => p.id === product.id);
          return original && original.imageUrl === product.imageUrl
            ? { ...original, ...product }
            : product;
        }),
      };
  } catch {
    /* Invalid cached demo data must not prevent opening the app. */
  }
  return clone(seed) as unknown as BillingData;
}
let data = initialData();
const persist = () => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    /* The session still works without storage. */
  }
};
export const billingService: BillingService = {
  async getData() {
    return clone(data);
  },
  async saveProfile(patch) {
    data.profile = { ...data.profile, ...patch };
    persist();
    return clone(data.profile);
  },
  async saveProduct(product) {
    const saved = { ...product, id: product.id || crypto.randomUUID() };
    data.products = product.id
      ? data.products.map((p) => (p.id === saved.id ? saved : p))
      : [saved, ...data.products];
    persist();
    return clone(saved);
  },
  async deleteProduct(id) {
    data.products = data.products.filter((p) => p.id !== id);
    persist();
  },
  async saveCustomer(customer) {
    const saved = { ...customer, id: customer.id || crypto.randomUUID() };
    data.customers = customer.id
      ? data.customers.map((c) => (c.id === saved.id ? saved : c))
      : [saved, ...data.customers];
    persist();
    return clone(saved);
  },
  async createInvoice(invoice) {
    const highest = Math.max(
      data.preferences.nextNumber - 1,
      ...data.invoices.map(
        (i) => Number(i.invoiceNumber.match(/(\d+)$/)?.[1]) || 0,
      ),
    );
    const next = highest + 1;
    const saved: InvoiceRecord = {
      ...clone(invoice),
      id: crypto.randomUUID(),
      invoiceNumber: `${data.preferences.prefix}${String(next).padStart(4, "0")}`,
      timeline: [
        {
          step: 1,
          title: "Invoice created",
          description: "Invoice generated in Bill-Z",
          date: invoice.invoiceDate,
          completed: true,
          iconType: "sent",
        },
        {
          step: 2,
          title: "Viewed by customer",
          description: "Awaiting customer view",
          completed: false,
          iconType: "viewed",
        },
        {
          step: 3,
          title: "Payment pending",
          description: `Due ${invoice.dueDate}`,
          completed: false,
          current: true,
          iconType: "pending",
        },
        {
          step: 4,
          title: "Payment received",
          description: "Awaiting payment",
          completed: false,
          iconType: "received",
        },
      ],
    };
    data.invoices = [saved, ...data.invoices];
    data.preferences.nextNumber = next + 1;
    persist();
    return clone(saved);
  },
  async updatePayment(id, status, paymentMode) {
    const invoice = data.invoices.find((i) => i.id === id);
    if (!invoice) throw new Error("Invoice not found");
    invoice.status = status;
    invoice.paymentMode = paymentMode;
    invoice.paidAt = status === "PAID" ? new Date().toISOString() : undefined;
    invoice.timeline = invoice.timeline.map((t) =>
      t.step >= 3
        ? {
            ...t,
            title:
              t.step === 3
                ? status === "PAID"
                  ? "Payment confirmed"
                  : "Payment pending"
                : "Payment received",
            description:
              status === "PAID"
                ? t.step === 4
                  ? `Received via ${paymentMode || "recorded payment"}`
                  : "Payment recorded by vendor"
                : t.step === 3
                  ? `Due ${invoice.dueDate}`
                  : "Awaiting payment",
            completed: status === "PAID",
            current: t.step === 3 && status !== "PAID",
          }
        : t,
    );
    persist();
    return clone(invoice);
  },
  async savePreferences(patch) {
    data.preferences = { ...data.preferences, ...patch };
    persist();
    return clone(data.preferences);
  },
};
export function resetDemoData() {
  data = clone(seed) as unknown as BillingData;
  persist();
  location.reload();
}
