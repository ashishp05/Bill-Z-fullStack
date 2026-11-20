import { Router } from 'express';

import adminRoutes from '../features/admin/routes/admin.routes';
import productRoutes from '../features/product/routes/product.routes';
import vendorRoutes from '../features/vendor/routes/vendor.routes';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/vendor', vendorRoutes);
router.use('/vendor/products', productRoutes);

// Convenience alias so either POST /api/v1/admin/add or POST /api/v1/add/admin works
router.post('/add/admin', (req, res, next) => {
  req.url = '/add';
  adminRoutes(req, res, next);
});

export default router;
