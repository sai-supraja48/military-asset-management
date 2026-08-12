import { Router } from 'express';
import { getBases, getEquipmentTypes } from '../controllers/lookupController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();
router.use(authenticateToken);
router.get('/bases', getBases);
router.get('/equipment-types', getEquipmentTypes);
export default router;
