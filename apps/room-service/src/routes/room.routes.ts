import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

router.post('/', asyncHandler(roomController.createRoom.bind(roomController)));

router.get('/:pin', asyncHandler(roomController.getRoomByPIN.bind(roomController)));

router.post('/:pin/join', asyncHandler(roomController.joinRoom.bind(roomController)));

router.get('/:pin/participants', asyncHandler(roomController.getParticipants.bind(roomController)));

router.delete('/:pin', asyncHandler(roomController.deleteRoom.bind(roomController)));

export default router;
