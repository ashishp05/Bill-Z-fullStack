import seed from "./demo.json";
import type { BillingData } from "../services/billing.service";

/** An empty data set, used before sign-in and for customers (who only see invoices). */
export const emptyBillingData = (): BillingData => ({
  profile: {
    businessName: "",
    gstin: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    upiId: "",
    isRegisteredGST: false,
  },
  products: [],
  customers: [],
  invoices: [],
  preferences: { ...seed.preferences, nextNumber: 1, note: "" },
  categories: [],
  brands: [],
});
