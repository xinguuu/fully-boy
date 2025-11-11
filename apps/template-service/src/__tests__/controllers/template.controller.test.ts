import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { templateController } from '../../controllers/template.controller';
import { templateService } from '../../services/template.service';
import { NotFoundError, ValidationError } from '../../middleware/error.middleware';

vi.mock('../../services/template.service');

describe('TemplateController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      query: {},
      params: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe('getTemplates', () => {
    it('should return templates successfully', async () => {
      const mockResult = {
        templates: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      vi.mocked(templateService.getTemplates).mockResolvedValue(mockResult);

      await templateController.getTemplates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should throw ValidationError for invalid gameType', async () => {
      mockRequest.query = { gameType: 'INVALID_TYPE' };

      await expect(
        templateController.getTemplates(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid category', async () => {
      mockRequest.query = { category: 'INVALID_CATEGORY' };

      await expect(
        templateController.getTemplates(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid limit', async () => {
      mockRequest.query = { limit: '101' };

      await expect(
        templateController.getTemplates(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for negative offset', async () => {
      mockRequest.query = { offset: '-1' };

      await expect(
        templateController.getTemplates(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should accept valid query parameters', async () => {
      mockRequest.query = {
        gameType: 'OX_QUIZ',
        category: 'QUIZ',
        limit: '10',
        offset: '5',
        sortBy: 'playCount',
        order: 'desc',
      };

      const mockResult = {
        templates: [],
        total: 0,
        limit: 10,
        offset: 5,
      };

      vi.mocked(templateService.getTemplates).mockResolvedValue(mockResult);

      await templateController.getTemplates(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(templateService.getTemplates).toHaveBeenCalledWith({
        gameType: 'OX_QUIZ',
        category: 'QUIZ',
        limit: 10,
        offset: 5,
        sortBy: 'playCount',
        order: 'desc',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getTemplateById', () => {
    it('should return template successfully', async () => {
      mockRequest.params = { id: '1' };

      const mockTemplate = {
        id: '1',
        title: 'Test Template',
        questions: [],
      };

      vi.mocked(templateService.getTemplateById).mockResolvedValue(mockTemplate as any);

      await templateController.getTemplateById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockTemplate);
    });

    it('should throw NotFoundError when template not found', async () => {
      mockRequest.params = { id: '999' };

      vi.mocked(templateService.getTemplateById).mockResolvedValue(null);

      await expect(
        templateController.getTemplateById(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid ID', async () => {
      mockRequest.params = {};

      await expect(
        templateController.getTemplateById(
          mockRequest as Request,
          mockResponse as Response
        )
      ).rejects.toThrow(ValidationError);
    });
  });
});
