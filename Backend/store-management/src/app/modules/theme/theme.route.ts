import { Router } from 'express';
import { themeController } from './theme.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

export const themeRoutes = Router();
export const adminThemeRoutes = Router();

// ── Public / Seller Routes ──────────────────────────────────────────────
// List all published themes (accessible by storefront, onboarding, and seller dashboard)
themeRoutes.get('/', themeController.getPublishedThemes);

// Apply a published theme to the seller's active store
themeRoutes.post('/apply', authenticate, themeController.applyThemeToStore);

// ── Super Admin Routes ──────────────────────────────────────────────────
// Full theme management for Super Admin dashboard
adminThemeRoutes.get('/', authenticate, themeController.getAllThemes);
adminThemeRoutes.get('/:id', authenticate, themeController.getThemeById);
adminThemeRoutes.post('/', authenticate, themeController.createTheme);
adminThemeRoutes.patch('/:id', authenticate, themeController.updateTheme);
adminThemeRoutes.delete('/:id', authenticate, themeController.deleteTheme);
