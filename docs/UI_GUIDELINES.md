# UI Guidelines

This document defines the design system used throughout Pokémon Companion. Every page should follow these guidelines to ensure a consistent user experience.

---

# Design Principles

- Clean and modern
- Mobile-first
- Responsive
- Accessible
- Fast
- Consistent
- Reusable components
- Minimal visual clutter

---

# Page Structure

Every page should follow the same structure.

```
Navbar

Main Content

Page Header

Content Sections

Footer
```

Each page should include:

- Page title
- Optional page description
- Breadcrumbs (where appropriate)
- Responsive layout
- Consistent spacing

---

# Color Palette

All colors must use CSS variables defined in `global.css`.

Do **not** hardcode colors.

## Primary

- Primary
- Primary Hover
- Primary Active

## Secondary

- Secondary
- Secondary Hover

## Surface

- Background
- Surface
- Elevated Surface

## Text

- Primary Text
- Secondary Text
- Muted Text

## Status Colors

- Success
- Warning
- Error
- Info

---

# Typography

Use the global typography scale.

## Headings

- H1
- H2
- H3
- H4
- H5

## Body

- Large
- Default
- Small
- Caption

Text should be easy to read on all screen sizes.

---

# Spacing

Use the global spacing scale.

```
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
```

Avoid arbitrary spacing values.

---

# Border Radius

Use only the predefined radius variables.

- Small
- Medium
- Large
- Extra Large

---

# Shadows

Use predefined shadow variables.

- Small
- Medium
- Large

Avoid creating custom shadows for individual pages.

---

# Buttons

All buttons should use shared button components.

Types:

- Primary
- Secondary
- Outline
- Ghost
- Icon
- Danger

States:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

---

# Forms

All forms should maintain a consistent appearance.

Elements:

- Labels
- Inputs
- Selects
- Textareas
- Checkboxes
- Radio Buttons
- Toggles

Validation:

- Success
- Warning
- Error

---

# Cards

Use shared card components.

Cards should include:

- Consistent padding
- Border radius
- Elevation
- Hover effect
- Responsive layout

---

# Navigation

Navigation should remain consistent across all pages.

Includes:

- Navbar
- Mobile Navigation
- Breadcrumbs
- Pagination
- Tabs

---

# Icons

Icons should be:

- Consistent style
- Properly aligned
- Accessible
- Used only when they improve usability

---

# Components

Reusable components include:

- Buttons
- Cards
- Chips
- Badges
- Tags
- Progress Bars
- Tooltips
- Modals
- Dropdowns
- Accordions
- Tabs
- Tables
- Empty States
- Loading Indicators
- Skeleton Loaders

Avoid creating duplicate versions of existing components.

---

# Animations

Animations should be subtle and improve usability.

Allowed:

- Fade In
- Fade Out
- Hover Lift
- Scale
- Slide
- Progress Fill
- Loading Spinner
- Smooth Collapse

Avoid:

- Flashing animations
- Excessive bouncing
- Distracting motion

Respect reduced-motion accessibility preferences where possible.

---

# Responsive Design

Breakpoints:

- Mobile
- Tablet
- Laptop
- Desktop
- Large Desktop

Layouts should adapt gracefully without horizontal scrolling.

---

# Accessibility

Every page should:

- Support keyboard navigation
- Use semantic HTML
- Maintain sufficient color contrast
- Include visible focus states
- Provide descriptive labels for form controls
- Include alt text for meaningful images

---

# CSS Architecture

Stylesheets should follow this responsibility split:

- `global.css` — Reset, variables, typography, spacing, colors
- `shared.css` — Reusable components and utilities
- Page CSS — Page-specific layout and styling only

Page styles should never redefine shared components unless customization is required.

---

# JavaScript Guidelines

- Keep page logic in its own JavaScript file.
- Place shared utilities in `shared.js`.
- Avoid inline JavaScript.
- Use event delegation where appropriate.
- Keep functions modular and reusable.

---

# Naming Conventions

Use descriptive, semantic class names.

Examples:

```
dashboard-header
pokemon-card
team-grid
search-bar
progress-card
```

Avoid names tied only to appearance such as:

```
red-box
left-panel
big-button
```

---

# Quality Checklist

Before completing a page, verify:

- Responsive on all supported screen sizes
- Consistent spacing
- Reuses shared components
- No duplicate CSS
- Accessible markup
- Clean HTML structure
- Optimized assets
- No console errors