import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { CreateRoomDtoSchema } from '../dto/room.dto';

const router = Router();

router.post(
  '/',
  authMiddleware,
  validateBody(CreateRoomDtoSchema),
  roomController.createRoom.bind(roomController),
);

router.get('/:pin', roomController.getRoomByPin.bind(roomController));

export default router;
