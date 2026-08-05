# ADR-027 — Dual Search Experience

## Status

Approved

---

# Purpose

Define the search architecture used throughout Pokémon Companion.

This decision establishes two complementary search experiences built upon a shared canonical search index, balancing rapid navigation with comprehensive knowledge discovery.

---

# Context

Users interact with search in two distinct ways.

The first is quick navigation, where the user already knows what they are looking for and expects immediate autocomplete results.

The second is exploratory search, where the user submits a broader query and expects to browse all relevant knowledge across the platform.

Attempting to satisfy both use cases with a single interface would either overwhelm quick searches with unnecessary information or limit exploratory searches by returning only a small subset of results.

The architecture therefore requires two specialized search experiences while maintaining a single authoritative search foundation.

---

# Decision

Pokémon Companion shall provide two complementary search experiences.

**Quick Search** provides fast autocomplete navigation for users who already know what they are looking for.

Quick Search supports user-configurable categories while prioritizing speed and direct navigation.

**Search Explorer** provides a comprehensive, categorized view of the knowledge graph after a query is submitted.

Search Explorer organizes results into logical categories such as:

- Pokémon
- Moves
- Abilities
- Items
- Trainers
- NPCs
- Locations
- Games
- Other supported knowledge domains

Both search experiences shall be generated from the same canonical search index to ensure consistency, accuracy, and maintainability.

---

# Rationale

Quick Search and Search Explorer solve different user problems.

Quick Search minimizes interaction by providing immediate navigation.

Search Explorer encourages discovery by presenting a broader view of the knowledge graph.

Generating both experiences from the same canonical search index avoids duplicated logic, ensures consistent results, and allows improvements to search quality to benefit both interfaces simultaneously.

---

# Consequences

## Benefits

- Optimizes search for both navigation and exploration.
- Eliminates duplicated search logic.
- Ensures consistent search results across the application.
- Improves discoverability of Pokémon knowledge.
- Supports future search enhancements without redesigning the architecture.

### Trade-offs

- Requires multiple generated datasets optimized for different search experiences.
- Search generation becomes more sophisticated due to support for multiple interfaces.

### Long-Term Impact

Future search capabilities—including semantic search, AI-assisted search, advanced filtering, personalized ranking, and additional search interfaces—can extend the shared search index while preserving consistent behavior across the platform.

---

# Related Documentation

- DATABASE_SCHEMA.md
- DATASETS.md
- API_DOCUMENTATION.md
- FEATURES.md
- BACKEND_ARCHITECTURE.md

---

# Related Decisions

- ADR-012 — Feature-Oriented Generated Database
- ADR-016 — Page-Oriented Generated Profiles
- ADR-025 — World Graph and Interactive Maps
- ADR-028 — Layered Generator Dependencies

---

# Date Approved

2026