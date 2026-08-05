# ADR-003 — Database Layer Organization

## Status

Approved

---

# Purpose

Define how each database layer within Pokémon Companion is organized.

This decision establishes that every architectural layer is structured according to its own responsibility rather than following a single organizational model throughout the entire data pipeline.

---

# Context

Pokémon Companion consists of multiple database layers, each serving a distinct purpose.

During architectural design, a single organizational strategy for every layer was considered. While superficially consistent, this approach would force some layers into structures that did not match their responsibilities.

For example, extracted game data is naturally organized by its source, canonical knowledge is organized around enduring Pokémon concepts, and generated datasets are organized according to the application features they support.

A more flexible organizational principle was therefore required.

---

# Decision

Each database layer shall be organized according to its own architectural responsibility.

The primary organizational strategies are:

- **Raw Database** — Organized by source, then by game, then by domain.
- **Canonical Database** — Organized by domain.
- **Generated Database** — Organized by purpose and application feature.

Each layer is responsible for presenting information in the structure most appropriate to its role within the overall data pipeline.

---

# Rationale

Different stages of the data pipeline solve fundamentally different problems.

The Raw Database preserves the structure of official game data and therefore benefits from an organization that reflects its origins.

The Canonical Database represents enduring Pokémon knowledge and is therefore best organized around stable domains such as Pokémon, Moves, Species, and Items.

The Generated Database exists solely to optimize application features and is therefore organized around the experiences it provides rather than the concepts it stores.

Allowing each layer to adopt the organization best suited to its responsibility improves clarity, maintainability, and scalability while avoiding artificial constraints.

---

# Consequences

## Benefits

- Allows each database layer to optimize its own organization.
- Improves maintainability by matching structure to responsibility.
- Simplifies navigation for developers.
- Supports future expansion without restructuring existing layers.
- Reinforces the separation of concerns established by the data pipeline.

### Trade-offs

- Different layers use different organizational strategies.
- Contributors must understand the purpose of each layer before navigating the project.

### Long-Term Impact

This decision establishes a consistent organizational philosophy throughout Pokémon Companion.

Future database layers and supporting systems should adopt structures that reflect their responsibilities rather than attempting to conform to a universal organizational pattern.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATASETS.md
- SCRIPTS_ARCHITECTURE.md

---

# Related Decisions

- ADR-002 — Multi-layer Database Pipeline
- ADR-004 — Independent and Dependent Domains
- ADR-012 — Feature-Oriented Generated Database
- ADR-028 — Layered Generator Dependencies

---

# Date Approved

2026