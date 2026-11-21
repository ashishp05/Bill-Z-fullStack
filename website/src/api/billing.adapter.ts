import seed from "../data/demo.json";
import { emptyBillingData } from "../data/emptyBillingData";
import { apiClient, request, SESSION_KEY } from "./client";
import { buildTimeline } from "../utils/invoiceTimeline";
import type {
  BillingData,
  BillingService,
  Preferences,
  ProfilePatch,
} from "../services/billing.service";
import type {
  CustomerItem,
  InvoiceRecord,
  ProductItem,
  VendorBusinessProfile,
} from "../types/billing.types";

/** Shapes returned by the Bill-Z API (backend/src/features). Money is whole rupees. */
interface Named {
  id: string;
  name: string;
}
interface ApiProduct {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  hsn: string | null;
  unit: string;
  price: number;
  gstRate: number;
  active: boolean;
  quantity: number;
  unlimitedStock: boolean;
  images: string[];
  category: Named | null;
  brand: Named | null;
}
interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}
interface ApiInvoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendor: {
    businessName: string;
    gstin: string | null;
    email: string;
    state: string | null;
  };
  customer: ApiCustomer;
  items: {
    id: string;
    productId: string | null;
    name: string;
    sku: string | null;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    lineTotal: number;
  }[];
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  totalAmount: number;
  status: "PENDING" | "PAID";
  isOverdue: boolean;
  paymentMode: string | null;
  paidAt: string | null;
  viewedAt: string | null;
  notes: string | null;
}
interface ApiVendorProfile {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string | null;
  gstin: string | null;
  isRegisteredGST: boolean;
  phoneNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  upiId: string | null;
}
interface ApiSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultGstRate: number;
  paymentTermsDays: number;
  invoiceNote: string | null;
  showGst: boolean;
  emailInvoices: boolean;
  paymentUpdates: boolean;
  weeklySummary: boolean;
}
interface Page<T> {
  total: number;
  records: T[];
}

const PAGE = 100;
const text = (value: string | null | undefined) => value ?? undefined;

/** Seeded demo products have no uploads; reuse the Figma artwork so screens match the design. */
const demoArtwork = new Map(seed.products.map((p) => [p.sku, p]));

const toProduct = (p: ApiProduct): ProductItem => {
  const art = p.sku ? demoArtwork.get(p.sku) : undefined;
  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? "",
    price: p.price,
    gstRate: p.gstRate,
    hsn: text(p.hsn),
    unit: p.unit,
    description: text(p.description),
    active: p.active,
    quantity: p.quantity,
    unlimitedStock: p.unlimitedStock,
    category: p.category?.name,
    brand: p.brand?.name,
    imageUrl: p.images[0] ?? art?.imageUrl,
    detailImageUrl: p.images[0] ? undefined : art?.detailImageUrl,
    pickerImageUrl: p.images[0] ? undefined : art?.pickerImageUrl,
  };
};

const toCustomer = (c: ApiCustomer): CustomerItem => ({
  id: c.id,
  name: c.name,
  email: c.email,
  phone: c.phone ?? "",
  gstin: text(c.gstin),
  address: text(c.address),
  city: text(c.city),
  state: text(c.state),
  pincode: text(c.pincode),
});

const toInvoice = (i: ApiInvoice): InvoiceRecord => {
  const record: InvoiceRecord = {
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    vendorId: i.vendorId,
    vendorName: i.vendor.businessName,
    vendorEmail: i.vendor.email,
    vendorGstin: text(i.vendor.gstin),
    vendorState: text(i.vendor.state),
    customer: toCustomer(i.customer),
    items: i.items.map((item) => ({
      id: item.id,
      productId: text(item.productId),
      name: item.name,
      sku: text(item.sku),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate,
      lineTotal: item.lineTotal,
    })),
    invoiceDate: i.invoiceDate,
    dueDate: i.dueDate,
    subtotal: i.subtotal,
    discount: i.discount,
    cgst: i.cgst,
    sgst: i.sgst,
    igst: i.igst,
    totalTax: i.totalTax,
    totalAmount: i.totalAmount,
    status: i.isOverdue ? "OVERDUE" : i.status,
    paymentMode: text(i.paymentMode),
    paidAt: text(i.paidAt),
    viewedAt: text(i.viewedAt),
    notes: text(i.notes),
    timeline: [],
  };
  return { ...record, timeline: buildTimeline(record) };
};

const toProfile = (v: ApiVendorProfile): VendorBusinessProfile => ({
  businessName: v.businessName ?? "",
  gstin: v.gstin ?? "",
  email: v.email,
  phoneNumber: v.phoneNumber ?? "",
  address: v.address ?? "",
  city: v.city ?? "",
  state: v.state ?? "Gujarat",
  pincode: v.pincode ?? "",
  upiId: v.upiId ?? "",
  isRegisteredGST: v.isRegisteredGST,
});

const toPreferences = (s: ApiSettings): Preferences => ({
  prefix: s.invoicePrefix,
  nextNumber: s.nextInvoiceNumber,
  gstRate: s.defaultGstRate,
  paymentTerms: s.paymentTermsDays,
  priceEntry: "Exclusive of tax",
  note: s.invoiceNote ?? "",
  showGst: s.showGst,
  emailInvoices: s.emailInvoices,
  paymentUpdates: s.paymentUpdates,
  weeklySummary: s.weeklySummary,
});

const sessionRole = (): "vendor" | "customer" | null => {
  try {
    return (
      JSON.parse(localStorage.getItem(SESSION_KEY) || "null")?.user?.role ??
      null
    );
  } catch {
    return null;
  }
};

/** Category and brand ids, so the UI can keep working with names. */
const catalogIds = {
  categories: new Map<string, string>(),
  brands: new Map<string, string>(),
};

async function loadCatalog(kind: "categories" | "brands") {
  const items = await request<Named[]>(apiClient.get(`/catalog/${kind}`));
  catalogIds[kind] = new Map(items.map((item) => [item.name, item.id]));
  return items.map((item) => item.name);
}

/** Data URLs from the image picker become an uploaded file; existing URLs are left as they are. */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, body] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/png";
  const bytes = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export const apiBillingService: BillingService = {
  async getData(): Promise<BillingData> {
    const role = sessionRole();
    if (role === "customer") {
      const page = await request<Page<ApiInvoice>>(
        apiClient.get("/customer/invoices", { params: { limit: PAGE } }),
      );
      return { ...emptyBillingData(), invoices: page.records.map(toInvoice) };
    }
    if (role !== "vendor") return emptyBillingData();

    const [
      profile,
      settings,
      products,
      customers,
      invoices,
      categories,
      brands,
    ] = await Promise.all([
      request<ApiVendorProfile>(apiClient.get("/vendor/profile")),
      request<ApiSettings>(apiClient.get("/vendor/settings")),
      request<ApiProduct[]>(apiClient.get("/vendor/products")),
      request<Page<ApiCustomer>>(
        apiClient.get("/vendor/customers", { params: { limit: PAGE } }),
      ),
      request<Page<ApiInvoice>>(
        apiClient.get("/vendor/invoices", { params: { limit: PAGE } }),
      ),
      loadCatalog("categories"),
      loadCatalog("brands"),
    ]);
    return {
      profile: toProfile(profile),
      preferences: toPreferences(settings),
      products: products.map(toProduct),
      customers: customers.records.map(toCustomer),
      invoices: invoices.records.map(toInvoice),
      categories,
      brands,
    };
  },

  async saveProfile(patch: ProfilePatch) {
    const saved = await request<ApiVendorProfile>(
      apiClient.put("/vendor/profile", patch),
    );
    return toProfile(saved);
  },

  async saveProduct(product) {
    const form = new FormData();
    const fields: Record<string, string | number | boolean | undefined> = {
      name: product.name,
      sku: product.sku,
      price: product.price,
      gstRate: product.gstRate,
      hsn: product.hsn,
      unit: product.unit,
      description: product.description,
      active: product.active,
      categoryId: product.category
        ? (catalogIds.categories.get(product.category) ?? "")
        : "",
      brandId: product.brand
        ? (catalogIds.brands.get(product.brand) ?? "")
        : "",
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) form.append(key, String(value));
    }
    if (product.imageUrl?.startsWith("data:")) {
      form.append("images", dataUrlToBlob(product.imageUrl), "product-image");
    }
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const saved = await request<ApiProduct>(
      product.id
        ? apiClient.put(`/vendor/products/${product.id}`, form, config)
        : apiClient.post("/vendor/products", form, config),
    );
    // Re-read so image keys come back as public URLs.
    return toProduct(
      await request<ApiProduct>(apiClient.get(`/vendor/products/${saved.id}`)),
    );
  },

  async deleteProduct(id) {
    await request(apiClient.delete(`/vendor/products/${id}`));
  },

  async saveCustomer(customer) {
    const { id, ...body } = customer;
    const payload = {
      ...body,
      gstin: body.gstin ?? "",
      address: body.address ?? "",
      city: body.city ?? "",
      state: body.state ?? "",
      pincode: body.pincode ?? "",
    };
    const saved = await request<ApiCustomer>(
      id
        ? apiClient.put(`/vendor/customers/${id}`, payload)
        : apiClient.post("/vendor/customers", payload),
    );
    return toCustomer(saved);
  },

  // Only ids and quantities are sent: the server prices, taxes and numbers the invoice.
  async createInvoice(invoice) {
    const items = invoice.items.map((item) => {
      if (!item.productId)
        throw new Error("Every line must be a product from your catalogue.");
      return { productId: item.productId, quantity: item.quantity };
    });
    const saved = await request<ApiInvoice>(
      apiClient.post("/vendor/invoices", {
        customerId: invoice.customer.id,
        items,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        discount: Math.round(invoice.discount),
        notes: invoice.notes ?? "",
      }),
    );
    return toInvoice(saved);
  },

  async updatePayment(id, status, paymentMode) {
    const saved = await request<ApiInvoice>(
      apiClient.patch(`/vendor/invoices/${id}/payment`, {
        status: status === "PAID" ? "PAID" : "PENDING",
        ...(status === "PAID" ? { paymentMode } : {}),
      }),
    );
    return toInvoice(saved);
  },

  async savePreferences(patch) {
    const body = {
      invoicePrefix: patch.prefix,
      nextInvoiceNumber: patch.nextNumber,
      defaultGstRate: patch.gstRate,
      paymentTermsDays: patch.paymentTerms,
      invoiceNote: patch.note,
      showGst: patch.showGst,
      emailInvoices: patch.emailInvoices,
      paymentUpdates: patch.paymentUpdates,
      weeklySummary: patch.weeklySummary,
    };
    const saved = await request<ApiSettings>(
      apiClient.put("/vendor/settings", body),
    );
    return toPreferences(saved);
  },
};
