import { Router } from 'express';

import { PrismaService } from '../../../config/prisma.config';
import { auth, checkUserRole } from '../../../middleware/auth.middleware';
import { validateQuery, validateRequest } from '../../../middleware/validation.middleware';
import { AdminRoles } from '../../admin/types/admin.types';
import { CatalogController } from '../controllers/catalog.controller';
import { CatalogRepository } from '../repositories/catalog.repository';
import {
  catalogQuerySchema,
  createCatalogItemSchema,
  updateCatalogItemSchema,
} from '../schemas/catalog.schema';
import { CatalogService } from '../services/catalog.service';
import { CatalogKind } from '../types/catalog.types';

const prisma = PrismaService.getInstance().client;
const catalogService = new CatalogService(new CatalogRepository(prisma));

const adminOnly = checkUserRole([AdminRoles.SUPER_ADMIN, AdminRoles.ADMIN]);

// Any signed-in user can read the global lists; only admins manage them.
const buildCatalogRouter = (kind: CatalogKind) => {
  const controller = new CatalogController(catalogService, kind);
  const router = Router();

  router.get('/', auth, validateQuery(catalogQuerySchema), controller.getAll);

  router.post('/', adminOnly, validateRequest(createCatalogItemSchema), controller.create);

  router.put('/:id', adminOnly, validateRequest(updateCatalogItemSchema), controller.update);

  router.delete('/:id', adminOnly, controller.delete);

  return router;
};

const router = Router();

router.use('/categories', buildCatalogRouter('categories'));
router.use('/brands', buildCatalogRouter('brands'));

export default router;
