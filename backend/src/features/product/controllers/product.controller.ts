import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

import { ResponseMessages } from '../../../constants/messages';
import { getFileUrl } from '../../../utils/file-upload.util';
import { sendJsonResponse } from '../../../utils/response.util';
import { ProductService } from '../services/product.service';
import { AddProductPayload, UpdateProductPayload } from '../types/product.types';

export class ProductController {
  private productService: ProductService;

  constructor(service: ProductService) {
    this.productService = service;
  }

  createProduct = async (req: Request<{}, {}, AddProductPayload>, res: Response) => {
    const vendorId = req.userId as string;

    const images: string[] = [];
    if (req.uploadedFileKeys && Array.isArray(req.uploadedFileKeys)) {
      images.push(...req.uploadedFileKeys);
    } else if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(file.filename || file.path);
      });
    }

    const payload: AddProductPayload = {
      ...req.body,
      images,
    };

    const newProduct = await this.productService.createProduct(vendorId, payload);
    return sendJsonResponse(res, newProduct, ResponseMessages.CREATED, 201);
  };

  getProduct = async (req: Request<{ productId: string }>, res: Response) => {
    const vendorId = req.userId as string;
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId, vendorId);

    if (product.images) {
      product.images = product.images.map((url: string) => getFileUrl(url) || url);
    }

    return sendJsonResponse(res, product, ResponseMessages.FETCHED, 200);
  };

  getProducts = async (req: Request, res: Response) => {
    const vendorId = req.userId as string;
    const products = await this.productService.getProductsByVendor(vendorId);

    products.forEach(product => {
      if (product.images) {
        product.images = product.images.map((url: string) => getFileUrl(url) || url);
      }
    });

    return sendJsonResponse(res, products, ResponseMessages.FETCHED, 200);
  };

  updateProduct = async (
    req: Request<{ productId: string }, {}, UpdateProductPayload>,
    res: Response,
  ) => {
    const vendorId = req.userId as string;
    const { productId } = req.params;

    const images: string[] = [];
    if (req.uploadedFileKeys && Array.isArray(req.uploadedFileKeys)) {
      images.push(...req.uploadedFileKeys);
    } else if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: any) => {
        images.push(file.filename || file.path);
      });
    }

    const payload: UpdateProductPayload = {
      ...req.body,
    };
    if (images.length > 0) {
      payload.images = images;
    }

    const updatedProduct = await this.productService.updateProduct(productId, vendorId, payload);
    return sendJsonResponse(res, updatedProduct, ResponseMessages.UPDATED, 200);
  };

  deleteProduct = async (req: Request<{ productId: string }>, res: Response) => {
    const vendorId = req.userId as string;
    const { productId } = req.params;

    await this.productService.deleteProduct(productId, vendorId);
    return sendJsonResponse(res, null, ResponseMessages.DELETED, 200);
  };
}
