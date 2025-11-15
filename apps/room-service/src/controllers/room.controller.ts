import { Request, Response } from 'express';
import { roomService } from '../services/room.service';
import { UnauthorizedError, ValidationError } from '../middleware/error.middleware';
import type { CreateRoomDto, JoinRoomDto } from '../types/room.types';

export class RoomController {
  async createRoom(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const dto: CreateRoomDto = {
      ...req.body,
      organizerId: req.user.id,
    };

    const room = await roomService.createRoom(dto);
    res.status(201).json(room);
  }

  async getRoomByPIN(req: Request, res: Response): Promise<void> {
    const { pin } = req.params;

    if (!pin || pin.length !== 6) {
      throw new ValidationError('Invalid PIN format');
    }

    const room = await roomService.getRoomByPIN(pin);
    res.status(200).json(room);
  }

  async joinRoom(req: Request, res: Response): Promise<void> {
    const { pin } = req.params;
    const dto: JoinRoomDto = req.body;

    if (!pin || pin.length !== 6) {
      throw new ValidationError('Invalid PIN format');
    }

    if (!dto.nickname || !dto.deviceId) {
      throw new ValidationError('Nickname and deviceId are required');
    }

    const participant = await roomService.joinRoom(pin, dto);
    res.status(200).json(participant);
  }

  async getParticipants(req: Request, res: Response): Promise<void> {
    const { pin } = req.params;

    if (!pin || pin.length !== 6) {
      throw new ValidationError('Invalid PIN format');
    }

    const participants = await roomService.getParticipants(pin);
    res.status(200).json(participants);
  }

  async deleteRoom(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const { pin } = req.params;

    if (!pin || pin.length !== 6) {
      throw new ValidationError('Invalid PIN format');
    }

    await roomService.deleteRoom(pin, req.user.id);
    res.status(204).send();
  }

  async validateSession(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    if (!sessionId) {
      throw new ValidationError('Session ID is required');
    }

    const session = await roomService.getSession(sessionId);

    if (!session) {
      res.status(200).json({ isValid: false, session: null });
      return;
    }

    res.status(200).json({ isValid: true, session });
  }
}

export const roomController = new RoomController();
