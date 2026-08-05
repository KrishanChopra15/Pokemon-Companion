# ADR-005 — Raw Database Game Organization

## Status

Approved

---

# Purpose

Define how the Raw Database is organized within the Pokémon Companion data pipeline.

This decision establishes a predictable organizational structure that preserves the hierarchy of the official Pokémon franchise while maintaining scalability for future games and platforms.

---

# Context

The Raw Database serves as the archival representation of official Pokémon game data.

Several organizational approaches were considered, including organizing extracted data by domain, by individual game, or by platform alone.

These approaches either obscured the relationship between games or failed to reflect the official structure of the Pokémon franchise.

A consistent organizational model was therefore required to preserve the provenance of extracted data while remaining easy to navigate and extend.

---

# Decision

The Raw Database shall be organized according to the official Pokémon franchise hierarchy.

Data is organized using the following structure:

- Franchise Category
- Generation
- Game
- Domain

For example, Main Series titles are grouped by Generation, with each Generation containing its supported games and each game containing its extracted domains.

This structure preserves the official organization of Pokémon games while providing a stable foundation for future expansion.

---

# Rationale

The Raw Database exists to preserve official game data rather than reinterpret it.

Organizing data according to the official franchise hierarchy makes the origin of every extracted record immediately understandable and simplifies navigation throughout the extraction layer.

Grouping games by Generation also mirrors the way official Pokémon releases are commonly understood by developers and players, while allowing future generations and franchise categories to be added without restructuring existing data.

---

# Consequences

## Benefits

- Mirrors the official organization of the Pokémon franchise.
- Preserves the provenance of extracted data.
- Simplifies navigation throughout the Raw Database.
- Supports future generations without structural changes.
- Provides a predictable layout for extraction and validation tools.

### Trade-offs

- Similar domains are distributed across multiple games rather than stored together.
- Cross-game comparisons occur during later pipeline stages rather than within the Raw Database itself.

### Long-Term Impact

This decision establishes the permanent organizational structure of the Raw Database.

Future games, franchise categories, and supported platforms should integrate into this hierarchy rather than introducing alternative organizational models.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATASETS.md
- SCRIPTS_ARCHITECTURE.md

---

# Related Decisions

- ADR-002 — Multi-layer Database Pipeline
- ADR-003 — Database Layer Organization
- ADR-006 — Pipeline Traceability
- ADR-007 — Lossless Extraction

---

# Date Approved

2026