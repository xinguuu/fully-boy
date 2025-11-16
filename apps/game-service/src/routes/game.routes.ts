import { Router } from 'express';
import { gameController } from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import {
  CreateGameDtoSchema,
  UpdateGameDtoSchema,
} from '../dto/game.dto';

const router = Router();

router.get('/my-games', authMiddleware, asyncHandler(gameController.getMyGames.bind(gameController)));

router.get('/favorites', authMiddleware, asyncHandler(gameController.getFavorites.bind(gameController)));
router.get('/favorites/ids', authMiddleware, asyncHandler(gameController.getFavoriteIds.bind(gameController)));

router.get('/:id', authMiddleware, asyncHandler(gameController.getGameById.bind(gameController)));

router.post(
  '/',
  authMiddleware,
  validateBody(CreateGameDtoSchema),
  asyncHandler(gameController.createGame.bind(gameController)),
);

router.post('/:id/favorite', authMiddleware, asyncHandler(gameController.addFavorite.bind(gameController)));

router.put(
  '/:id',
  authMiddleware,
  validateBody(UpdateGameDtoSchema),
  asyncHandler(gameController.updateGame.bind(gameController)),
);

router.delete('/:id', authMiddleware, asyncHandler(gameController.deleteGame.bind(gameController)));
router.delete('/:id/favorite', authMiddleware, asyncHandler(gameController.removeFavorite.bind(gameController)));

export default router;
