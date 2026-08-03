# Pokémon Companion Knowledge Model

> **Conceptual Knowledge Specification**
>
> Defines how Pokémon Companion understands, represents, and reasons about Pokémon knowledge.
>
> This document is implementation-independent and serves as the conceptual foundation of the Pokémon Knowledge System (PKS).

---

# Purpose

The Knowledge Model defines the conceptual structure of all Pokémon knowledge within Pokémon Companion.

It answers questions such as:

- What is knowledge?
- What is an entity?
- What is a relationship?
- What is considered canonical truth?
- How is historical information represented?
- How does knowledge evolve across games?
- How is user data separated from Pokémon knowledge?

This document intentionally avoids implementation details such as programming languages, databases, JSON structures, or APIs.

---

# Vision

Pokémon Companion is not simply a database.

It is a comprehensive Pokémon Knowledge System capable of representing every official Pokémon game, every official mechanic, and every official relationship as a single interconnected body of knowledge.

Every page, tool, feature, and future AI capability should derive its understanding from this shared knowledge model.

---

# Core Philosophy

The Knowledge Model is built upon several guiding principles.

## Official Data First

Official Pokémon games define canonical truth.

Community-maintained resources may assist in extracting or interpreting data but never replace official information.

---

## Historical Accuracy

Knowledge must represent each game exactly as it existed at release.

Information is never rewritten using newer mechanics.

Every game is treated as its own historical snapshot.

---

## Interconnected Knowledge

No entity should exist in isolation.

Every meaningful connection between entities should be explicitly represented.

Users should be able to navigate naturally through the Pokémon universe by following these relationships.

---

## Immutable Canonical Knowledge

Canonical Pokémon knowledge does not change during application runtime.

User actions never modify official Pokémon information.

---

## Separation of Concerns

Canonical knowledge, generated knowledge, and user knowledge are distinct concepts with different responsibilities.

---

# Pokémon Knowledge System (PKS)

The Pokémon Knowledge System is the authoritative knowledge layer of Pokémon Companion.

It owns:

- Canonical entities
- Canonical relationships
- Historical knowledge
- Generated knowledge
- Validation metadata

The PKS is independent of user accounts, application logic, and presentation.

---

# Pokémon Knowledge Graph (PKG)

The Pokémon Knowledge Graph is the interconnected representation of knowledge inside the PKS.

Every canonical entity becomes a node.

Every relationship becomes an edge.

Examples include:

- Pokémon learns Move
- Pokémon evolves into Pokémon
- Species has Form
- Move belongs to Type
- Machine teaches Move
- Encounter occurs at Location
- Trainer owns Pokémon
- Game contains Region

The graph allows knowledge to be explored naturally rather than through isolated datasets.

---

# Knowledge Levels

Knowledge within Pokémon Companion is organized into six levels.

## Level 0 — Canonical Source

Raw information extracted from official Pokémon games.

Examples:

- ROM data
- Official assets
- Official text
- Official metadata

This level is immutable.

---

## Level 1 — Canonical Knowledge

Normalized representations of official entities.

Examples:

- Species
- Moves
- Abilities
- Games
- Locations
- Items

This defines the official truth understood by Pokémon Companion.

---

## Level 2 — Relationship Knowledge

Explicit connections between canonical entities.

Examples:

- learns
- evolves into
- appears in
- teaches
- located at
- belongs to

Relationships are treated as first-class knowledge rather than inferred links.

---

## Level 3 — Derived Knowledge

Knowledge generated from canonical information.

Examples:

- Search indexes
- Lookup datasets
- Statistics
- Generated manifests
- Cross-reference indexes

Derived knowledge is reproducible and may be regenerated at any time.

---

## Level 4 — Application Knowledge

Runtime services that consume the Knowledge System.

Examples:

- Search
- Filtering
- Navigation
- Team analysis
- Evolution calculations

These services never redefine canonical knowledge.

---

## Level 5 — User Knowledge

Information created by individual trainers.

Examples:

- Teams
- Collections
- Adventure progress
- Living Dex
- Achievements
- Preferences
- Notes

User knowledge references canonical entities but never modifies them.

---

# Types of Truth

Pokémon Companion recognizes three distinct categories of truth.

## Canonical Truth

Information originating from official Pokémon games.

This is the highest authority within the system.

---

## Derived Truth

Information generated algorithmically from canonical knowledge.

Derived truth improves performance and usability but never replaces canonical truth.

---

## User Truth

Information created by users.

Examples include collections, progress, and teams.

User truth is personal and does not alter canonical knowledge.

---

# Canonical Entity

A Canonical Entity represents a unique concept within the Pokémon universe.

Examples include:

- A Pokémon species
- A move
- An item
- A location
- A trainer
- A game

Every canonical entity has:

- Stable identity
- Canonical identifier
- Relationships
- Metadata
- Historical context

---

# Identity and State

The Knowledge Model distinguishes between identity and state.

## Identity

Defines what something is.

Identity remains constant across time.

Example:

Bulbasaur

---

## State

Defines how that entity exists within a specific game.

Examples include:

- Learnset
- Abilities
- Encounter locations
- TM compatibility
- Base stats (when applicable)

State changes between games while identity remains constant.

---

# Relationships

Relationships connect canonical entities.

Every relationship has:

- Source entity
- Target entity
- Relationship type
- Historical context
- Game context (where applicable)

Relationships are explicit and never implied.

---

# Knowledge Ownership

Every piece of canonical knowledge has exactly one owner.

Ownership prevents duplicated information and conflicting representations.

Derived datasets should reference owned knowledge rather than duplicate it.

---

# Dependency Rules

Knowledge flows only in one direction.

```
Canonical Source
        ↓
Canonical Knowledge
        ↓
Relationships
        ↓
Derived Knowledge
        ↓
Application
        ↓
User Knowledge
```

Lower levels must never depend on higher levels.

---

# Design Principles

The Knowledge Model follows these principles:

1. Official games define canonical truth.
2. Every entity has one stable identity.
3. Identity and state are separate concepts.
4. Relationships are first-class knowledge.
5. Every entity should be reachable through explicit relationships.
6. Canonical knowledge is immutable.
7. Generated knowledge is reproducible.
8. User knowledge is isolated from canonical knowledge.
9. Historical accuracy is preserved for every supported game.
10. The Knowledge System is the single source of truth for Pokémon Companion.

---

# Summary

The Knowledge Model defines the conceptual language used throughout Pokémon Companion.

It establishes a shared understanding of entities, relationships, truth, history, and ownership that every future database, script, API, and application feature will follow.

By separating concepts from implementation, the Knowledge Model provides a stable foundation upon which the Pokémon Knowledge System can continue growing alongside future Pokémon games for many years to come.