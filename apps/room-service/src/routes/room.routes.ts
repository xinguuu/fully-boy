import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware, optionalAuthenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, asyncHandler(roomController.createRoom.bind(roomController)));

router.get('/:pin', optionalAuthenticateJWT, asyncHandler(roomController.getRoomByPIN.bind(roomController)));

router.post('/:pin/join', optionalAuthenticateJWT, asyncHandler(roomController.joinRoom.bind(roomController)));

router.get('/:pin/participants', optionalAuthenticateJWT, asyncHandler(roomController.getParticipants.bind(roomController)));

router.delete('/:pin', authMiddleware, asyncHandler(roomController.deleteRoom.bind(roomController)));

export default router;
