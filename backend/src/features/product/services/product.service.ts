import { PrismaClient } from '@prisma/client';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { ProductRepository } from '../repositories/product.repository';
import { AddProductPayload, UpdateProductPayload } from '../types/product.types';

export class ProductService {
  private repository: ProductRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new ProductRepository(prisma);
  }

  async createProduct(vendorId: string, payload: AddProductPayload) {
    return this.repository.createProduct(vendorId, payload);
  }

  async getProduct(productId: string, vendorId: string) {
    const product = await this.repository.getProductById(productId);
    if (!product) {
      throw new ApiError(404, ValidationMessages.PRODUCT_NOT_FOUND);
    }
    if (product.vendorId !== vendorId) {
      throw new ApiError(403, ValidationMessages.NOT_ALLOWED);
    }
    return product;
  }

  async getProductsByVendor(vendorId: string) {
    return this.repository.getAllProductsByVendor(vendorId);
  }

  async updateProduct(productId: string, vendorId: string, payload: UpdateProductPayload) {
    const product = await this.repository.getProductById(productId);
    if (!product) {
      throw new ApiError(404, ValidationMessages.PRODUCT_NOT_FOUND);
    }
    if (product.vendorId !== vendorId) {
      throw new ApiError(403, ValidationMessages.NOT_ALLOWED);
    }
    return this.repository.updateProduct(productId, payload);
  }

  async deleteProduct(productId: string, vendorId: string) {
    const product = await this.repository.getProductById(productId);
    if (!product) {
      throw new ApiError(404, ValidationMessages.PRODUCT_NOT_FOUND);
    }
    if (product.vendorId !== vendorId) {
      throw new ApiError(403, ValidationMessages.NOT_ALLOWED);
    }
    await this.repository.deleteProduct(productId);
    return true;
  }
}
