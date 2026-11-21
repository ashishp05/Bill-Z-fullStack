import { Prisma, PrismaClient } from '@prisma/client';

import {
  VendorQueryFilterInput,
  VendorRegisterInput,
  VendorSettingsInput,
  VendorUpdateProfileInput,
} from '../types/vendor.types';

// Profile fields returned to clients. Never includes the password hash.
export const vendorProfileSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  businessName: true,
  businessType: true,
  gstin: true,
  isRegisteredGST: true,
  phoneCountry: true,
  phoneNumber: true,
  address: true,
  city: true,
  state: true,
  pincode: true,
  upiId: true,
  profilePicture: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VendorSelect;

const defaultInvoicePrefix = () => `INV-${new Date().getFullYear()}-`;

export class VendorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByPhone(phoneNumber: string) {
    return this.prisma.vendor.findMany({
      where: { phoneNumber },
      select: vendorProfileSelect,
      take: 2,
    });
  }

  // Creates a vendor from a verified email (OTP registration) together with default settings.
  async createFromVerifiedEmail(email: string) {
    return this.prisma.vendor.create({
      data: {
        email,
        settings: { create: { invoicePrefix: defaultInvoicePrefix() } },
      },
      select: vendorProfileSelect,
    });
  }

  // Settings rows are created lazily for vendors that predate them.
  async getOrCreateSettings(vendorId: string) {
    return this.prisma.vendorSettings.upsert({
      where: { vendorId },
      create: { vendorId, invoicePrefix: defaultInvoicePrefix() },
      update: {},
    });
  }

  async updateSettings(vendorId: string, data: VendorSettingsInput) {
    return this.prisma.vendorSettings.update({
      where: { vendorId },
      data,
    });
  }

  async findHighestInvoiceSequence(vendorId: string, prefix: string) {
    const latest = await this.prisma.invoice.findFirst({
      where: { vendorId, invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });
    const sequence = latest ? Number(latest.invoiceNumber.slice(prefix.length)) : 0;
    return Number.isFinite(sequence) ? sequence : 0;
  }

  async findByEmail(email: string) {
    return this.prisma.vendor.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      select: vendorProfileSelect,
    });
  }

  async create(data: VendorRegisterInput & { password: string }) {
    return this.prisma.vendor.create({
      data,
      select: vendorProfileSelect,
    });
  }

  async update(id: string, data: VendorUpdateProfileInput) {
    return this.prisma.vendor.update({
      where: { id },
      data,
      select: vendorProfileSelect,
    });
  }

  async updateProfilePicture(id: string, profilePicture: string) {
    return this.prisma.vendor.update({
      where: { id },
      data: { profilePicture },
      select: vendorProfileSelect,
    });
  }

  async findAllVendors(filter: Partial<VendorQueryFilterInput> = {}) {
    const {
      limit = 10,
      skip = 0,
      searchTerm,
      name,
      email,
      sortKey = 'createdAt',
      sortOrder = 'desc',
      needCount = false,
      active,
    } = filter;

    const conditions: Prisma.VendorWhereInput[] = [];

    if (active !== undefined) {
      conditions.push({ active });
    }

    if (name) {
      conditions.push({
        OR: [
          { firstName: { contains: name, mode: 'insensitive' } },
          { lastName: { contains: name, mode: 'insensitive' } },
          { businessName: { contains: name, mode: 'insensitive' } },
        ],
      });
    }

    if (email) {
      conditions.push({
        email: { contains: email, mode: 'insensitive' },
      });
    }

    if (searchTerm) {
      conditions.push({
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { businessName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.VendorWhereInput = conditions.length > 0 ? { AND: conditions } : {};

    const [total, records] = await Promise.all([
      needCount ? this.prisma.vendor.count({ where }) : Promise.resolve(undefined),
      this.prisma.vendor.findMany({
        where,
        take: limit > 0 ? limit : undefined,
        skip: skip > 0 ? skip : undefined,
        orderBy: {
          [sortKey]: sortOrder,
        },
        select: vendorProfileSelect,
      }),
    ]);

    return { total, records };
  }

  async updateStatus(id: string, active: boolean) {
    return this.prisma.vendor.update({
      where: { id },
      data: { active },
      select: vendorProfileSelect,
    });
  }
}
