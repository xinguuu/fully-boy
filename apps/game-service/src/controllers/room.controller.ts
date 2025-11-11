import { Request, Response, NextFunction } from 'express';
import { roomService } from '../services/room.service';
import { CreateRoomDto } from '../dto/room.dto';

export class RoomController {
  async createRoom(
    req: Request<unknown, unknown, CreateRoomDto>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
        });
        return;
      }

      const room = await roomService.createRoom(req.user.id, req.body);
      res.status(201).json(room);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Game not found') {
          res.status(404).json({
            statusCode: 404,
            message: error.message,
          });
          return;
        }
        if (error.message === 'Cannot create room for private game') {
          res.status(403).json({
            statusCode: 403,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }

  async getRoomByPin(
    req: Request<{ pin: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const room = await roomService.getRoomByPin(req.params.pin);
      res.json(room);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Room not found' || error.message === 'Room has expired') {
          res.status(404).json({
            statusCode: 404,
            message: error.message,
          });
          return;
        }
      }
      next(error);
    }
  }
}

export const roomController = new RoomController();
