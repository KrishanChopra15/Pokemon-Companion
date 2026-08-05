# ADR-014 — Preservation of Official Game Data

## Status

Approved

---

# Purpose

Define how Pokémon Companion preserves official Pokémon game data throughout its data pipeline.

This decision establishes that the platform acts as both a trainer-focused companion and a historical archive by preserving all authoritative information extracted from official game assets.

---

# Context

Official Pokémon games contain more information than what is normally presented to players.

This includes:

- Unused content
- Hidden data
- Debug information
- Prototype content
- Regional differences
- Historical mechanics

While most application features should present only relevant information to trainers, permanently discarding official data during extraction or normalization would reduce the project's historical accuracy and limit future features.

The architecture therefore requires a clear separation between data preservation and data presentation.

---

# Decision

The canonical database shall preserve all authoritative information extracted from official game assets, including unused, hidden, and debug content.

Application features determine the visibility of this information rather than removing it from the canonical database.

The default application experience presents only official released content appropriate for most trainers.

Advanced features, research tools, and future application modes may expose preserved historical or development data without modifying the underlying canonical database.

---

# Rationale

Preserving official data ensures Pokémon Companion remains a faithful representation of Pokémon history while supporting future features that may require information not normally visible during gameplay.

Separating preservation from presentation allows the project to provide a clean trainer experience without sacrificing completeness or historical accuracy.

This approach also prevents irreversible data loss during extraction and normalization.

---

# Consequences

## Benefits

- Preserves complete official Pokémon knowledge.
- Supports historical research and archival features.
- Enables future advanced application modes.
- Prevents permanent loss of official data.
- Separates data storage from user experience.

### Trade-offs

- Canonical datasets contain information that is not exposed in the default application.
- Additional filtering is required when generating trainer-facing datasets.

### Long-Term Impact

Future Pokémon generations, prototype discoveries, regional revisions, and historical research can be incorporated without redesigning the data model or rethinking preservation principles.

---

# Related Documentation

- DATA_ARCHITECTURE.md
- DATASETS.md
- DATABASE_SCHEMA.md
- KNOWLEDGE_MODEL.md

---

# Related Decisions

- ADR-006 — Pipeline Traceability
- ADR-007 — Lossless Extraction
- ADR-009 — Canonical Entities and Historical Snapshots
- ADR-022 — Official and Development Timelines

---

# Date Approved

2026