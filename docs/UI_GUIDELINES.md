# UI Guidelines

This document defines the design system and frontend standards used throughout Pokémon Companion.

Every page, component, and feature should follow these guidelines to ensure a consistent, accessible, scalable, and maintainable user experience.

---

# Design Philosophy

Pokémon Companion follows five core design principles:

- **Consistency** — Similar interactions should always behave the same.
- **Clarity** — Information should be easy to understand at a glance.
- **Scalability** — Components should support future expansion.
- **Accessibility** — Every trainer should be able to use the application comfortably.
- **Performance** — Interfaces should remain fast and responsive.

---

# Design Principles

Every page should be:

- Clean
- Modern
- Mobile-first
- Responsive
- Accessible
- Fast
- Modular
- Data-driven
- Reusable
- Minimal

Avoid unnecessary visual clutter.

---

# Page Structure

Every page should follow a consistent layout.

```
Navbar

Page Header

Main Content

Content Sections

Footer
```

Each page should include:

- Page title
- Optional description
- Breadcrumbs (where appropriate)
- Responsive layout
- Consistent spacing
- Loading state
- Empty state
- Error state

---

# Layout Guidelines

Pages should use reusable layout containers.

Examples:

- Container
- Section
- Grid
- Flex layouts
- Sidebar layouts
- Split layouts

Avoid custom layouts unless necessary.

---

# Color System

All colors must use CSS variables defined in `global.css`.

Never hardcode colors.

## Brand Colors

- Primary
- Primary Hover
- Primary Active

---

## Secondary Colors

- Secondary
- Secondary Hover

---

## Surface Colors

- Background
- Surface
- Elevated Surface

---

## Text Colors

- Primary
- Secondary
- Muted

---

## Status Colors

- Success
- Warning
- Error
- Info

---

## Pokémon Type Colors

Type colors should be defined globally and reused throughout the application.

Examples:

- Fire
- Water
- Grass
- Electric
- Psychic
- Dragon
- Ghost
- Steel

Avoid redefining type colors on individual pages.

---

# Typography

Use the global typography scale.

## Headings

- H1
- H2
- H3
- H4
- H5

---

## Body

- Large
- Default
- Small
- Caption

Typography should remain readable across all supported screen sizes.

---

# Spacing

Use only the global spacing scale.

```
4
8
12
16
20
24
32
40
48
64
80
96
```

Never use arbitrary spacing values unless absolutely necessary.

---

# Border Radius

Use predefined radius variables.

- Small
- Medium
- Large
- Extra Large
- Pill (where appropriate)

---

# Shadows

Use shared shadow variables.

- Small
- Medium
- Large

Avoid creating custom shadows for individual pages.

---

# Buttons

All buttons should use shared button components.

Supported button styles:

- Primary
- Secondary
- Outline
- Ghost
- Icon
- Danger

Supported states:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading

---

# Forms

All forms should maintain a consistent appearance.

Supported controls:

- Labels
- Inputs
- Selects
- Textareas
- Checkboxes
- Radio Buttons
- Toggles
- Search Inputs

Validation states:

- Success
- Warning
- Error

Forms should provide clear validation feedback.

---

# Cards

Cards are one of the primary UI building blocks.

Every card should provide:

- Consistent padding
- Border radius
- Elevation
- Responsive layout
- Hover feedback (where appropriate)

Avoid creating page-specific card styles when shared components are sufficient.

---

# Navigation

Navigation should remain consistent across the application.

Components include:

- Navbar
- Mobile Navigation
- Sidebar
- Breadcrumbs
- Pagination
- Tabs

Navigation should clearly indicate the current page.

---

# Icons

Icons should:

- Use a consistent style
- Be visually aligned
- Improve usability
- Include accessible labels when necessary

Avoid decorative icons that do not provide value.

---

# Components

Shared components include:

- Buttons
- Cards
- Chips
- Badges
- Tags
- Progress Bars
- Tooltips
- Modals
- Dialogs
- Dropdowns
- Accordions
- Tabs
- Tables
- Empty States
- Loading Indicators
- Skeleton Loaders
- Toast Notifications

Always reuse existing components before creating new ones.

---

# Data Presentation

Database-driven pages should display information consistently.

Examples:

- Pokémon Cards
- Move Cards
- Ability Cards
- Search Results
- Lists
- Tables
- Statistics

Every data view should support:

- Loading
- Empty
- Error
- Success

---

# Animations

Animations should improve usability rather than distract from it.

Allowed:

- Fade
- Slide
- Scale
- Hover Lift
- Collapse
- Expand
- Progress Fill
- Loading Spinner

Avoid:

- Flashing
- Excessive bouncing
- Long delays
- Distracting motion

Respect the user's reduced-motion accessibility preferences.

---

# Responsive Design

Supported breakpoints:

- Mobile
- Tablet
- Laptop
- Desktop
- Large Desktop

Layouts should adapt without horizontal scrolling.

Content should remain readable at every breakpoint.

---

# Accessibility

Every page should:

- Support keyboard navigation
- Use semantic HTML
- Maintain sufficient color contrast
- Provide visible focus indicators
- Include descriptive labels
- Include alt text where appropriate
- Support screen readers where practical

Accessibility should never be treated as an optional enhancement.

---

# CSS Architecture

Stylesheets follow a shared responsibility model.

- `global.css` — Reset, variables, typography, spacing, colors
- `shared.css` — Shared components, layouts, and utilities
- Page CSS — Page-specific layout and styling only

Page styles should never redefine shared components unless customization is required.

---

# JavaScript Guidelines

- Keep page logic inside dedicated JavaScript files.
- Place reusable utilities inside `shared.js`.
- Avoid inline JavaScript.
- Prefer modular functions.
- Use event delegation where appropriate.
- Minimize global variables.

---

# Naming Conventions

Use semantic, descriptive class names.

Good examples:

```
pokemon-card
team-grid
dashboard-header
progress-card
search-bar
ability-badge
move-list
```

Avoid names based only on appearance.

Bad examples:

```
red-box
left-panel
blue-button
big-card
```

---

# Performance Guidelines

Frontend code should prioritize performance.

Recommendations:

- Lazy-load large assets
- Optimize images
- Minimize layout shifts
- Avoid unnecessary DOM updates
- Reuse components whenever possible

---

# Quality Checklist

Before completing any page, verify:

- Responsive across supported screen sizes
- Consistent spacing
- Shared components reused
- No duplicate CSS
- Accessible markup
- Clean HTML structure
- Optimized assets
- No console errors
- Proper loading state
- Proper empty state
- Proper error state