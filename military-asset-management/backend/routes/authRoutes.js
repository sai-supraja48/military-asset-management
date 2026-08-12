import { Router } from 'express';
import { login, me, seedDemoUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.post('/login', login);
router.get('/me', authenticateToken, me);
router.post('/seed-demo-users', authenticateToken, authorizeRoles('ADMIN'), seedDemoUsers);
export default router;
