import { Prisma, PrismaClient } from '@prisma/client';

import {
  CreateVendorCustomerInput,
  UpdateCustomerProfileInput,
  UpdateVendorCustomerInput,
  VendorCustomerQueryInput,
} from '../types/customer.types';

export const customerProfileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  active: true,
  createdAt: true,
} satisfies Prisma.CustomerSelect;

export const vendorCustomerSelect = {
  id: true,
  customerId: true,
  name: true,
  email: true,
  phone: true,
  gstin: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorCustomerSelect;

export class CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Global identity (used for login)

  async findByEmail(email: string) {
    return this.prisma.customer.findUnique({ where: { email }, select: customerProfileSelect });
  }

  async findById(id: string) {
    return this.prisma.customer.findUnique({ where: { id }, select: customerProfileSelect });
  }

  async findByPhone(phone: string) {
    return this.prisma.customer.findMany({
      where: { phone },
      select: customerProfileSelect,
      take: 2,
    });
  }

  async updateProfile(id: string, data: UpdateCustomerProfileInput) {
    return this.prisma.customer.update({ where: { id }, data, select: customerProfileSelect });
  }

  // Vendor-owned records. Every query is scoped by vendorId.

  async findVendorCustomers(vendorId: string, query: VendorCustomerQueryInput) {
    const { search, limit, skip } = query;
    const where: Prisma.VendorCustomerWhereInput = {
      vendorId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, records] = await Promise.all([
      this.prisma.vendorCustomer.count({ where }),
      this.prisma.vendorCustomer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
        select: vendorCustomerSelect,
      }),
    ]);
    return { total, records };
  }

  async findVendorCustomer(vendorId: string, id: string) {
    return this.prisma.vendorCustomer.findFirst({
      where: { id, vendorId },
      select: vendorCustomerSelect,
    });
  }

  // Links the vendor to the global customer for this email, creating the identity if new.
  async createVendorCustomer(vendorId: string, data: CreateVendorCustomerInput) {
    return this.prisma.$transaction(async tx => {
      const customer = await tx.customer.upsert({
        where: { email: data.email },
        create: { email: data.email, name: data.name, phone: data.phone },
        update: {},
      });
      const existing = await tx.vendorCustomer.findUnique({
        where: { vendorId_customerId: { vendorId, customerId: customer.id } },
        select: { id: true },
      });
      if (existing) return null;

      return tx.vendorCustomer.create({
        data: { ...data, vendorId, customerId: customer.id },
        select: vendorCustomerSelect,
      });
    });
  }

  // A changed email re-points the record to that email's global identity.
  async updateVendorCustomer(vendorId: string, id: string, data: UpdateVendorCustomerInput) {
    return this.prisma.$transaction(async tx => {
      let customerId: string | undefined;
      if (data.email) {
        const customer = await tx.customer.upsert({
          where: { email: data.email },
          create: { email: data.email, name: data.name ?? data.email, phone: data.phone },
          update: {},
        });
        const clash = await tx.vendorCustomer.findFirst({
          where: { vendorId, customerId: customer.id, NOT: { id } },
          select: { id: true },
        });
        if (clash) return null;
        customerId = customer.id;
      }

      return tx.vendorCustomer.update({
        where: { id, vendorId },
        data: { ...data, ...(customerId ? { customerId } : {}) },
        select: vendorCustomerSelect,
      });
    });
  }
}
