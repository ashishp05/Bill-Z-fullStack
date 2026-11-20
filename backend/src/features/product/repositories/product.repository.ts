import { PrismaClient } from '@prisma/client';

import { AddProductPayload, UpdateProductPayload } from '../types/product.types';

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async createProduct(vendorId: string, payload: AddProductPayload) {
    const { images, ...productData } = payload;
    return this.prisma.product.create({
      data: {
        ...productData,
        vendorId,
        images: images && images.length > 0 ? images : [],
      },
    });
  }

  async getProductById(productId: string) {
    return this.prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async getAllProductsByVendor(vendorId: string) {
    return this.prisma.product.findMany({
      where: { vendorId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateProduct(productId: string, payload: UpdateProductPayload) {
    const { images, ...productData } = payload;
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...productData,
        ...(images && images.length > 0 ? { images } : {}),
      },
    });
  }

  async deleteProduct(productId: string) {
    return this.prisma.product.delete({
      where: { id: productId },
    });
  }
}
