# ADR-018 — First-Class Relationships

## Status

Approved

---

# Purpose

Define how relationships are modeled within the Pokémon Companion Canonical Database.

This decision establishes that relationships carrying meaningful information are treated as first-class domains rather than simple references between entities.

---

# Context

Many connections between canonical entities contain information that extends beyond the existence of the relationship itself.

Examples include:

- A Pokémon learning a Move
- A Pokémon evolving into another Pokémon
- A Machine teaching a Move
- An Item triggering an Evolution
- A Trainer using a Pokémon
- A Pokémon appearing in an Encounter

These relationships often include their own attributes such as:

- Game Context
- Version Group
- Requirements
- Conditions
- Probability
- Historical validity
- Metadata
- Provenance

Representing these as simple foreign-key references would either duplicate data or require unrelated entities to own relationship-specific information.

The architecture therefore requires certain relationships to become first-class knowledge domains.

---

# Decision

Whenever a connection between two or more canonical entities carries meaningful attributes, it shall be modeled as a first-class relationship domain within the canonical knowledge graph.

Relationship domains possess their own identity, metadata, validation rules, provenance, and generation pipeline.

Canonical entities remain responsible only for their own intrinsic properties, while relationship-specific information belongs exclusively to the relationship domain.

---

# Rationale

Modeling rich relationships as independent domains preserves normalization while allowing relationship-specific information to evolve independently of the connected entities.

This approach improves validation, simplifies historical modeling, enables AI reasoning, and provides a consistent structure for representing complex gameplay mechanics.

It also reinforces the knowledge graph architecture by making relationships navigable, reusable, and extensible.

---

# Consequences

## Benefits

- Eliminates duplication of relationship-specific data.
- Improves normalization across the knowledge graph.
- Supports historical and context-aware relationships.
- Enables richer validation and provenance tracking.
- Simplifies future feature development and AI reasoning.

### Trade-offs

- Increases the number of canonical relationship datasets.
- Queries often require traversing relationship domains rather than direct entity references.

### Long-Term Impact

Future gameplay mechanics can introduce new relationship domains without modifying existing canonical entities, allowing the knowledge graph to expand while preserving architectural consistency.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- DATA_ARCHITECTURE.md

---

# Related Decisions

- ADR-010 — Knowledge Graph and Active Context
- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-015 — Forms as Dependent Entities
- ADR-019 — Breeding as a Relationship Domain

---

# Date Approved

2026