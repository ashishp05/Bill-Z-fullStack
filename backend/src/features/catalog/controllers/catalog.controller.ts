import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseMessages } from '../../../constants/messages';
import { sendJsonResponse } from '../../../utils/response.util';
import { CatalogService } from '../services/catalog.service';
import {
  CatalogKind,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from '../types/catalog.types';

// One controller per catalog kind, so routes stay declarative.
export class CatalogController {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly kind: CatalogKind,
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { includeInactive } = req.query as { includeInactive?: boolean };
    const items = await this.catalogService.list(this.kind, includeInactive);
    sendJsonResponse(res, items, ResponseMessages.FETCHED, StatusCodes.OK);
  };

  create = async (req: Request<{}, {}, CreateCatalogItemInput>, res: Response): Promise<void> => {
    const item = await this.catalogService.create(this.kind, req.body);
    sendJsonResponse(res, item, ResponseMessages.CREATED, StatusCodes.CREATED);
  };

  update = async (
    req: Request<{ id: string }, {}, UpdateCatalogItemInput>,
    res: Response,
  ): Promise<void> => {
    const item = await this.catalogService.update(this.kind, req.params.id, req.body);
    sendJsonResponse(res, item, ResponseMessages.UPDATED, StatusCodes.OK);
  };

  delete = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
    const item = await this.catalogService.deactivate(this.kind, req.params.id);
    sendJsonResponse(res, item, ResponseMessages.DELETED, StatusCodes.OK);
  };
}
