# ADR-025 — World Graph and Interactive Maps

## Status

Approved

---

# Purpose

Define how the Pokémon world is represented within the Pokémon Companion architecture.

This decision establishes a separation between how the world is stored, how it is modeled within the canonical knowledge graph, and how it is presented to users through interactive map experiences.

---

# Context

The Pokémon world contains a rich hierarchy of interconnected locations, including:

- Regions
- Cities
- Routes
- Buildings
- Caves
- Dungeons
- Landmarks
- Interior Areas
- Outdoor Areas

These locations contain numerous gameplay elements such as:

- Trainers
- NPCs
- Pokémon Encounters
- Items
- Events
- Services
- Buildings
- World Objects

A simple hierarchical filesystem is ideal for organization and maintainability, but it is insufficient for representing the many relationships that exist between locations and gameplay elements.

Likewise, frontend map experiences require optimized representations that prioritize navigation and visualization rather than storage efficiency.

The architecture therefore requires a clear separation between storage, relationships, and presentation.

---

# Decision

The Pokémon world shall be:

1. Organized hierarchically for storage and maintainability.
2. Modeled as a graph within the Canonical Database.
3. Presented through generated interactive map experiences.

The hierarchical organization provides predictable storage.

The canonical knowledge graph models relationships between world entities.

Generated datasets produce optimized interactive maps and navigation experiences for the frontend.

These responsibilities remain independent and should not be merged.

---

# Rationale

Each representation serves a different purpose.

A hierarchical structure is easy for developers to maintain.

A graph enables efficient traversal between interconnected entities such as Locations, Trainers, NPCs, Pokémon, and Items.

Generated interactive maps provide an intuitive user experience without exposing the complexity of the underlying knowledge graph.

Separating these concerns keeps each layer optimized for its own responsibility while maintaining a clean and extensible architecture.

---

# Consequences

## Benefits

- Separates storage, relationships, and presentation.
- Supports rich world navigation.
- Enables AI reasoning across the world graph.
- Improves maintainability.
- Allows interactive maps to evolve independently of the canonical model.

### Trade-offs

- World information exists in multiple derived representations.
- Interactive maps require additional generated datasets.

### Long-Term Impact

Future world features—including indoor navigation, layered maps, dynamic events, route planners, location search, and exploration tools—can be added without redesigning the underlying world architecture.

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
- ADR-021 — Game Profiles
- ADR-024 — NPCs as First-Class Entities
- ADR-026 — World Objects
- ADR-027 — Dual Search Experience

---

# Date Approved

2026