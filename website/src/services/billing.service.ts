import seed from "../data/demo.json";
import { USE_API } from "../config/dataSource";
import { apiBillingService } from "../api/billing.adapter";
import { buildTimeline, displayStatus } from "../utils/invoiceTimeline";
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
  /** Global category and brand names managed by the Super Admin. */
  categories: string[];
  brands: string[];
}
export type NewInvoice = Omit<
  InvoiceRecord,
  "id" | "invoiceNumber" | "timeline"
>;
/** Account fields that are saved together with the business profile during onboarding. */
export type ProfilePatch = Partial<VendorBusinessProfile> & {
  firstName?: string;
  lastName?: string;
  businessType?: string;
};
/** UI components depend only on this contract. Mock and API adapters both implement it. */
export interface BillingService {
  getData(): Promise<BillingData>;
  saveProfile(patch: ProfilePatch): Promise<VendorBusinessProfile>;
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

const storageKey = "billz-demo-data-v2";
const clone = <T>(value: T): T => structuredClone(value);
/** The mock treats the design's reference date as "today", so overdue bills stay stable. */
const mockToday = seed.referenceDate;
const withDerived = (invoice: InvoiceRecord): InvoiceRecord => {
  const stored = invoice.status === "PAID" ? "PAID" : "PENDING";
  const status = displayStatus(stored, invoice.dueDate, mockToday);
  return { ...invoice, status, timeline: buildTimeline({ ...invoice, status }) };
};
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
      return { ...clone(seed), ...stored } as unknown as BillingData;
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
/** UI simulation only: numbering, totals and payment rules are enforced by the API in production. */
export const mockBillingService: BillingService = {
  async getData() {
    return clone({ ...data, invoices: data.invoices.map(withDerived) });
  },
  async saveProfile(patch) {
    const {
      firstName: _firstName,
      lastName: _lastName,
      businessType: _businessType,
      ...profile
    } = patch;
    data.profile = { ...data.profile, ...profile };
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
      status: "PENDING",
      id: crypto.randomUUID(),
      invoiceNumber: `${data.preferences.prefix}${String(next).padStart(6, "0")}`,
      timeline: [],
    };
    data.invoices = [saved, ...data.invoices];
    data.preferences.nextNumber = next + 1;
    persist();
    return withDerived(clone(saved));
  },
  async updatePayment(id, status, paymentMode) {
    const invoice = data.invoices.find((i) => i.id === id);
    if (!invoice) throw new Error("Invoice not found");
    const paid = status === "PAID";
    invoice.status = paid ? "PAID" : "PENDING";
    invoice.paymentMode = paid ? paymentMode : undefined;
    invoice.paidAt = paid ? new Date().toISOString() : undefined;
    persist();
    return withDerived(clone(invoice));
  },
  async savePreferences(patch) {
    data.preferences = { ...data.preferences, ...patch };
    persist();
    return clone(data.preferences);
  },
};

export const billingService: BillingService = USE_API
  ? apiBillingService
  : mockBillingService;

export function resetDemoData() {
  data = clone(seed) as unknown as BillingData;
  persist();
  location.reload();
}
