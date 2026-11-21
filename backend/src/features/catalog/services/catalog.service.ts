import { StatusCodes } from 'http-status-codes';

import { ValidationMessages } from '../../../constants/messages';
import { ApiError } from '../../../utils/api-error.util';
import { CatalogRepository } from '../repositories/catalog.repository';
import {
  CatalogKind,
  CreateCatalogItemInput,
  UpdateCatalogItemInput,
} from '../types/catalog.types';

const notFoundMessage = (kind: CatalogKind) =>
  kind === 'categories'
    ? ValidationMessages.CATEGORY_NOT_FOUND
    : ValidationMessages.BRAND_NOT_FOUND;

export class CatalogService {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async list(kind: CatalogKind, includeInactive = false) {
    return this.catalogRepository.findAll(kind, includeInactive);
  }

  async create(kind: CatalogKind, data: CreateCatalogItemInput) {
    return this.catalogRepository.create(kind, data);
  }

  async update(kind: CatalogKind, id: string, data: UpdateCatalogItemInput) {
    await this.getOrFail(kind, id);
    return this.catalogRepository.update(kind, id, data);
  }

  // Soft delete: products keep their reference, the item disappears from vendor pickers.
  async deactivate(kind: CatalogKind, id: string) {
    await this.getOrFail(kind, id);
    return this.catalogRepository.update(kind, id, { active: false });
  }

  // Used by the product feature to reject unknown or inactive ids.
  async assertActive(kind: CatalogKind, id: string | null | undefined) {
    if (!id) return;
    const item = await this.catalogRepository.findById(kind, id);
    if (!item || !item.active) {
      throw new ApiError(StatusCodes.BAD_REQUEST, notFoundMessage(kind));
    }
  }

  private async getOrFail(kind: CatalogKind, id: string) {
    const item = await this.catalogRepository.findById(kind, id);
    if (!item) throw new ApiError(StatusCodes.NOT_FOUND, notFoundMessage(kind));
    return item;
  }
}
