# ADR-017 — Media as a Dependent Domain

## Status

Approved

---

# Purpose

Define how media assets are modeled within the Pokémon Companion knowledge graph.

This decision establishes Media as a first-class dependent domain that owns all visual and audio representations of canonical entities while deriving its identity from those entities.

---

# Context

Many canonical entities have associated media.

Examples include:

- Official Artwork
- Sprites
- Icons
- Models
- Cries
- Animations
- HOME Artwork
- Dream World Artwork

Media assets often vary by:

- Game
- Version
- Platform
- Form
- Context
- Resolution
- Source

Embedding media directly inside Pokémon or other canonical entities would duplicate information, complicate validation, and make future expansion difficult.

Conversely, treating Media as a completely independent top-level domain would separate it from the entities it exists to represent.

The architecture therefore requires Media to be modeled as a dependent domain.

---

# Decision

Media shall be modeled as a first-class dependent domain.

Media owns the canonical representation of visual and audio assets while deriving its identity from the canonical entity it represents.

Media may contain multiple specialized subdomains, including:

- Artwork
- Sprites
- Icons
- Models
- Cries
- Animations

Each media asset maintains its own metadata, provenance, historical context, and relationships while remaining linked to its parent entity.

---

# Rationale

Treating Media as a dependent domain balances normalization with usability.

Canonical entities remain focused on identity and gameplay knowledge, while Media manages presentation-specific assets and metadata.

This structure minimizes duplication, improves maintainability, and naturally supports future media types without altering existing entity models.

---

# Consequences

## Benefits

- Keeps canonical entities focused on gameplay knowledge.
- Centralizes management of media assets.
- Eliminates duplication across entities.
- Supports multiple asset types and historical variants.
- Simplifies future expansion.

### Trade-offs

- Media retrieval requires relationship traversal.
- Additional generation steps are needed to build frontend-ready media datasets.

### Long-Term Impact

Future media formats, higher-resolution assets, animations, or platform-specific resources can be incorporated by extending the Media domain without changing the surrounding knowledge graph.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- DATA_ARCHITECTURE.md

---

# Related Decisions

- ADR-004 — Independent and Dependent Domains
- ADR-015 — Forms as Dependent Entities
- ADR-018 — First-Class Relationships

---

# Date Approved

2026