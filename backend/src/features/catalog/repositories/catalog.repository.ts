import { PrismaClient } from '@prisma/client';

import {
  CatalogItem,
  CatalogKind,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from '../types/catalog.types';

const catalogSelect = { id: true, name: true, active: true };

export class CatalogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(kind: CatalogKind, includeInactive: boolean): Promise<CatalogItem[]> {
    const args = {
      where: includeInactive ? {} : { active: true },
      orderBy: { name: 'asc' as const },
      select: catalogSelect,
    };
    return kind === 'categories'
      ? this.prisma.category.findMany(args)
      : this.prisma.brand.findMany(args);
  }

  async findById(kind: CatalogKind, id: string): Promise<CatalogItem | null> {
    const args = { where: { id }, select: catalogSelect };
    return kind === 'categories'
      ? this.prisma.category.findUnique(args)
      : this.prisma.brand.findUnique(args);
  }

  async create(kind: CatalogKind, data: CreateCatalogItemInput): Promise<CatalogItem> {
    const args = { data, select: catalogSelect };
    return kind === 'categories'
      ? this.prisma.category.create(args)
      : this.prisma.brand.create(args);
  }

  async update(kind: CatalogKind, id: string, data: UpdateCatalogItemInput): Promise<CatalogItem> {
    const args = { where: { id }, data, select: catalogSelect };
    return kind === 'categories'
      ? this.prisma.category.update(args)
      : this.prisma.brand.update(args);
  }
}
