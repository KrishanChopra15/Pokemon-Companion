# ADR-015 — Forms as Dependent Entities

## Status

Approved

---

# Purpose

Define how Pokémon Forms are modeled within the canonical knowledge graph.

This decision establishes Forms as first-class dependent entities that possess their own data and history while deriving their identity from a parent Pokémon Species.

---

# Context

Many Pokémon exist in multiple official forms.

Examples include:

- Regional Forms
- Mega Evolutions
- Gigantamax Forms
- Primal Reversions
- Alternate Forms
- Seasonal Forms
- Battle Forms
- Cosmetic Forms

These forms often have unique characteristics such as:

- Base stats
- Types
- Abilities
- Learnsets
- Artwork
- Models
- Battle mechanics

Treating forms as simple properties of Species would duplicate data and limit future expansion.

Conversely, treating every form as a completely independent Pokémon would ignore the official taxonomy and complicate navigation.

The architecture therefore requires a model that preserves both shared identity and form-specific data.

---

# Decision

Forms shall be modeled as first-class dependent entities.

Each Form possesses its own canonical data, relationships, media, historical information, and game-specific behavior while deriving its identity from a single parent Pokémon Species.

Forms shall follow the official Pokémon taxonomy.

New official form categories can be introduced without redesigning the underlying architecture.

---

# Rationale

Modeling Forms as dependent entities reflects how official Pokémon games organize Pokémon while avoiding unnecessary duplication.

Shared biological identity remains associated with the Species, while form-specific characteristics remain localized within the Form.

This approach supports historical differences, future mechanics, and complex relationships without compromising the consistency of the knowledge graph.

---

# Consequences

## Benefits

- Aligns with official Pokémon taxonomy.
- Eliminates unnecessary duplication.
- Supports form-specific mechanics and history.
- Simplifies navigation between Species and Forms.
- Easily accommodates future form categories.

### Trade-offs

- Additional relationships are required between Species and Forms.
- Some queries require traversing Form relationships instead of accessing Species directly.

### Long-Term Impact

Future mechanics introducing new form types can be integrated by extending the existing Form model rather than redesigning the canonical database.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- KNOWLEDGE_MODEL.md
- DATA_ARCHITECTURE.md

---

# Related Decisions

- ADR-004 — Independent and Dependent Domains
- ADR-009 — Canonical Entities and Historical Snapshots
- ADR-017 — Media as a Dependent Domain

---

# Date Approved

2026