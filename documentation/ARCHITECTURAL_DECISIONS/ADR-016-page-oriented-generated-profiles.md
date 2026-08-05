# ADR-016 — Page-Oriented Generated Profiles

## Status

Approved

---

# Purpose

Define how the Generated Database should expose information to the frontend.

This decision establishes that generated datasets should provide complete, page-oriented view models that closely mirror the application's user experience while remaining derived from the canonical knowledge graph.

---

# Context

The Canonical Database is optimized for correctness, normalization, and reusable relationships.

Frontend applications, however, require complete profiles that can be rendered efficiently without repeatedly traversing the knowledge graph or performing expensive runtime transformations.

Generating page-oriented datasets reduces backend complexity, improves application performance, and creates a simpler development model for frontend features.

---

# Decision

The Generated Database shall provide complete, page-oriented view models that mirror the application's interface.

Each profile shall be generated as a cohesive dataset containing all information required to render the corresponding application page.

Profiles are loaded once, while the frontend progressively reveals information through expandable sections driven by the shared Active Context.

Generated profiles remain derived representations and never become the authoritative source of Pokémon knowledge.

---

# Rationale

Page-oriented datasets minimize runtime processing by shifting complex graph traversal into the generation pipeline.

This allows frontend components to focus on presentation rather than data assembly while preserving a clear separation between canonical knowledge and user experience.

The Active Context ensures that a single generated profile can dynamically adapt to different games, versions, or historical contexts without requiring multiple independent page models.

---

# Consequences

## Benefits

- Minimizes runtime data transformation.
- Reduces frontend complexity.
- Improves page loading performance.
- Produces predictable application data models.
- Keeps canonical knowledge separate from presentation.

### Trade-offs

- Generated datasets are larger than normalized canonical datasets.
- Any canonical changes require regeneration of affected profiles.

### Long-Term Impact

Future profile pages can be introduced using the same generation strategy, ensuring a consistent architecture across Pokémon, Moves, Trainers, Games, Locations, and future knowledge domains.

---

# Related Documentation

- DATASETS.md
- DATABASE_SCHEMA.md
- BACKEND_ARCHITECTURE.md
- UI_GUIDELINES.md

---

# Related Decisions

- ADR-001 — Database Optimized for Consumption
- ADR-010 — Knowledge Graph and Active Context
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-012 — Feature-Oriented Generated Database

---

# Date Approved

2026