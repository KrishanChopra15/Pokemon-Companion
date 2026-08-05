# ADR-024 — NPCs as First-Class Entities

## Status

Approved

---

# Purpose

Define how non-player characters (NPCs) are represented within the Pokémon Companion knowledge graph.

This decision establishes meaningful gameplay NPCs as first-class knowledge entities with dedicated profiles, enabling rich navigation, service discovery, historical documentation, and integration with the wider Pokémon world.

---

# Context

Not every important character in Pokémon is a battle-capable Trainer.

Many NPCs provide gameplay services, unlock mechanics, advance the story, or contribute to world exploration.

Examples include:

- Professors
- Nurse Joy
- Poké Mart Clerks
- Move Tutors
- Move Reminder NPCs
- Name Raters
- Day Care Staff
- Fossil Restoration NPCs
- Berry Masters
- Story Characters
- Quest NPCs

These characters often possess unique dialogue, locations, services, requirements, and game-specific appearances.

Representing them solely as attributes of locations or events would duplicate information and prevent meaningful navigation throughout the application.

The architecture therefore requires significant gameplay NPCs to exist as independent canonical entities.

---

# Decision

Every meaningful gameplay NPC shall be modeled as a first-class knowledge entity.

Each NPC shall have a dedicated NPC Profile serving as the central hub for NPC-specific information across all supported games.

An NPC Profile may include:

- Identity
- Role
- Services
- Dialogue
- Locations
- Requirements
- Story Appearances
- Game Appearances
- Associated Mechanics
- Related Characters
- Related Locations
- Historical Changes

NPC Profiles reference canonical entities rather than duplicating authoritative data.

Only NPCs with meaningful gameplay, narrative, or world significance shall receive dedicated profiles.

Generic or unnamed NPCs may remain represented through world or encounter data where appropriate.

---

# Rationale

Treating significant NPCs as first-class entities reflects their importance within the Pokémon world while preserving normalization throughout the knowledge graph.

This approach enables players to directly search for important NPCs, understand their roles across multiple games, and navigate naturally between characters, locations, mechanics, and story progression.

It also provides a scalable structure for supporting increasingly rich world-building features.

---

# Consequences

## Benefits

- Enables comprehensive NPC Profile pages.
- Improves world navigation and discoverability.
- Eliminates duplicated NPC information.
- Supports gameplay guides and AI assistance.
- Naturally integrates services with related game mechanics.

### Trade-offs

- Requires additional relationship datasets linking NPCs to games, locations, services, and mechanics.
- Clear guidelines are needed to distinguish profile-worthy NPCs from generic background characters.

### Long-Term Impact

Future Pokémon games introducing new services, quest systems, or significant world characters can be incorporated without changing the underlying knowledge graph, allowing the NPC domain to evolve alongside the franchise.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- FEATURES.md

---

# Related Decisions

- ADR-021 — Game Profiles
- ADR-023 — Trainers as First-Class Entities
- ADR-025 — World Graph and Interactive Maps
- ADR-026 — World Objects

---

# Date Approved

2026