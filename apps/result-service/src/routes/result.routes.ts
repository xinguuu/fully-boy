import { Router } from 'express';
import { resultController } from '../controllers/result.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware, optionalAuthenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, asyncHandler(resultController.createResult.bind(resultController)));

router.get('/room/:roomId', optionalAuthenticateJWT, asyncHandler(resultController.getResultByRoomId.bind(resultController)));

router.get('/game/:gameId', authMiddleware, asyncHandler(resultController.getResultsByGameId.bind(resultController)));

export default router;
