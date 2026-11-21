export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  category?: string;
  brand?: string;
  unit?: string;
  description?: string;
  imageUrl?: string;
  detailImageUrl?: string;
  pickerImageUrl?: string;
  hsn?: string;
  quantity?: number;
  unlimitedStock?: boolean;
  active: boolean;
  gstRate: number; // e.g. 0, 5, 12, 18, 28
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  gstin?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface InvoiceLineItem {
  id: string;
  productId?: string;
  name: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // e.g. 18
  lineTotal: number;
}

/** Stored statuses are PENDING and PAID. OVERDUE is derived for display (pending and past due). */
export type InvoicePaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export interface InvoiceTimelineEvent {
  step: number;
  title: string;
  description: string;
  date?: string;
  completed: boolean;
  current?: boolean;
  iconType: 'sent' | 'viewed' | 'pending' | 'received';
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorEmail?: string;
  vendorGstin?: string;
  vendorState?: string;
  customer: CustomerItem;
  items: InvoiceLineItem[];
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  discount: number;
  totalAmount: number;
  status: InvoicePaymentStatus;
  paymentMode?: string;
  paidAt?: string;
  viewedAt?: string;
  timeline: InvoiceTimelineEvent[];
  notes?: string;
}

export interface VendorBusinessProfile {
  businessName: string;
  gstin: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  upiId?: string;
  isRegisteredGST: boolean;
}
