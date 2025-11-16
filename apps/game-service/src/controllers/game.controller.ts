import { Request, Response } from 'express';
import { gameService } from '../services/game.service';
import { CreateGameDto, UpdateGameDto } from '../dto/game.dto';
import { UnauthorizedError } from '../middleware/error.middleware';

export class GameController {
  async getMyGames(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const games = await gameService.getMyGames(req.user.id);
    res.status(200).json(games);
  }

  async getGameById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const { id } = req.params;
    const game = await gameService.getGameById(id, req.user.id);
    res.status(200).json(game);
  }

  async createGame(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const game = await gameService.createGame(req.user.id, req.body as CreateGameDto);
    res.status(201).json(game);
  }

  async updateGame(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const game = await gameService.updateGame(req.params.id, req.user.id, req.body as UpdateGameDto);
    res.status(200).json(game);
  }

  async deleteGame(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    await gameService.deleteGame(req.params.id, req.user.id);
    res.status(204).send();
  }

  async addFavorite(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const favorite = await gameService.addFavorite(req.user.id, req.params.id);
    res.status(201).json(favorite);
  }

  async removeFavorite(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    await gameService.removeFavorite(req.user.id, req.params.id);
    res.status(204).send();
  }

  async getFavorites(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const favorites = await gameService.getFavorites(req.user.id);
    res.status(200).json(favorites);
  }

  async getFavoriteIds(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const favoriteIds = await gameService.getFavoriteIds(req.user.id);
    res.status(200).json(favoriteIds);
  }
}

export const gameController = new GameController();
