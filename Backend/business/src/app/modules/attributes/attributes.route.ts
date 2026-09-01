import { Router } from 'express';
import {
  getAttributes, createAttribute, updateAttribute, deleteAttribute,
  createAttributeValue, updateAttributeValue, deleteAttributeValue,
} from './attributes.controller.js';
import { requireAdmin } from '../../middlewares/auth.middleware.js';

export const attributesRouter = Router();

attributesRouter.get('/', getAttributes);
attributesRouter.post('/', requireAdmin, createAttribute);
attributesRouter.patch('/:id', requireAdmin, updateAttribute);
attributesRouter.delete('/:id', requireAdmin, deleteAttribute);

// Attribute values
attributesRouter.post('/:attributeId/values', requireAdmin, createAttributeValue);
attributesRouter.patch('/:attributeId/values/:valueId', requireAdmin, updateAttributeValue);
attributesRouter.delete('/:attributeId/values/:valueId', requireAdmin, deleteAttributeValue);
