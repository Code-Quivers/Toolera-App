// cms.routes.ts
import { Router } from 'express';
import {
  getCmsConfig, saveHomepageSections, updateThemeSettings, updateSeoSettings,
  getHeader, updateHeader, getFooter, updateFooter,
  getMenus, updateMenus, getPages, getPage, createPage, updatePage, deletePage,
  getHomepage, saveDraftHomepage, publishHomepage, getHomepageRevisions, restoreHomepageRevision,
} from './cms.controller.js';
import { requireAdmin, optionalAuth } from '../../middlewares/auth.middleware.js';

export const cmsRouter = Router();

// Combined config — optionalAuth so resolveStoreId can use req.user when auth is present
cmsRouter.get('/', optionalAuth, getCmsConfig);
cmsRouter.post('/sections', requireAdmin, saveHomepageSections);
cmsRouter.put('/theme', requireAdmin, updateThemeSettings);
cmsRouter.put('/seo', requireAdmin, updateSeoSettings);

// Header
cmsRouter.get('/header', optionalAuth, getHeader);
cmsRouter.patch('/header', requireAdmin, updateHeader);

// Footer
cmsRouter.get('/footer', optionalAuth, getFooter);
cmsRouter.patch('/footer', requireAdmin, updateFooter);

// Menus / Navigation
cmsRouter.get('/menus', optionalAuth, getMenus);
cmsRouter.put('/menus', requireAdmin, updateMenus);

// Homepage Visual Builder
cmsRouter.get('/homepage', requireAdmin, getHomepage);
cmsRouter.post('/homepage/draft', requireAdmin, saveDraftHomepage);
cmsRouter.post('/homepage/publish', requireAdmin, publishHomepage);
cmsRouter.get('/homepage/revisions', requireAdmin, getHomepageRevisions);
cmsRouter.post('/homepage/revisions/:revisionId/restore', requireAdmin, restoreHomepageRevision);

// Pages
cmsRouter.get('/pages', optionalAuth, getPages);
cmsRouter.post('/pages', requireAdmin, createPage);
cmsRouter.get('/pages/:slug', optionalAuth, getPage);
cmsRouter.patch('/pages/:id', requireAdmin, updatePage);
cmsRouter.delete('/pages/:id', requireAdmin, deletePage);
