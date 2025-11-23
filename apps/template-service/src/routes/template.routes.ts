import { Router } from 'express';
import { templateController } from '../controllers/template.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { optionalAuthenticateJWT } from '@xingu/shared/middleware';

const router = Router();

router.get('/', optionalAuthenticateJWT, asyncHandler(templateController.getTemplates.bind(templateController)));

router.get('/:id', asyncHandler(templateController.getTemplateById.bind(templateController)));

export default router;
