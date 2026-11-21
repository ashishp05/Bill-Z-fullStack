import { Router } from 'express';

import adminRoutes from '../features/admin/routes/admin.routes';
import authRoutes from '../features/auth/routes/auth.routes';
import catalogRoutes from '../features/catalog/routes/catalog.routes';
import {
  customerAccountRouter,
  vendorCustomerRouter,
} from '../features/customer/routes/customer.routes';
import {
  customerInvoiceRouter,
  vendorInvoiceRouter,
} from '../features/invoice/routes/invoice.routes';
import productRoutes from '../features/product/routes/product.routes';
import vendorRoutes from '../features/vendor/routes/vendor.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/catalog', catalogRoutes);
router.use('/vendor/products', productRoutes);
router.use('/vendor/customers', vendorCustomerRouter);
router.use('/vendor/invoices', vendorInvoiceRouter);
router.use('/vendor', vendorRoutes);
router.use('/customer/invoices', customerInvoiceRouter);
router.use('/customer', customerAccountRouter);

// Convenience alias so either POST /api/v1/admin/add or POST /api/v1/add/admin works
router.post('/add/admin', (req, res, next) => {
  req.url = '/add';
  adminRoutes(req, res, next);
});

export default router;
