# ADR-023 — Trainers as First-Class Entities

## Status

Approved

---

# Purpose

Define how battle-capable Trainers are represented within the Pokémon Companion knowledge graph.

This decision establishes Trainers as first-class knowledge entities with dedicated profiles that connect battles, teams, dialogue, locations, rewards, and historical appearances across every supported Pokémon game.

---

# Context

Battle-capable Trainers are central to the Pokémon experience.

They possess unique identities, roles, teams, locations, dialogue, battle rewards, and game-specific appearances.

Examples include:

- Gym Leaders
- Elite Four Members
- Champions
- Rivals
- Villains
- Frontier Brains
- Battle Facility Trainers
- Ordinary Trainers

Representing Trainers solely as data attached to battles or locations would duplicate information and prevent meaningful navigation between related gameplay elements.

The architecture therefore requires Trainers to exist as independent canonical entities.

---

# Decision

Every battle-capable Trainer shall be modeled as a first-class knowledge entity.

Each Trainer shall have a dedicated Trainer Profile serving as the central hub for trainer-specific information across all supported games.

A Trainer Profile may include:

- Identity
- Trainer Class
- Teams
- Battle Data
- Dialogue
- Rewards
- Locations
- Game Appearances
- Historical Changes
- Related Characters
- Associated Pokémon
- Battle Facilities
- Achievements

Profile sections shall expand naturally according to the significance of the Trainer and the amount of available canonical information.

Trainer Profiles reference canonical entities rather than duplicating authoritative data.

---

# Rationale

Treating Trainers as first-class entities reflects their importance within the Pokémon universe while preserving normalization throughout the knowledge graph.

This approach enables direct navigation between Trainers, Pokémon, Locations, Games, and Battles while supporting future features such as trainer search, battle preparation tools, AI analysis, and historical comparisons.

It also provides a scalable structure capable of supporting every official Pokémon game.

---

# Consequences

## Benefits

- Enables comprehensive Trainer Profile pages.
- Improves navigation throughout the knowledge graph.
- Eliminates duplicated trainer information.
- Supports advanced battle and strategy features.
- Simplifies future gameplay and AI integrations.

### Trade-offs

- Requires additional relationship datasets connecting Trainers to other entities.
- Generated Trainer Profiles aggregate information from multiple canonical domains.

### Long-Term Impact

Future Pokémon games, trainer categories, battle facilities, and gameplay mechanics can be incorporated by extending the Trainer domain without redesigning the surrounding architecture.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- FEATURES.md

---

# Related Decisions

- ADR-018 — First-Class Relationships
- ADR-021 — Game Profiles
- ADR-024 — NPCs as First-Class Entities
- ADR-025 — World Graph and Interactive Maps

---

# Date Approved

2026