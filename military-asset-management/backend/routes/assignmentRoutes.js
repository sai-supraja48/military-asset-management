import { Router } from 'express';
import { listAssignments, createAssignment } from '../controllers/assignmentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();
router.use(authenticateToken, enforceBaseScope);
router.get('/', listAssignments);
router.post('/', authorizeRoles('ADMIN','BASE_COMMANDER'), createAssignment);
export default router;
