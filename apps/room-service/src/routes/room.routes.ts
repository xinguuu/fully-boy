import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { asyncHandler } from '../middleware/error.middleware';
import { authMiddleware, optionalAuthenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, asyncHandler(roomController.createRoom.bind(roomController)));

router.get('/:pin', optionalAuthenticateJWT, asyncHandler(roomController.getRoomByPIN.bind(roomController)));

/**
 * DEPRECATED: Participants now join via WebSocket only
 * Endpoint kept for backward compatibility but should not be used
 */
// router.post('/:pin/join', optionalAuthenticateJWT, asyncHandler(roomController.joinRoom.bind(roomController)));

/**
 * DEPRECATED: Participants managed via WebSocket real-time updates
 * Endpoint kept for backward compatibility but should not be used
 */
// router.get('/:pin/participants', optionalAuthenticateJWT, asyncHandler(roomController.getParticipants.bind(roomController)));

/**
 * DEPRECATED: Session validation via WebSocket participantId
 * Endpoint kept for backward compatibility but should not be used
 */
// router.get('/session/:sessionId', asyncHandler(roomController.validateSession.bind(roomController)));

router.delete('/:pin', authMiddleware, asyncHandler(roomController.deleteRoom.bind(roomController)));

export default router;
