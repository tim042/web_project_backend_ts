import { Router } from 'express';
import * as roomController from '../controllers/roomController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router: Router = Router();

router.post('/', authenticate, authorize(['admin', 'host']), roomController.createRoom);
router.get('/:id', roomController.getRoomById);
router.put('/:id', authenticate, authorize(['admin', 'host']), roomController.updateRoom);
router.patch('/:id', authenticate, authorize(['admin', 'host']), roomController.updatePatchRoom);
router.delete('/:id', authenticate, authorize(['admin', 'host']), roomController.deleteRoom);


export default router;