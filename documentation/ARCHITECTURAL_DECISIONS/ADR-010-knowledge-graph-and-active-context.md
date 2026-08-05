# ADR-010 — Knowledge Graph and Active Context

## Status

Approved

---

# Purpose

Define the fundamental structure of the Pokémon Companion Canonical Database and establish how application context is resolved.

This decision establishes that the Canonical Database is modeled as a reusable knowledge graph while application behavior is driven through a deterministic Active Context that combines system defaults with user preferences.

---

# Context

Pokémon knowledge spans multiple generations, games, mechanics, regional variants, and historical changes.

Many application features require viewing the same canonical entity from different contexts without duplicating data or modifying the underlying knowledge.

At the same time, the application must present a consistent experience for users who have not explicitly selected a preferred game or context.

A unified architectural model was therefore required to separate permanent Pokémon knowledge from context-specific application behavior.

---

# Decision

The Canonical Database shall be modeled as a reusable knowledge graph composed of entities and relationships.

Canonical entities represent enduring Pokémon concepts, while relationships describe how those entities interact within specific contexts.

The application shall resolve an Active Context before presenting information.

Every selectable context shall define a deterministic system default.

User preferences may override these defaults without modifying the Canonical Database.

The frontend, backend, and application services shall consume the resolved Active Context when selecting context-specific information for presentation.

---

# Rationale

Modeling the Canonical Database as a knowledge graph enables Pokémon Companion to represent interconnected Pokémon knowledge without unnecessary duplication.

Separating context resolution from canonical storage allows the same entity to support multiple games, mechanics, and historical states while remaining a single authoritative concept.

Introducing deterministic defaults ensures the application behaves consistently even when users have not configured personal preferences.

Allowing user preferences to override defaults without altering canonical data preserves both consistency and personalization.

---

# Consequences

## Benefits

- Establishes a reusable knowledge graph as the foundation of the project.
- Separates permanent knowledge from application state.
- Eliminates duplication across supported games.
- Supports multiple contexts without modifying canonical entities.
- Provides consistent default behavior throughout the application.
- Enables personalized experiences while preserving canonical integrity.

### Trade-offs

- Context resolution becomes a core application responsibility.
- Application services must consistently respect the Active Context.
- Contributors must distinguish between canonical knowledge and context-specific presentation.

### Long-Term Impact

This decision defines one of the central architectural principles of Pokémon Companion.

Future features should operate by combining canonical knowledge with the resolved Active Context rather than introducing duplicate data or application-specific variants of canonical entities.

This approach enables future games, mechanics, user preferences, and intelligent features to integrate naturally without requiring structural redesign.

---

# Related Documentation

- DATABASE_SCHEMA.md
- KNOWLEDGE_MODEL.md
- DATA_ARCHITECTURE.md
- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md

---

# Related Decisions

- ADR-009 — Canonical Entities and Historical Snapshots
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-016 — Page-Oriented Generated Profiles
- ADR-021 — Game Profiles

---

# Date Approved

2026