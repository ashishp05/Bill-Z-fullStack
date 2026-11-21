import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { AuthRoles } from '../../../constants/config.constants';
import { checkUserRole } from '../../../middleware/auth.middleware';
import { uploadFor } from '../../../middleware/upload.middleware';
import { validateRequest } from '../../../middleware/validation.middleware';
import { ProductController } from '../controllers/product.controller';
import { addProductSchema, updateProductSchema } from '../schemas/product.schema';
import { ProductService } from '../services/product.service';

const prismaService = PrismaService.getInstance();
const prisma = prismaService.client;
const service = new ProductService(prisma);
const controller = new ProductController(service);

const router = Router();

const productImagesUpload = uploadFor('vendors/products', {
  maxSize: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
});

router.use(checkUserRole([AuthRoles.VENDOR]));

router.post(
  '/',
  productImagesUpload.array('images', 5),
  validateRequest(addProductSchema),
  controller.createProduct,
);

router.get('/', controller.getProducts);

router.get('/:productId', controller.getProduct);

router.put(
  '/:productId',
  productImagesUpload.array('images', 5),
  validateRequest(updateProductSchema),
  controller.updateProduct,
);

router.delete('/:productId', controller.deleteProduct);

export default router;
