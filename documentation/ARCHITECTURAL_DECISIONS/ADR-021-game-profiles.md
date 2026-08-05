# ADR-021 — Game Profiles

## Status

Approved

---

# Purpose

Define how official Pokémon games are represented within the Pokémon Companion knowledge graph.

This decision establishes every official Pokémon game as a first-class knowledge entity with its own profile, enabling rich navigation, historical documentation, and game-specific exploration throughout the platform.

---

# Context

Pokémon Companion contains knowledge spanning multiple generations, version groups, and individual games.

Each game introduces its own:

- Mechanics
- Pokémon availability
- Regional Pokédex
- Story progression
- Characters
- Locations
- Battle systems
- Features
- Historical changes

Treating games merely as metadata attached to other entities would make navigation difficult and prevent users from exploring information from the perspective of a specific title.

The architecture therefore requires Games to be represented as independent knowledge entities.

---

# Decision

Every official Pokémon game shall be modeled as a first-class knowledge entity.

Each Game shall have its own Game Profile that serves as the central hub for game-specific information and navigation.

A Game Profile may include:

- Basic game information
- Generation
- Version Group
- Release information
- Regions
- Available Pokémon
- Regional Pokédex
- Locations
- Characters
- Trainers
- Mechanics
- Items
- Features
- Historical notes
- Related games

Game Profiles reference canonical entities rather than duplicating authoritative data.

---

# Rationale

Modeling Games as first-class entities allows Pokémon Companion to organize information around the experiences trainers recognize.

Rather than viewing games solely as contextual metadata, Game Profiles become navigable knowledge hubs that connect every relevant domain within a specific game's context.

This approach improves discoverability, historical documentation, and future expansion while preserving normalization within the canonical database.

---

# Consequences

## Benefits

- Enables dedicated Game Profile pages.
- Improves navigation across game-specific content.
- Centralizes historical and gameplay information.
- Supports future game-specific features.
- Keeps canonical knowledge interconnected.

### Trade-offs

- Requires additional generated datasets to assemble Game Profiles.
- Many relationships must reference Game entities or Game Contexts.

### Long-Term Impact

Future Pokémon games can be added as new Game entities without requiring structural changes, allowing Pokémon Companion to evolve alongside the franchise while preserving historical consistency.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- DATA_ARCHITECTURE.md
- FEATURES.md

---

# Related Decisions

- ADR-003 — Database Layer Organization
- ADR-009 — Canonical Entities and Historical Snapshots
- ADR-010 — Knowledge Graph and Active Context
- ADR-022 — Official and Development Timelines

---

# Date Approved

2026