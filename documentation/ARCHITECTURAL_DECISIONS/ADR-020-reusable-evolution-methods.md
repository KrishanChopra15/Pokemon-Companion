# ADR-020 — Reusable Evolution Methods

## Status

Approved

---

# Purpose

Define how evolution methods are modeled within the Pokémon Companion Canonical Database.

This decision establishes Evolution Methods as reusable knowledge entities that can be referenced by evolution relationships rather than duplicated across the database.

---

# Context

Pokémon evolution is governed by a wide variety of mechanics.

Examples include:

- Level Up
- Evolution Stones
- Friendship
- Trade
- Held Items
- Time of Day
- Weather
- Location
- Move Knowledge
- Gender
- Regional Variants
- Special Conditions

Many Pokémon share identical evolution mechanics.

If every evolution relationship stored its own free-form description of these mechanics, the database would contain significant duplication, inconsistent terminology, and become difficult to validate or extend.

The architecture therefore requires evolution methods to exist independently from the relationships that use them.

---

# Decision

Evolution Methods shall be modeled as reusable canonical knowledge entities.

Each Evolution Method represents a standardized evolution mechanic composed of one or more requirements and conditions.

Evolution relationships reference these methods rather than storing free-form descriptions or duplicating evolution logic.

Relationship-specific information, such as source Pokémon, target Pokémon, game context, and historical availability, remains within the evolution relationship itself.

---

# Rationale

Separating Evolution Methods from evolution relationships normalizes evolution mechanics while keeping individual evolution paths concise and reusable.

This approach allows a single standardized method to be shared across many Pokémon while enabling historical changes, validation, AI reasoning, and future mechanics without restructuring the database.

It also promotes consistency by ensuring that identical mechanics are represented identically throughout the project.

---

# Consequences

## Benefits

- Eliminates duplicated evolution mechanics.
- Standardizes evolution requirements.
- Simplifies validation and maintenance.
- Supports historical and game-specific evolution changes.
- Enables advanced AI reasoning and navigation.

### Trade-offs

- Evolution queries require resolving both relationships and referenced Evolution Methods.
- The generation pipeline must maintain reusable method definitions.

### Long-Term Impact

Future evolution mechanics can be introduced by adding new Evolution Methods without modifying existing evolution relationships, preserving backward compatibility and architectural consistency.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- DATA_ARCHITECTURE.md

---

# Related Decisions

- ADR-018 — First-Class Relationships
- ADR-019 — Breeding as a Relationship Domain
- ADR-021 — Game Profiles

---

# Date Approved

2026