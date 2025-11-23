import type { Request, Response } from 'express';
import { templateService } from '../services/template.service';
import { NotFoundError, ValidationError } from '../middleware/error.middleware';
import type { TemplateListQuery } from '../types/template.types';
import { GameType, Category, TemplateCategory } from '@prisma/client';

export class TemplateController {
  async getTemplates(req: Request, res: Response): Promise<void> {
    const {
      gameType,
      category,
      gameCategory,
      limit,
      offset,
      sortBy,
      order,
    } = req.query;

    if (gameType && !Object.values(GameType).includes(gameType as GameType)) {
      throw new ValidationError('Invalid gameType parameter');
    }

    if (category && !Object.values(Category).includes(category as Category)) {
      throw new ValidationError('Invalid category parameter');
    }

    if (gameCategory && !Object.values(TemplateCategory).includes(gameCategory as TemplateCategory)) {
      throw new ValidationError('Invalid gameCategory parameter');
    }

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    if (offset && (isNaN(Number(offset)) || Number(offset) < 0)) {
      throw new ValidationError('Offset must be a non-negative number');
    }

    const query: TemplateListQuery = {
      ...(gameType && { gameType: gameType as GameType }),
      ...(category && { category: category as Category }),
      ...(gameCategory && { gameCategory: gameCategory as TemplateCategory }),
      ...(limit && { limit: Number(limit) }),
      ...(offset && { offset: Number(offset) }),
      ...(sortBy && { sortBy: sortBy as 'playCount' | 'favoriteCount' | 'createdAt' }),
      ...(order && { order: order as 'asc' | 'desc' }),
    };

    const userId = req.user?.id;
    const result = await templateService.getTemplates(query, userId);

    res.status(200).json(result);
  }

  async getTemplateById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid template ID');
    }

    const template = await templateService.getTemplateById(id);

    if (!template) {
      throw new NotFoundError('Template not found');
    }

    res.status(200).json(template);
  }
}

export const templateController = new TemplateController();
