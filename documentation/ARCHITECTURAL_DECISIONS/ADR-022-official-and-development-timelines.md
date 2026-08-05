# ADR-022 — Official and Development Timelines

## Status

Approved

---

# Purpose

Define how Pokémon Companion preserves both official and unreleased Pokémon content without compromising the standard trainer experience.

This decision establishes separate Official and Development Timelines within the canonical knowledge graph, allowing historical and prototype content to coexist while remaining independently accessible.

---

# Context

Throughout Pokémon's history, numerous assets have existed outside officially released gameplay.

Examples include:

- Prototype Pokémon
- Beta maps
- Debug content
- Unused graphics
- Development mechanics
- Unreleased events
- Internal test data
- Cut features

These assets are historically valuable and should be preserved for research and archival purposes.

However, exposing them alongside official gameplay by default would create confusion for most trainers and blur the distinction between released and unreleased content.

The architecture therefore requires a clear separation between official history and development history.

---

# Decision

Pokémon Companion shall preserve separate Official and Development Timelines within the canonical database.

The Official Timeline contains content that was officially released through Pokémon games and related official distributions.

The Development Timeline contains historical development material, including prototype, beta, debug, unused, and other unreleased content extracted from official game assets.

The standard application experience shall present only Official Timeline content by default.

Advanced application modes, research tools, and archival features may expose Development Timeline content without modifying the underlying canonical database.

---

# Rationale

Separating official and development timelines allows Pokémon Companion to remain approachable for everyday trainers while preserving valuable historical information for researchers and enthusiasts.

This distinction maintains historical integrity, avoids confusing users, and ensures that archival data remains available without affecting normal application behavior.

The separation also reinforces the project's commitment to preserving authoritative Pokémon knowledge without discarding development history.

---

# Consequences

## Benefits

- Preserves official and historical development content.
- Prevents unreleased material from appearing in the default experience.
- Supports research and archival features.
- Enables future developer and historian modes.
- Maintains a clean trainer-focused interface.

### Trade-offs

- Timeline classification must be maintained during data generation.
- Generated datasets require filtering based on the active application mode.

### Long-Term Impact

Future discoveries of prototype builds, debug assets, or historical game revisions can be integrated into the Development Timeline without altering the Official Timeline or requiring architectural changes.

---

# Related Documentation

- DATASETS.md
- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- KNOWLEDGE_MODEL.md

---

# Related Decisions

- ADR-006 — Pipeline Traceability
- ADR-007 — Lossless Extraction
- ADR-014 — Preservation of Official Game Data
- ADR-021 — Game Profiles

---

# Date Approved

2026