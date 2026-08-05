# ADR-007 — Lossless Extraction

## Status

Approved

---

# Purpose

Define the responsibility of the extraction layer within the Pokémon Companion data pipeline.

This decision establishes that extracted data is a faithful, lossless representation of official Pokémon game data and serves as the immutable foundation of every subsequent architectural layer.

---

# Context

The extraction layer is the first stage of the Pokémon Companion data pipeline.

During extraction, official game assets are converted into machine-readable datasets that are later normalized, validated, and transformed into canonical knowledge.

Allowing interpretation, correction, normalization, or optimization during extraction would permanently alter the original data and obscure the distinction between official game information and project-generated knowledge.

A clear architectural boundary was therefore required to preserve the integrity of the extraction layer.

---

# Decision

The extraction layer shall produce a lossless, one-to-one representation of the official game data.

Its responsibility is limited to faithfully exposing the contents of the source assets without interpretation, normalization, correction, optimization, or enrichment.

All transformations beyond extraction shall occur in later stages of the data pipeline.

---

# Rationale

Separating extraction from interpretation preserves the integrity of official Pokémon data while ensuring that every later architectural layer remains reproducible.

Because extracted data remains unchanged, improvements to normalization, validation, or generation can always be applied by regenerating downstream datasets rather than reinterpreting source data.

This separation also supports traceability by making it possible to distinguish extraction issues from normalization or generation issues.

The extraction layer functions as an archival representation of the official games rather than an application database.

---

# Consequences

## Benefits

- Preserves the original structure of official game data.
- Establishes a clear separation between extraction and interpretation.
- Supports deterministic regeneration of downstream datasets.
- Improves debugging by isolating extraction from later processing stages.
- Reinforces long-term traceability throughout the data pipeline.

### Trade-offs

- Extracted datasets may contain inconsistencies or structures that are not convenient for direct application use.
- Additional processing is required during later pipeline stages.
- Extraction prioritizes accuracy over usability.

### Long-Term Impact

This decision establishes the extraction layer as a permanent archival foundation of Pokémon Companion.

Future extraction scripts, supported games, and source formats should preserve official data faithfully while delegating all interpretation and transformation to later architectural layers.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATASETS.md
- DATABASE_SCHEMA.md
- SCRIPTS_ARCHITECTURE.md

---

# Related Decisions

- ADR-002 — Multi-layer Database Pipeline
- ADR-005 — Raw Database Game Organization
- ADR-006 — Pipeline Traceability
- ADR-008 — Normalization and Canonical Construction

---

# Date Approved

2026