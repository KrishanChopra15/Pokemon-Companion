# ADR-012 — Feature-Oriented Generated Database

## Status

Approved

---

# Purpose

Define how the Generated Database is organized within Pokémon Companion.

This decision establishes that generated datasets are organized around application features rather than mirroring the structure of the Canonical Database.

---

# Context

The Canonical Database organizes Pokémon knowledge according to reusable entities and relationships.

However, application features such as the Pokédex, Team Builder, Search, Adventure Tracker, AI Assistant, and World Explorer require data that combines information from multiple canonical domains.

Generating datasets that simply mirror canonical entities would still require significant runtime processing by the backend or frontend.

A different organization was therefore required for the Generated Database.

---

# Decision

The Generated Database shall be organized around application features.

Each major feature receives one or more optimized datasets containing the information required by that feature.

Generated datasets may combine information from multiple canonical entities and relationships, provided they do not redefine or replace authoritative Pokémon knowledge.

All generated datasets shall be reproducible from the Canonical Database and Relationship Datasets.

---

# Rationale

Organizing generated data around application features minimizes runtime transformation while keeping the Canonical Database independent of presentation concerns.

Each feature receives data that closely matches its own requirements, allowing the backend and frontend to load complete view models instead of reconstructing them dynamically.

This approach improves performance, simplifies application code, and allows new features to introduce specialized generated datasets without affecting the canonical knowledge graph.

---

# Consequences

## Benefits

- Minimizes runtime data transformation.
- Improves frontend and backend performance.
- Simplifies feature implementation.
- Keeps application concerns separate from canonical knowledge.
- Supports future features without redesigning canonical data.
- Allows generated datasets to evolve independently.

### Trade-offs

- Additional generated datasets increase build output.
- More generator scripts are required to produce feature-specific datasets.
- Changes to canonical data may affect multiple generated features.

### Long-Term Impact

The Generated Database becomes an application layer built upon the canonical knowledge graph.

Future features should introduce new generated datasets instead of extending canonical entities with presentation-specific information.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- DATASETS.md
- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md

---

# Related Decisions

- ADR-001 — Database Optimized for Consumption
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-016 — Page-Oriented Generated Profiles
- ADR-028 — Layered Generator Dependencies

---

# Date Approved

2026