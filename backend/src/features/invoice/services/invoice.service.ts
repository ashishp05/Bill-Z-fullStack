import { StatusCodes } from 'http-status-codes';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { addDays, formatDateOnly, todayDateOnly } from '../../../utils/date.util';
import { InvoiceRepository } from '../repositories/invoice.repository';
import {
  CreateInvoiceInput,
  InvoiceOwner,
  InvoiceQueryInput,
  InvoiceWithItems,
  UpdatePaymentInput,
} from '../types/invoice.types';

const SUMMARY_DAYS = 7;

// API shape for an invoice. Party details come from the immutable snapshot, not live records.
export const toInvoiceDto = (invoice: InvoiceWithItems) => ({
  id: invoice.id,
  invoiceNumber: invoice.invoiceNumber,
  vendorId: invoice.vendorId,
  vendor: {
    businessName: invoice.vendorBusinessName,
    gstin: invoice.vendorGstin,
    email: invoice.vendorEmail,
    phone: invoice.vendorPhone,
    address: invoice.vendorAddress,
    city: invoice.vendorCity,
    state: invoice.vendorState,
    pincode: invoice.vendorPincode,
    upiId: invoice.vendorUpiId,
  },
  customer: {
    id: invoice.vendorCustomerId,
    name: invoice.customerName,
    email: invoice.customerEmail,
    phone: invoice.customerPhone,
    gstin: invoice.customerGstin,
    address: invoice.customerAddress,
    city: invoice.customerCity,
    state: invoice.customerState,
    pincode: invoice.customerPincode,
  },
  items: invoice.items.map(item => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    sku: item.sku,
    hsn: item.hsn,
    unit: item.unit,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    gstRate: item.gstRate,
    lineTotal: item.lineTotal,
    discountShare: item.discountShare,
    taxableAmount: item.taxableAmount,
    taxAmount: item.taxAmount,
  })),
  invoiceDate: formatDateOnly(invoice.invoiceDate),
  dueDate: formatDateOnly(invoice.dueDate),
  interState: invoice.interState,
  subtotal: invoice.subtotal,
  discount: invoice.discount,
  cgst: invoice.cgst,
  sgst: invoice.sgst,
  igst: invoice.igst,
  totalTax: invoice.totalTax,
  totalAmount: invoice.totalAmount,
  status: invoice.status,
  isOverdue: invoice.status === 'PENDING' && invoice.dueDate < todayDateOnly(),
  paymentMode: invoice.paymentMode,
  paidAt: invoice.paidAt,
  viewedAt: invoice.viewedAt,
  notes: invoice.notes,
  createdAt: invoice.createdAt,
});

export class InvoiceService {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async create(vendorId: string, input: CreateInvoiceInput) {
    const invoice = await this.invoiceRepository.createInvoice(vendorId, input);
    return toInvoiceDto(invoice);
  }

  async list(owner: InvoiceOwner, query: InvoiceQueryInput) {
    const { total, records } = await this.invoiceRepository.findMany(owner, query);
    return { total, records: records.map(toInvoiceDto) };
  }

  async getForVendor(vendorId: string, id: string) {
    return toInvoiceDto(await this.getOrFail({ vendorId }, id));
  }

  // The first time the customer opens an invoice is recorded for the vendor's timeline.
  async getForCustomer(customerId: string, id: string) {
    await this.getOrFail({ customerId }, id);
    await this.invoiceRepository.markViewed(customerId, id);
    return toInvoiceDto(await this.getOrFail({ customerId }, id));
  }

  async updatePayment(vendorId: string, id: string, input: UpdatePaymentInput) {
    await this.getOrFail({ vendorId }, id);
    const isPaid = input.status === 'PAID';
    const invoice = await this.invoiceRepository.updatePayment(vendorId, id, {
      status: input.status,
      paymentMode: isPaid ? (input.paymentMode ?? null) : null,
      paidAt: isPaid ? new Date() : null,
    });
    return toInvoiceDto(invoice);
  }

  async getVendorSummary(vendorId: string) {
    const today = todayDateOnly();
    const since = addDays(today, -(SUMMARY_DAYS - 1));
    const { byStatus, overdue, recentSales, customerCount, productCount } =
      await this.invoiceRepository.getVendorSummary(vendorId, since);

    const statusTotals = (status: 'PENDING' | 'PAID') => {
      const row = byStatus.find(entry => entry.status === status);
      return { count: row?._count._all ?? 0, amount: row?._sum.totalAmount ?? 0 };
    };
    const paid = statusTotals('PAID');
    const pending = statusTotals('PENDING');

    const dailySales = Array.from({ length: SUMMARY_DAYS }, (_, index) => {
      const date = formatDateOnly(addDays(since, index));
      const amount = recentSales
        .filter(sale => formatDateOnly(sale.invoiceDate) === date)
        .reduce((sum, sale) => sum + sale.totalAmount, 0);
      return { date, amount };
    });

    return {
      totalInvoices: paid.count + pending.count,
      totalBilled: paid.amount + pending.amount,
      paid,
      pending,
      overdue: { count: overdue._count._all, amount: overdue._sum.totalAmount ?? 0 },
      customerCount,
      productCount,
      dailySales,
    };
  }

  private async getOrFail(owner: InvoiceOwner, id: string) {
    const invoice = await this.invoiceRepository.findOne(owner, id);
    if (!invoice) throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.INVOICE_NOT_FOUND);
    return invoice;
  }
}
