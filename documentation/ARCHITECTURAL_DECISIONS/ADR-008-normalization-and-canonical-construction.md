# ADR-008 — Normalization and Canonical Construction

## Status

Approved

---

# Purpose

Define the responsibilities of normalization and canonical construction within the Pokémon Companion data pipeline.

This decision establishes that normalization operates within the context of a single game, while canonical construction unifies normalized data across all supported games into the project's permanent knowledge graph.

---

# Context

Official Pokémon games often represent similar concepts using different structures, formats, and mechanics.

Before these concepts can become part of Pokémon Companion's Canonical Database, the extracted data must first be standardized while preserving its historical context.

A clear distinction was therefore required between preparing data from an individual game and constructing the project's cross-game representation of Pokémon knowledge.

---

# Decision

Normalization shall operate on one domain within one game.

Canonical construction shall operate on one domain across all supported games.

Normalization standardizes extracted game data without combining information from multiple games.

Canonical construction then identifies enduring concepts across the normalized datasets and creates the project's permanent canonical entities and relationships.

---

# Rationale

Separating normalization from canonical construction establishes clear responsibilities within the data pipeline.

Normalization focuses solely on preparing the data extracted from a single game into a consistent structure while preserving its historical accuracy.

Canonical construction then compares equivalent concepts across supported games, identifies their enduring identities, and builds the reusable knowledge graph that powers the remainder of the project.

This separation simplifies validation, improves traceability, and allows new games to be incorporated by normalizing only the new source before regenerating the canonical database.

---

# Consequences

## Benefits

- Separates game-specific processing from cross-game knowledge modeling.
- Simplifies the addition of future Pokémon games.
- Improves validation by isolating processing stages.
- Preserves historical accuracy while enabling canonical reuse.
- Reinforces the layered architecture of the data pipeline.

### Trade-offs

- Introduces an additional processing stage within the build pipeline.
- Requires clear rules for identifying equivalent concepts across different games.
- Canonical construction depends upon the successful normalization of every supported game.

### Long-Term Impact

This decision defines the transition between the Raw Database and the Canonical Database.

Future games should integrate into the architecture by first undergoing normalization before participating in canonical construction, ensuring the knowledge graph continues to evolve without requiring structural redesign.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATASETS.md
- SCRIPTS_ARCHITECTURE.md

---

# Related Decisions

- ADR-002 — Multi-layer Database Pipeline
- ADR-007 — Lossless Extraction
- ADR-009 — Canonical Entities and Historical Snapshots
- ADR-010 — Knowledge Graph and Active Context

---

# Date Approved

2026