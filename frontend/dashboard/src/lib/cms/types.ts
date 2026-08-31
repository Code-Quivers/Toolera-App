import { z } from "zod";

export type SectionCategory = "FEATURED" | "PRODUCTS" | "CONTENT" | "MARKETING" | "SOCIAL_PROOF";

export interface SectionDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> {
  type: string;
  name: string;
  category: SectionCategory;
  description: string;
  iconName: string;
  defaultSettings: z.infer<TSchema>;
  schema: TSchema;
}

export interface CMSSectionItem<TSettings = any> {
  id: string;
  type: string;
  position: number;
  enabled: boolean;
  settings: TSettings;
}

export interface CMSPageRevision {
  id: string;
  pageId: string;
  version: number;
  title: string;
  sectionsSnapshot: CMSSectionItem[];
  themeLayout?: HomepageThemeLayout;
  themeSnapshot?: ThemeSettingsState;
  isPublished: boolean;
  publishedAt?: string | null;
  createdBy: string;
  notes?: string | null;
  createdAt: string;
}

export interface CMSAuditLog {
  id: string;
  userId?: string;
  userName: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: any;
  timestamp: string;
}

export type HomepageThemeLayout =
  | "ORIGINAL_RAIFAS_MART"
  | "ELECTRONICS_MARKETPLACE"
  | "MODERN_TECH_GADGETS"
  | "SUPERMARKET_MEGA_STORE"
  | "BEAUTY_COSMETICS"
  | "MINIMALIST_FURNITURE"
  | "FASHION_LIFESTYLE";

export interface ThemeSettingsState {
  homepageLayout: HomepageThemeLayout;
  primary: string;
  accent: string;
  primaryButtonText?: string;
  accentButtonText?: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  radius: string;
  shadow: string;
  containerWidth: string;
  sectionSpacing: string;
}
