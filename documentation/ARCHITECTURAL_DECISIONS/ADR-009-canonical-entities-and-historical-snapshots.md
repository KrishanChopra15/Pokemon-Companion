# ADR-009 — Canonical Entities and Historical Snapshots

## Status

Approved

---

# Purpose

Define how Pokémon Companion represents enduring Pokémon concepts while preserving historical differences between official games.

This decision establishes that canonical entities represent permanent identity, while game-specific historical snapshots describe how those entities exist within individual game contexts.

---

# Context

Official Pokémon games introduce changes to Pokémon, moves, items, abilities, mechanics, and many other concepts over time.

Some attributes remain constant across every game, while others change between generations or even individual releases.

Representing every game as a completely independent database would duplicate large amounts of information, while storing only a single modern representation would discard valuable historical knowledge.

A consistent architectural model was therefore required to preserve both enduring identity and historical accuracy.

---

# Decision

Canonical entities shall represent enduring identity.

Game-specific historical snapshots shall represent how those entities exist within individual supported games.

Canonical entities define the permanent concepts of the Pokémon universe.

Historical snapshots record game-specific properties, mechanics, and behaviors without redefining the canonical entity itself.

---

# Rationale

Separating enduring identity from historical representation allows Pokémon Companion to preserve the complete history of official Pokémon games without duplicating canonical concepts.

A Pokémon species, move, item, or ability exists only once within the Canonical Database.

Changes introduced by individual games are represented through historical snapshots and contextual relationships rather than creating duplicate canonical entities.

This approach maintains historical fidelity while providing a stable knowledge graph that remains reusable across every supported game.

---

# Consequences

## Benefits

- Eliminates unnecessary duplication of canonical concepts.
- Preserves historical accuracy across supported games.
- Supports future Pokémon generations without redesigning the Canonical Database.
- Simplifies cross-game analysis and comparison.
- Provides a stable foundation for generated datasets and application services.

### Trade-offs

- Contributors must distinguish between permanent identity and historical state.
- Some queries require combining canonical entities with historical snapshots.
- Historical data management becomes a dedicated architectural responsibility.

### Long-Term Impact

This decision establishes one of the core modeling principles of Pokémon Companion.

Future canonical entities should represent enduring concepts, while game-specific differences should be modeled through historical snapshots and contextual relationships rather than duplicate entities.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- DATASETS.md
- KNOWLEDGE_MODEL.md

---

# Related Decisions

- ADR-008 — Normalization and Canonical Construction
- ADR-010 — Knowledge Graph and Active Context
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-022 — Official and Development Timelines

---

# Date Approved

2026