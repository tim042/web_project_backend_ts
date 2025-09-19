import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router: Router = Router();

// Property routes
router.post('/', authenticate, authorize(['admin', 'host']), propertyController.createProperty);
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.put('/:id', authenticate, authorize(['admin', 'host']), propertyController.updateProperty);
router.delete('/:id', authenticate, authorize(['admin', 'host']), propertyController.deleteProperty);
router.patch('/:id', authenticate, authorize(['admin', 'host']), propertyController.updatePropertyPath);

export default router;