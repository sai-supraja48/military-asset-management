import { Router } from 'express';
import { getMetrics, getCurrentStock } from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/metrics', getMetrics);
router.get('/stock', getCurrentStock);
export default router;
