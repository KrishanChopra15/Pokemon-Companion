# ADR-026 — World Objects

## Status

Approved

---

# Purpose

Define how physical objects are represented within the Pokémon Companion world model.

This decision establishes World Objects as first-class entities responsible for representing the placement, interaction, and behavior of objects within the game world, enabling interactive maps without embedding gameplay logic into locations.

---

# Context

The Pokémon world contains many interactive elements beyond locations themselves.

Examples include:

- Trainers
- NPCs
- Pokémon Encounters
- Hidden Items
- Visible Items
- Buildings
- Signs
- Warp Points
- Event Triggers
- Trees
- Rocks
- Water Features
- Decorative Objects
- Landmarks

These objects all exist *within* locations but possess their own spatial positions, interaction behavior, visibility rules, and metadata.

Embedding this information directly into Location datasets would tightly couple world layout with gameplay entities, making the world difficult to maintain and extend.

The architecture therefore requires an intermediate representation that models the placement of entities within the world.

---

# Decision

The game world shall be composed of **World Objects**.

World Objects represent the placement of entities within maps while owning their own spatial and interaction metadata.

A World Object may reference a canonical entity such as:

- Trainer
- NPC
- Pokémon Encounter
- Item
- Building
- Landmark
- Event
- Service
- Environmental Object

World Objects define where and how an entity exists within a specific map without duplicating the entity's canonical data.

Interactive maps shall render World Objects rather than hard-coded map features.

---

# Rationale

Separating World Objects from Locations creates a cleaner architectural model.

Locations define *where* something exists.

Canonical entities define *what* something is.

World Objects define *how and where* that entity is placed within a specific world context.

This separation allows maps to remain highly interactive while preserving normalization throughout the knowledge graph.

It also enables every meaningful object within the world to become searchable, navigable, and clickable without introducing special-case implementations.

---

# Consequences

## Benefits

- Separates world layout from canonical knowledge.
- Supports fully interactive maps.
- Eliminates duplication of entity information.
- Simplifies map rendering.
- Enables future spatial analysis and navigation features.

### Trade-offs

- Introduces an additional relationship layer between Locations and canonical entities.
- World generation becomes more sophisticated due to spatial metadata.

### Long-Term Impact

Future features—including indoor navigation, layered maps, dynamic events, accessibility overlays, AI route planning, and interactive world exploration—can all build upon the World Object model without changing the underlying world architecture.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- DATA_ARCHITECTURE.md
- KNOWLEDGE_MODEL.md
- FEATURES.md

---

# Related Decisions

- ADR-018 — First-Class Relationships
- ADR-023 — Trainers as First-Class Entities
- ADR-024 — NPCs as First-Class Entities
- ADR-025 — World Graph and Interactive Maps
- ADR-027 — Dual Search Experience

---

# Date Approved

2026