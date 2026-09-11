---
name: Luminous Commerce
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a72'
  outline-variant: '#bccac0'
  surface-tint: '#006c4a'
  primary: '#006948'
  on-primary: '#ffffff'
  primary-container: '#00855c'
  on-primary-container: '#f5fff7'
  inverse-primary: '#66dca8'
  secondary: '#545f73'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f8'
  on-secondary-container: '#586377'
  tertiary: '#535f58'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7770'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#83f9c3'
  primary-fixed-dim: '#66dca8'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#005137'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d9e6dd'
  tertiary-fixed-dim: '#bdcac1'
  on-tertiary-fixed: '#131e19'
  on-tertiary-fixed-variant: '#3e4943'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-base: '#ffffff'
  surface-subtle: '#f8fafc'
  border-light: '#e2e8f0'
  success-teal: '#0e9b6d'
  trust-blue: '#0369a1'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  section-padding: 120px
  section-padding-mobile: 64px
---

## Brand & Style

The design system is engineered for a high-trust SaaS environment that bridges the gap between sophisticated enterprise software and local accessibility. The brand personality is **reliable, empowering, and organized**, specifically tailored for the Bangladeshi merchant ecosystem. 

The aesthetic is **Modern Corporate**, leaning heavily on a clean, airy layout with generous whitespace to reduce cognitive load. We utilize high-quality isometric illustrations to represent complex technical features like inventory syncing and POS hardware in a friendly, tangible way. The interface should feel "light as air" but "stable as stone," favoring clarity and precision over decorative flourishes.

## Colors

This design system centers on a vibrant "Growth Teal" (#0e9b6d) as the primary brand anchor, symbolizing prosperity and operational efficiency. 

- **Primary:** Used for main actions, active states, and brand-defining illustrations.
- **Secondary:** A deep slate used for typography and high-contrast UI elements to ensure readability and an "enterprise" feel.
- **Tertiary:** A very soft mint-tinted white used for section backgrounds and soft card containers.
- **Neutral:** A range of cool grays that handle borders, secondary text, and icons without competing with the primary teal.

The color mode is strictly **light** to maintain an approachable, professional merchant atmosphere.

## Typography

The typography strategy uses a dual-font approach to balance personality with utility. 

**Montserrat** is used for all headlines and display text. Its geometric structure provides a confident, modern, and high-tech feel that resonates with SaaS growth. 

**Inter** is used for all body copy, UI labels, and data-heavy components. It was chosen for its exceptional legibility at small sizes, ensuring that POS data and inventory lists are easy for merchants to read at a glance. Headlines use slightly tighter letter spacing for a more "locked-in" professional look, while labels use increased tracking for better scannability.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (1280px max-width) to maintain a controlled, professional presentation. We utilize a 12-column grid with 24px gutters.

- **Vertical Rhythm:** A strict 8px base unit drives all spacing.
- **Sectioning:** Large vertical gaps (120px) are used between major features to create a "premium" feel and prevent information density from overwhelming the user.
- **Mobile Adaptivity:** On mobile, margins reduce to 16px, and section padding scales down to 64px. Multi-column feature grids reflow to a single-column stack.

## Elevation & Depth

This design system avoids heavy shadows, instead using **Tonal Layers** and **Low-contrast Outlines** to create hierarchy.

- **Surfaces:** Use `#ffffff` for primary interactive cards and `#f8fafc` for background containers.
- **Borders:** Elements are defined by 1px solid borders in `#e2e8f0`. This creates a structured, "dashboard-like" appearance that implies stability.
- **Soft Lift:** A single, very soft ambient shadow (0px 4px 20px rgba(0,0,0,0.05)) is reserved exclusively for the primary CTA button and the "active" card in a feature list.

## Shapes

The shape language is consistently **Rounded** (8px/0.5rem base) to provide a friendly, accessible feel that softens the "enterprise" edge of the software. 

- **Standard Elements:** Buttons, input fields, and small cards use the 8px radius.
- **Large Containers:** Pricing cards and featured content blocks use `rounded-lg` (16px).
- **Interactive Icons:** Small utility icons and tags utilize a full pill-shape to distinguish them from structural elements.

## Components

### Buttons
- **Primary:** Solid Teal (#0e9b6d) with white text. 8px border radius. No gradient, but uses a subtle 10% darken on hover.
- **Secondary:** Outline Teal with 1px border.
- **Ghost:** Slate gray text for low-priority actions.

### Input Fields
- White background with a 1px slate-200 border. Labels in Inter Semi-bold. Placeholder text in a light gray. Focus state triggers a 1px teal border and a 3px soft teal outer glow.

### Feature Cards
- Used to showcase POS and Inventory modules. These feature a white background, a 1px border, and top-aligned isometric illustrations. Headlines are Montserrat Semi-bold 20px.

### Status Chips
- Small, pill-shaped badges for "New" features or "Active" statuses. Use low-saturation background tints (e.g., light mint background with dark teal text).

### Dashboard Previews
- To build trust, component styling should include "miniature" versions of the POS interface, featuring simplified list items with subtle dividers and rounded-corner imagery.