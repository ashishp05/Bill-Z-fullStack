import { Prisma, PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { addDays, parseDateOnly, todayDateOnly } from '../../../utils/date.util';
import {
  calculateInvoiceTotals,
  formatInvoiceNumber,
  isInterStateSupply,
} from '../../../utils/invoice-calculator.util';
import { CreateInvoiceInput, InvoiceOwner, InvoiceQueryInput } from '../types/invoice.types';

const withItems = { items: { orderBy: { createdAt: 'asc' as const } } };

export class InvoiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // One transaction: lock and bump the vendor's sequence, price lines from the DB, snapshot parties.
  async createInvoice(vendorId: string, input: CreateInvoiceInput) {
    return this.prisma.$transaction(async tx => {
      const vendor = await tx.vendor.findUniqueOrThrow({ where: { id: vendorId } });

      const customer = await tx.vendorCustomer.findFirst({
        where: { id: input.customerId, vendorId },
      });
      if (!customer) {
        throw new ApiError(StatusCodes.NOT_FOUND, ValidationMessages.CUSTOMER_NOT_FOUND);
      }

      // Merge repeated products into one line.
      const quantities = new Map<string, number>();
      for (const item of input.items) {
        quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
      }
      const productIds = [...quantities.keys()];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, vendorId, active: true },
      });
      if (products.length !== productIds.length) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.PRODUCT_INACTIVE);
      }
      const ordered = productIds.map(id => products.find(product => product.id === id)!);

      // UPDATE ... SET next = next + 1 takes a row lock, so concurrent invoices get distinct numbers.
      await tx.vendorSettings.upsert({
        where: { vendorId },
        create: { vendorId, invoicePrefix: `INV-${new Date().getFullYear()}-` },
        update: {},
      });
      const settings = await tx.vendorSettings.update({
        where: { vendorId },
        data: { nextInvoiceNumber: { increment: 1 } },
      });
      const sequence = settings.nextInvoiceNumber - 1;

      const interState = isInterStateSupply(vendor.state, customer.state);
      const totals = calculateInvoiceTotals(
        ordered.map(product => ({
          unitPrice: product.price,
          quantity: quantities.get(product.id)!,
          gstRate: product.gstRate,
        })),
        input.discount,
        interState,
      );

      const invoiceDate = input.invoiceDate ? parseDateOnly(input.invoiceDate) : todayDateOnly();
      const dueDate = input.dueDate
        ? parseDateOnly(input.dueDate)
        : addDays(invoiceDate, settings.paymentTermsDays);
      if (dueDate < invoiceDate) {
        throw new ApiError(StatusCodes.BAD_REQUEST, ValidationMessages.INVOICE_DUE_BEFORE_DATE);
      }

      return tx.invoice.create({
        data: {
          invoiceNumber: formatInvoiceNumber(settings.invoicePrefix, sequence),
          vendorId,
          vendorCustomerId: customer.id,
          customerId: customer.customerId,
          invoiceDate,
          dueDate,
          interState,
          subtotal: totals.subtotal,
          discount: totals.discount,
          cgst: totals.cgst,
          sgst: totals.sgst,
          igst: totals.igst,
          totalTax: totals.totalTax,
          totalAmount: totals.totalAmount,
          notes: input.notes === undefined ? settings.invoiceNote : input.notes,
          vendorBusinessName:
            vendor.businessName || `${vendor.firstName} ${vendor.lastName}`.trim() || vendor.email,
          vendorGstin: vendor.gstin,
          vendorEmail: vendor.email,
          vendorPhone: vendor.phoneNumber,
          vendorAddress: vendor.address,
          vendorCity: vendor.city,
          vendorState: vendor.state,
          vendorPincode: vendor.pincode,
          vendorUpiId: vendor.upiId,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerGstin: customer.gstin,
          customerAddress: customer.address,
          customerCity: customer.city,
          customerState: customer.state,
          customerPincode: customer.pincode,
          items: {
            create: ordered.map((product, index) => ({
              productId: product.id,
              name: product.name,
              sku: product.sku,
              hsn: product.hsn,
              unit: product.unit,
              quantity: quantities.get(product.id)!,
              unitPrice: product.price,
              gstRate: product.gstRate,
              ...totals.lines[index],
            })),
          },
        },
        include: withItems,
      });
    });
  }

  async findMany(owner: InvoiceOwner, query: InvoiceQueryInput) {
    const { status, search, customerId, from, to, limit, skip } = query;
    const conditions: Prisma.InvoiceWhereInput[] = [owner];

    if (status === 'OVERDUE') {
      conditions.push({ status: 'PENDING', dueDate: { lt: todayDateOnly() } });
    } else if (status) {
      conditions.push({ status });
    }
    if (customerId) conditions.push({ vendorCustomerId: customerId });
    if (from) conditions.push({ invoiceDate: { gte: parseDateOnly(from) } });
    if (to) conditions.push({ invoiceDate: { lte: parseDateOnly(to) } });
    if (search) {
      conditions.push({
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { vendorBusinessName: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.InvoiceWhereInput = { AND: conditions };
    const [total, records] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        orderBy: [{ invoiceDate: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip,
        include: withItems,
      }),
    ]);
    return { total, records };
  }

  async findOne(owner: InvoiceOwner, id: string) {
    return this.prisma.invoice.findFirst({ where: { id, ...owner }, include: withItems });
  }

  // Only payment fields are ever updated on an invoice.
  async updatePayment(
    vendorId: string,
    id: string,
    data: { status: 'PENDING' | 'PAID'; paymentMode: string | null; paidAt: Date | null },
  ) {
    return this.prisma.invoice.update({
      where: { id, vendorId },
      data,
      include: withItems,
    });
  }

  async markViewed(customerId: string, id: string) {
    await this.prisma.invoice.updateMany({
      where: { id, customerId, viewedAt: null },
      data: { viewedAt: new Date() },
    });
  }

  async getVendorSummary(vendorId: string, since: Date) {
    const today = todayDateOnly();
    const [byStatus, overdue, recentSales, customerCount, productCount] = await Promise.all([
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: { vendorId },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      this.prisma.invoice.aggregate({
        where: { vendorId, status: 'PENDING', dueDate: { lt: today } },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      this.prisma.invoice.findMany({
        where: { vendorId, invoiceDate: { gte: since } },
        select: { invoiceDate: true, totalAmount: true },
      }),
      this.prisma.vendorCustomer.count({ where: { vendorId } }),
      this.prisma.product.count({ where: { vendorId } }),
    ]);
    return { byStatus, overdue, recentSales, customerCount, productCount };
  }
}
