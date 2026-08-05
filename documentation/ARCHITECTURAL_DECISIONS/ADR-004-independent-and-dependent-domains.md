# ADR-004 — Independent and Dependent Domains

## Status

Approved

---

# Purpose

Define how domains are identified and organized throughout Pokémon Companion.

This decision establishes that independent concepts become top-level domains, while concepts that rely upon another concept become subdomains of their parent domain.

---

# Context

As Pokémon Companion expanded, it became necessary to determine which concepts deserved their own top-level domain and which should exist within another domain.

Treating every concept as a top-level domain would create unnecessary fragmentation, making the project increasingly difficult to navigate and maintain.

Conversely, nesting too many concepts together would blur responsibilities and reduce the clarity of the overall architecture.

A consistent modeling principle was therefore required to guide domain organization across the project.

---

# Decision

Independent concepts shall be modeled as top-level domains.

Concepts whose identity depends upon another concept shall be modeled as subdomains of their parent domain.

The relationship between parent and child domains reflects conceptual dependency rather than implementation convenience.

This principle applies consistently throughout the project's documentation, database architecture, generation pipeline, APIs, and application structure.

---

# Rationale

Organizing domains according to conceptual dependency produces an architecture that closely mirrors the Pokémon universe itself.

Independent concepts such as Pokémon, Species, Moves, Items, Trainers, and Games naturally become top-level domains because they possess their own identities and lifecycles.

Dependent concepts such as Forms, Media, Learnsets, or related resources remain associated with the concept they describe rather than existing as isolated systems.

This approach reduces unnecessary complexity while making the architecture easier to understand, extend, and maintain.

---

# Consequences

## Benefits

- Establishes consistent rules for organizing project domains.
- Prevents unnecessary fragmentation of the architecture.
- Improves discoverability for contributors.
- Produces a hierarchy that reflects conceptual relationships.
- Simplifies future expansion as new Pokémon mechanics are introduced.

### Trade-offs

- Determining whether a concept is independent or dependent may require architectural discussion.
- Some concepts may evolve over time, requiring careful review before changing their classification.

### Long-Term Impact

This decision provides a long-term modeling principle for Pokémon Companion.

Future domains should be introduced by evaluating whether they possess an independent identity or derive their identity from an existing domain.

Following this principle preserves architectural consistency as the project grows.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- DATASETS.md
- KNOWLEDGE_MODEL.md

---

# Related Decisions

- ADR-003 — Database Layer Organization
- ADR-015 — Forms as Dependent Entities
- ADR-017 — Media as a Dependent Domain
- ADR-018 — First-Class Relationships

---

# Date Approved

2026