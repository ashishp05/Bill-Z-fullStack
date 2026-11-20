import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import seed from "../data/demo.json";
import { billingService } from "../services/billing.service";
import type {
  BillingData,
  NewInvoice,
  Preferences,
} from "../services/billing.service";
import type {
  CustomerItem,
  ProductItem,
  VendorBusinessProfile,
  InvoicePaymentStatus,
} from "../types/billing.types";

function useBillingState() {
  const [data, setData] = useState<BillingData>(seed as unknown as BillingData);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    billingService
      .getData()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((e) => {
        if (active) setError(String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const updateProfile = async (patch: Partial<VendorBusinessProfile>) => {
    const profile = await billingService.saveProfile(patch);
    setData((d) => ({ ...d, profile }));
  };
  const addProduct = async (product: Omit<ProductItem, "id">) => {
    const saved = await billingService.saveProduct(product);
    setData((d) => ({ ...d, products: [saved, ...d.products] }));
    return saved;
  };
  const updateProduct = async (id: string, patch: Partial<ProductItem>) => {
    const current = data.products.find((p) => p.id === id);
    if (!current) throw new Error("Product not found");
    const saved = await billingService.saveProduct({
      ...current,
      ...patch,
      id,
    });
    setData((d) => ({
      ...d,
      products: d.products.map((p) => (p.id === id ? saved : p)),
    }));
  };
  const deleteProduct = async (id: string) => {
    await billingService.deleteProduct(id);
    setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }));
  };
  const addCustomer = async (customer: Omit<CustomerItem, "id">) => {
    const saved = await billingService.saveCustomer(customer);
    setData((d) => ({ ...d, customers: [saved, ...d.customers] }));
    return saved;
  };
  const updateCustomer = async (id: string, patch: Partial<CustomerItem>) => {
    const current = data.customers.find((c) => c.id === id);
    if (!current) throw new Error("Customer not found");
    const saved = await billingService.saveCustomer({
      ...current,
      ...patch,
      id,
    });
    setData((d) => ({
      ...d,
      customers: d.customers.map((c) => (c.id === id ? saved : c)),
    }));
  };
  const addInvoice = async (invoice: NewInvoice) => {
    const saved = await billingService.createInvoice(invoice);
    setData((d) => ({
      ...d,
      invoices: [saved, ...d.invoices],
      preferences: {
        ...d.preferences,
        nextNumber: d.preferences.nextNumber + 1,
      },
    }));
    return saved;
  };
  const updatePaymentStatus = async (
    id: string,
    status: InvoicePaymentStatus,
    mode?: string,
  ) => {
    const saved = await billingService.updatePayment(id, status, mode);
    setData((d) => ({
      ...d,
      invoices: d.invoices.map((i) => (i.id === id ? saved : i)),
    }));
  };
  const savePreferences = async (patch: Partial<Preferences>) => {
    const preferences = await billingService.savePreferences(patch);
    setData((d) => ({ ...d, preferences }));
  };
  return {
    ...data,
    isLoading,
    error,
    updateProfile,
    addProduct,
    updateProduct,
    deleteProduct,
    addCustomer,
    updateCustomer,
    addInvoice,
    updatePaymentStatus,
    savePreferences,
    getInvoiceById: (id: string) =>
      data.invoices.find((i) => i.id === id || i.invoiceNumber === id),
  };
}
const BillingContext = createContext<ReturnType<typeof useBillingState> | null>(
  null,
);
export function BillingProvider({ children }: { children: ReactNode }) {
  return (
    <BillingContext.Provider value={useBillingState()}>
      {children}
    </BillingContext.Provider>
  );
}
export function useBilling() {
  const context = useContext(BillingContext);
  if (!context) throw new Error("BillingProvider is missing");
  return context;
}
