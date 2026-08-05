# ADR-001 — Database Optimized for Consumption

## Status

Approved

---

# Purpose

Define the primary architectural objective of the Pokémon Companion database.

This decision establishes that the database exists to serve the application's backend and frontend efficiently while preserving the integrity of canonical Pokémon knowledge.

---

# Context

Pokémon Companion processes large volumes of interconnected Pokémon data originating from official game sources.

Multiple architectural approaches were considered, including storing data in forms that closely mirror extracted game assets or relying on extensive runtime transformations within the application.

While these approaches preserve flexibility, they increase application complexity, duplicate transformation logic, and introduce unnecessary runtime processing.

A foundational architectural principle was therefore required to define the primary responsibility of the database.

---

# Decision

The Pokémon Companion database shall be optimized for consumption by the backend and frontend while preserving canonical Pokémon knowledge.

The database should expose information in structures that minimize runtime transformation, reduce application complexity, and support efficient retrieval without compromising the accuracy or integrity of the project's canonical data.

---

# Rationale

Separating data preparation from application execution provides several long-term advantages.

Preparing optimized datasets during the generation pipeline reduces repeated runtime computation, improves application performance, simplifies frontend and backend development, and centralizes transformation logic within the build system.

At the same time, preserving canonical Pokémon knowledge ensures that optimization never replaces or alters the project's authoritative representation of official game data.

This balance allows Pokémon Companion to remain both performant and historically accurate.

---

# Consequences

## Benefits

- Reduces runtime data transformation.
- Simplifies frontend implementation.
- Simplifies backend implementation.
- Encourages deterministic data generation.
- Preserves a single canonical source of truth.
- Improves long-term maintainability.

### Trade-offs

- Generation becomes more sophisticated.
- Some information may exist in multiple generated views, although the canonical database remains the sole authoritative source.
- Build times may increase due to additional preprocessing.

### Long-Term Impact

This decision establishes one of the project's core architectural principles.

Future database schemas, generators, APIs, and frontend features should prioritize optimized consumption while preserving canonical Pokémon knowledge.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- DATASETS.md
- BACKEND_ARCHITECTURE.md

---

# Related Decisions

- ADR-002 — Multi-layer Database Pipeline
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-012 — Feature-Oriented Generated Database

---

# Date Approved

2026