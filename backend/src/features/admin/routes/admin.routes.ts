import { Router } from 'express';

import adminAuthRoutes from './admin-auth.routes';
import adminVendorRoutes from './admin-vendor.routes';

const router = Router();

// Admin Sub-Module Route Mounting
router.use('/', adminAuthRoutes);
router.use('/vendors', adminVendorRoutes);

export default router;
