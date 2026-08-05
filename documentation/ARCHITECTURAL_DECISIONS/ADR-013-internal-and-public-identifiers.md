# ADR-013 — Internal and Public Identifiers

## Status

Approved

---

# Purpose

Define how entities are identified internally within Pokémon Companion and how they are referenced by external consumers.

This decision establishes a clear separation between internal implementation identifiers and stable, user-facing identifiers.

---

# Context

The Canonical Database requires stable internal identifiers to efficiently represent entities and relationships throughout the knowledge graph.

However, exposing these internal identifiers to the frontend or external consumers would tightly couple application interfaces to the database implementation.

The project therefore requires a distinction between internal identifiers used by the platform and public identifiers used by users and external systems.

---

# Decision

Canonical identifiers shall remain internal implementation details.

They are used exclusively within the database, generation pipeline, backend services, validation systems, and internal tooling.

The frontend and any public APIs shall communicate using stable, user-facing identifiers appropriate to each feature.

Examples include:

- National Pokédex numbers
- Slugs
- Feature-specific routes
- Other stable public identifiers

The frontend shall remain completely independent of the internal knowledge graph identifier system.

---

# Rationale

Separating internal and public identifiers prevents implementation details from leaking into application interfaces.

Internal identifiers may evolve to support normalization, relationships, and future architectural improvements without requiring frontend or API changes.

Public identifiers remain stable because they represent concepts familiar to trainers rather than database implementation details.

This separation reduces coupling while improving long-term maintainability and flexibility.

---

# Consequences

## Benefits

- Decouples frontend from database implementation.
- Allows internal refactoring without breaking public interfaces.
- Improves long-term maintainability.
- Keeps APIs centered around trainer-facing concepts.
- Simplifies migration and future architectural changes.

### Trade-offs

- Backend services must translate between internal and public identifiers.
- Additional mapping logic is required during generation and API responses.

### Long-Term Impact

Internal identifiers may evolve independently as the knowledge graph grows.

Public interfaces remain stable, preserving compatibility across future versions of Pokémon Companion.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- API_DOCUMENTATION.md
- BACKEND_ARCHITECTURE.md

---

# Related Decisions

- ADR-001 — Database Optimized for Consumption
- ADR-010 — Knowledge Graph and Active Context
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-012 — Feature-Oriented Generated Database

---

# Date Approved

2026