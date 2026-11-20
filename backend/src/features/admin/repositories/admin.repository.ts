import { PrismaClient } from '@prisma/client';

import { AdminRegisterInput, AdminUpdateProfileInput } from '../types/admin.types';

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByIdWithPassword(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
    });
  }

  async create(data: AdminRegisterInput & { password: string }) {
    return this.prisma.admin.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.prisma.admin.update({
      where: { id },
      data: { password: passwordHash },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: AdminUpdateProfileInput & { image?: string }) {
    return this.prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
