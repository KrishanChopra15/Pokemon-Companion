# ADR-002 — Multi-layer Database Pipeline

## Status

Approved

---

# Purpose

Define the fundamental architecture of the Pokémon Companion database as a layered data pipeline.

This decision establishes that every database layer is derived from the previous layer, enabling reproducible builds, deterministic regeneration, and clear separation of responsibilities throughout the project's data architecture.

---

# Context

Pokémon Companion integrates information from multiple official Pokémon games while supporting normalization, relationship modeling, generated datasets, and future expansion.

A single monolithic database would tightly couple data extraction, canonical knowledge, application-specific optimizations, and user data, making maintenance increasingly difficult as the project grows.

A clear architectural model was therefore required to separate each stage of data processing while ensuring that every layer could be regenerated consistently from authoritative upstream sources.

---

# Decision

The Pokémon Companion database shall be implemented as a multi-layer data pipeline.

Each architectural layer is derived exclusively from the layer immediately preceding it.

Changes propagate through regeneration rather than manual modification, ensuring that every downstream dataset remains reproducible, traceable, and consistent with its authoritative source.

No layer may bypass or redefine the responsibilities of an upstream layer.

---

# Rationale

Organizing the database as a layered pipeline separates extraction, normalization, relationship modeling, optimization, and user data into independent responsibilities.

Each layer focuses on a single purpose while depending only on validated outputs from earlier stages.

This approach simplifies debugging, supports deterministic builds, reduces duplication, and allows improvements to extraction or normalization to automatically propagate through regenerated downstream datasets.

The layered architecture also provides a stable foundation for supporting future Pokémon games without requiring structural redesign.

---

# Consequences

## Benefits

- Establishes clear ownership for every stage of the data lifecycle.
- Enables deterministic regeneration of downstream datasets.
- Improves traceability throughout the build pipeline.
- Simplifies validation and debugging.
- Reduces manual maintenance.
- Supports future expansion without restructuring the architecture.

### Trade-offs

- The build pipeline becomes more sophisticated.
- Changes may require regeneration of multiple downstream layers.
- Layer dependencies must remain carefully managed.

### Long-Term Impact

This decision defines one of the project's core architectural foundations.

Every future dataset, generator, validation process, and application service should respect the layered pipeline and derive its data only from the appropriate upstream layer.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATASETS.md
- SCRIPTS_ARCHITECTURE.md

---

# Related Decisions

- ADR-001 — Database Optimized for Consumption
- ADR-003 — Database Layer Organization
- ADR-006 — Pipeline Traceability
- ADR-028 — Layered Generator Dependencies

---

# Date Approved

2026