import { Prisma, PrismaClient } from '@prisma/client';

import {
  VendorQueryFilterInput,
  VendorRegisterInput,
  VendorUpdateProfileInput,
} from '../types/vendor.types';

export class VendorRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.vendor.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        phoneCountry: true,
        phoneNumber: true,
        profilePicture: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: VendorRegisterInput & { password: string }) {
    return this.prisma.vendor.create({
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        phoneCountry: true,
        phoneNumber: true,
        profilePicture: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: VendorUpdateProfileInput) {
    return this.prisma.vendor.update({
      where: { id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        phoneCountry: true,
        phoneNumber: true,
        profilePicture: true,
        updatedAt: true,
      },
    });
  }

  async updateProfilePicture(id: string, profilePicture: string) {
    return this.prisma.vendor.update({
      where: { id },
      data: { profilePicture },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        phoneCountry: true,
        phoneNumber: true,
        profilePicture: true,
        updatedAt: true,
      },
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          businessName: true,
          phoneCountry: true,
          phoneNumber: true,
          profilePicture: true,
          active: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return { total, records };
  }

  async updateStatus(id: string, active: boolean) {
    return this.prisma.vendor.update({
      where: { id },
      data: { active },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        businessName: true,
        phoneCountry: true,
        phoneNumber: true,
        profilePicture: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
