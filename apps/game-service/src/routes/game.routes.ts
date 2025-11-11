import { Router } from 'express';
import { gameController } from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody, validateQuery } from '../middleware/validation.middleware';
import {
  GetTemplatesQuerySchema,
  CreateGameDtoSchema,
  UpdateGameDtoSchema,
} from '../dto/game.dto';

const router = Router();

router.get(
  '/templates',
  validateQuery(GetTemplatesQuerySchema),
  gameController.getTemplates.bind(gameController),
);

router.get('/templates/:gameType', gameController.getTemplatesByType.bind(gameController));

router.get('/my-games', authMiddleware, gameController.getMyGames.bind(gameController));

router.post(
  '/',
  authMiddleware,
  validateBody(CreateGameDtoSchema),
  gameController.createGame.bind(gameController),
);

router.put(
  '/:id',
  authMiddleware,
  validateBody(UpdateGameDtoSchema),
  gameController.updateGame.bind(gameController),
);

router.delete('/:id', authMiddleware, gameController.deleteGame.bind(gameController));

export default router;
