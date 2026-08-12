import { Router } from 'express';
import { listExpenditures, createExpenditure } from '../controllers/expenditureController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listExpenditures);
router.post('/', authorizeRoles('ADMIN','BASE_COMMANDER'), createExpenditure);
export default router;
