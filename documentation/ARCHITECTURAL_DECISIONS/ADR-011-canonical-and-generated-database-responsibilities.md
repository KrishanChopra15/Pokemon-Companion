# ADR-011 — Canonical and Generated Database Responsibilities

## Status

Approved

---

# Purpose

Define the responsibilities of the Canonical Database and the Generated Database within Pokémon Companion.

This decision establishes a clear separation between authoritative Pokémon knowledge and application-optimized data, ensuring that optimization never becomes the source of truth.

---

# Context

Pokémon Companion serves multiple consumers, including the backend, frontend, search engine, AI systems, and future external clients.

These systems require fast access to information that is often organized differently from the canonical knowledge graph.

Storing application-specific structures directly within the Canonical Database would tightly couple the project's authoritative knowledge to individual application features, making maintenance increasingly difficult as the platform evolves.

A clear separation was therefore required between authoritative knowledge and generated application views.

---

# Decision

The Canonical Database shall contain the authoritative representation of Pokémon knowledge and its relationships.

The Generated Database shall contain precomputed, application-oriented views derived exclusively from the Canonical Database.

Generated datasets exist solely to optimize application performance, simplify data consumption, and improve developer experience.

The Generated Database shall never become the source of truth and may always be regenerated from canonical data.

---

# Rationale

Separating authoritative knowledge from generated application views allows each database to focus on its intended responsibility.

The Canonical Database provides a stable, reusable knowledge graph that remains independent of presentation requirements.

The Generated Database prepares optimized datasets for specific application features, reducing runtime processing while preserving a single authoritative source of truth.

This separation allows new application features to introduce additional generated datasets without affecting the structure or integrity of the Canonical Database.

---

# Consequences

## Benefits

- Preserves a single authoritative source of Pokémon knowledge.
- Reduces runtime processing throughout the application.
- Simplifies frontend and backend implementation.
- Allows generated datasets to evolve independently of canonical data.
- Supports deterministic regeneration of optimized datasets.
- Improves long-term maintainability and scalability.

### Trade-offs

- Additional storage is required for generated datasets.
- The build pipeline becomes responsible for maintaining generated views.
- Contributors must understand the distinction between canonical and generated data when introducing new features.

### Long-Term Impact

This decision establishes the permanent boundary between knowledge modeling and application optimization.

Future features should extend the Generated Database with additional optimized datasets rather than introducing application-specific structures into the Canonical Database.

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
- ADR-010 — Knowledge Graph and Active Context
- ADR-012 — Feature-Oriented Generated Database
- ADR-016 — Page-Oriented Generated Profiles

---

# Date Approved

2026