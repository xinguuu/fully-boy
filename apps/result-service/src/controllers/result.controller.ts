import { Request, Response } from 'express';
import { resultService } from '../services/result.service';
import { ValidationError } from '../middleware/error.middleware';
import type { CreateResultDto } from '../types/result.types';

export class ResultController {
  async createResult(req: Request, res: Response): Promise<void> {
    const dto: CreateResultDto = req.body;

    if (!dto.roomId || !dto.participantCount || !dto.leaderboard || !dto.questionStats) {
      throw new ValidationError('Missing required fields');
    }

    const result = await resultService.createResult(dto);
    res.status(201).json(result);
  }

  async getResultByRoomId(req: Request, res: Response): Promise<void> {
    const { roomId } = req.params;

    if (!roomId) {
      throw new ValidationError('Room ID is required');
    }

    const result = await resultService.getResultByRoomId(roomId);
    res.status(200).json(result);
  }

  async getResultsByGameId(req: Request, res: Response): Promise<void> {
    const { gameId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    if (!gameId) {
      throw new ValidationError('Game ID is required');
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    const { results, total } = await resultService.getResultsByGameId(gameId, limit);
    res.status(200).json({
      results,
      total,
    });
  }
}

export const resultController = new ResultController();
