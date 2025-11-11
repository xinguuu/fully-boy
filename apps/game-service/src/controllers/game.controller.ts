import { Request, Response, NextFunction } from 'express';
import { gameService } from '../services/game.service';
import { GetTemplatesQuery, CreateGameDto, UpdateGameDto } from '../dto/game.dto';
import { GameType } from '@prisma/client';

export class GameController {
  async getTemplates(
    req: Request<unknown, unknown, unknown, GetTemplatesQuery>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await gameService.getTemplates(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTemplatesByType(
    req: Request<{ gameType: GameType }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { gameType } = req.params;

      if (!Object.values(GameType).includes(gameType)) {
        res.status(400).json({
          statusCode: 400,
          message: 'Invalid game type',
        });
        return;
      }

      const games = await gameService.getTemplatesByType(gameType);
      res.json(games);
    } catch (error) {
      next(error);
    }
  }

  async getMyGames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
        });
        return;
      }

      const games = await gameService.getMyGames(req.user.id);
      res.json(games);
    } catch (error) {
      next(error);
    }
  }

  async createGame(
    req: Request<unknown, unknown, CreateGameDto>,
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

      const game = await gameService.createGame(req.user.id, req.body);
      res.status(201).json(game);
    } catch (error) {
      next(error);
    }
  }

  async updateGame(
    req: Request<{ id: string }, unknown, UpdateGameDto>,
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

      const game = await gameService.updateGame(req.params.id, req.user.id, req.body);
      res.json(game);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Game not found') {
          res.status(404).json({
            statusCode: 404,
            message: error.message,
          });
          return;
        }
        if (error.message === 'Unauthorized to update this game') {
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

  async deleteGame(
    req: Request<{ id: string }>,
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

      await gameService.deleteGame(req.params.id, req.user.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Game not found') {
          res.status(404).json({
            statusCode: 404,
            message: error.message,
          });
          return;
        }
        if (error.message === 'Unauthorized to delete this game') {
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
}

export const gameController = new GameController();
