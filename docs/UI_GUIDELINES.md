# UI Guidelines

This document defines the design system and frontend standards used throughout Pokémon Companion.

Every page, component, and feature should follow these guidelines to ensure a consistent, accessible, scalable, maintainable, and high-performance user experience.

---

# Design Philosophy

Pokémon Companion follows five core design principles.

## Consistency

Similar interactions should always behave the same across the application.

## Clarity

Information should be understandable at a glance.

## Scalability

Components should support future Pokémon generations without requiring redesigns.

## Accessibility

Every trainer should be able to comfortably use the application regardless of device or ability.

## Performance

Interfaces should remain smooth and responsive even when displaying large datasets.

---

# General Principles

Every page should be:

- Clean
- Modern
- Responsive
- Mobile-first
- Accessible
- Fast
- Modular
- Data-driven
- Reusable
- Minimal

Avoid unnecessary visual clutter.

---

# Layout Structure

Every page should follow the same overall layout.

```text
Navigation

Page Header

Main Content

Content Sections

Footer
```

Every page should include:

- Page Title
- Optional Description
- Breadcrumbs (where appropriate)
- Loading State
- Empty State
- Error State
- Responsive Layout

---

# Layout Components

Use shared layout components whenever possible.

Examples:

- Container
- Section
- Grid
- Flex
- Sidebar
- Split Layout
- Stack Layout
- Card Grid

Avoid page-specific layouts unless necessary.

---

# Design Tokens

All design values must come from CSS variables.

Never hardcode:

- Colors
- Font Sizes
- Spacing
- Border Radius
- Shadows
- Transitions

---

# Color System

All colors must be defined inside `global.css`.

## Brand

- Primary
- Primary Hover
- Primary Active

---

## Secondary

- Secondary
- Secondary Hover

---

## Surface

- Background
- Surface
- Elevated Surface
- Card Surface

---

## Text

- Primary
- Secondary
- Muted
- Disabled

---

## Status

- Success
- Warning
- Error
- Info

---

## Pokémon Type Colors

Global variables should exist for every Pokémon type.

Examples:

- Normal
- Fire
- Water
- Electric
- Grass
- Ice
- Fighting
- Poison
- Ground
- Flying
- Psychic
- Bug
- Rock
- Ghost
- Dragon
- Dark
- Steel
- Fairy

Never redefine type colors inside page stylesheets.

---

# Typography

Use the shared typography scale.

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

Maintain readable line lengths and spacing across all screen sizes.

---

# Spacing

Only use the shared spacing scale.

```text
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

Avoid arbitrary spacing values.

---

# Border Radius

Use shared variables.

- Small
- Medium
- Large
- Extra Large
- Pill

---

# Shadows

Use shared elevation tokens.

- Small
- Medium
- Large

Avoid creating custom shadows.

---

# Buttons

Use shared button components.

Variants:

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

Buttons should maintain consistent sizing throughout the application.

---

# Forms

All forms should maintain a consistent appearance.

Supported controls:

- Labels
- Inputs
- Search
- Select
- Textarea
- Checkbox
- Radio
- Toggle
- Date Picker

Validation states:

- Success
- Warning
- Error

Provide clear validation feedback.

---

# Cards

Cards are the primary content container.

Every card should include:

- Consistent Padding
- Border Radius
- Elevation
- Responsive Layout
- Hover Feedback (when appropriate)

Avoid page-specific card implementations.

---

# Navigation

Navigation components include:

- Top Navigation
- Sidebar
- Mobile Navigation
- Breadcrumbs
- Pagination
- Tabs

Navigation should clearly indicate the current location.

---

# Icons

Icons should:

- Use one consistent icon set
- Align with surrounding text
- Improve usability
- Include accessible labels

Avoid decorative icons that add no value.

---

# Shared Components

Shared UI components include:

- Buttons
- Cards
- Chips
- Badges
- Tags
- Progress Bars
- Tooltips
- Dropdowns
- Accordions
- Tabs
- Tables
- Pagination
- Search Bars
- Modals
- Dialogs
- Toast Notifications
- Skeleton Loaders
- Empty States
- Loading Indicators

Always reuse shared components before creating new ones.

---

# Pokémon Components

The application should provide reusable Pokémon-specific components.

Examples:

- Pokémon Card
- Move Card
- Ability Card
- Type Badge
- Stat Bar
- Evolution Card
- Team Slot
- Collection Card
- Region Card
- Progress Card

These should be shared across the application.

---

# Data Presentation

Database-driven pages should display information consistently.

Examples:

- Pokémon Lists
- Move Lists
- Ability Lists
- Search Results
- Tables
- Statistics
- Charts

Every data view should support:

- Loading
- Empty
- Error
- Success

---

# Animations

Animations should improve usability rather than distract.

Recommended:

- Fade
- Slide
- Scale
- Hover Lift
- Collapse
- Expand
- Progress Fill
- Skeleton Loading

Avoid:

- Flashing
- Excessive Bounce
- Long Delays
- Distracting Motion

Respect the user's reduced-motion preference.

---

# Responsive Design

Supported breakpoints:

- Mobile
- Tablet
- Laptop
- Desktop
- Large Desktop

Layouts should adapt without horizontal scrolling.

---

# Accessibility

Every page should:

- Support Keyboard Navigation
- Use Semantic HTML
- Maintain WCAG-compliant Color Contrast
- Provide Visible Focus States
- Include Accessible Labels
- Include Alt Text
- Support Screen Readers

Accessibility is a requirement—not an enhancement.

---

# CSS Architecture

Stylesheets follow a layered architecture.

```
global.css
    ↓
shared.css
    ↓
component.css
    ↓
page.css
```

Responsibilities:

- **global.css** — Reset, variables, typography, spacing
- **shared.css** — Layouts, utilities, shared components
- **component.css** — Reusable UI components
- **page.css** — Page-specific styling only

---

# JavaScript Guidelines

- Keep page logic inside dedicated JavaScript files.
- Keep reusable functions inside shared utilities.
- Avoid inline JavaScript.
- Prefer modular functions.
- Use event delegation where appropriate.
- Minimize global variables.
- Keep DOM manipulation centralized.

---

# Naming Conventions

Use semantic, descriptive class names.

Good:

```text
pokemon-card
team-grid
dashboard-header
progress-card
search-bar
ability-badge
move-list
```

Avoid appearance-based names.

Bad:

```text
red-box
blue-button
left-panel
big-card
```

---

# Performance

Frontend code should prioritize performance.

Recommendations:

- Lazy-load images
- Optimize assets
- Reduce layout shifts
- Avoid unnecessary DOM updates
- Reuse components
- Minimize JavaScript execution
- Cache frequently used data where appropriate

---

# Quality Checklist

Before completing any page, verify:

- Responsive layout
- Shared components reused
- Consistent spacing
- Consistent typography
- Accessible markup
- Semantic HTML
- Optimized assets
- No duplicate CSS
- No console errors
- Loading state implemented
- Empty state implemented
- Error state implemented
- Keyboard navigation works
- Dark mode compatibility (future)