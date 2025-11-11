import { Router } from 'express';
import { resultController } from '../controllers/result.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/', asyncHandler(resultController.createResult.bind(resultController)));

router.get('/room/:roomId', asyncHandler(resultController.getResultByRoomId.bind(resultController)));

router.get('/game/:gameId', asyncHandler(resultController.getResultsByGameId.bind(resultController)));

export default router;
