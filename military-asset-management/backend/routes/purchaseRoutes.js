import { Router } from 'express';
import { listPurchases, createPurchase } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listPurchases);
router.post('/', authorizeRoles('ADMIN','LOGISTICS_OFFICER','BASE_COMMANDER'), createPurchase);
export default router;
