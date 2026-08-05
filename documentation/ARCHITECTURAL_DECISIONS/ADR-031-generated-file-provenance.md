# ADR-031 — Generated File Provenance

## Status

Approved

---

# Purpose

Define how generated datasets identify their origin and build history.

This decision establishes a lightweight provenance system that allows every generated file to identify where it came from while centralizing detailed build information in a single build manifest.

---

# Context

Pokémon Companion generates a large number of datasets during each build.

Developers frequently need to answer questions such as:

- Which generator produced this file?
- Which build created it?
- Which schema version was used?
- Which games were included?
- When was it generated?
- Is this file compatible with the current project version?

Embedding complete build reports into every generated file would create unnecessary duplication, while storing no provenance would make debugging and auditing significantly more difficult.

The architecture therefore requires a balanced provenance strategy.

---

# Decision

Every generated file shall include lightweight provenance metadata identifying its origin.

The metadata shall include, where applicable:

- Generator
- Generation Time
- Build ID
- Schema Version
- Source Games

Detailed build information—including validation summaries, execution statistics, dependency information, and project-wide metadata—shall be stored in a central Build Manifest rather than duplicated across generated files.

Generated files shall remain self-identifying while avoiding unnecessary metadata duplication.

---

# Rationale

Lightweight provenance allows individual generated files to be understood independently while keeping detailed build information centralized.

This approach simplifies debugging, auditing, reproducibility, and compatibility checks without increasing file size unnecessarily.

Separating file-level provenance from build-level metadata also ensures that detailed reporting remains consistent and maintainable.

---

# Consequences

## Benefits

- Every generated file identifies its origin.
- Improves debugging and auditing.
- Supports reproducible builds.
- Avoids unnecessary metadata duplication.
- Simplifies compatibility verification.

### Trade-offs

- Complete build information requires consulting the central Build Manifest.
- The generation pipeline must maintain provenance metadata consistently across all generated outputs.

### Long-Term Impact

Future tooling—including build comparison, automated diagnostics, cache validation, and deployment verification—can rely on standardized provenance metadata without changing the generated dataset architecture.

---

# Related Documentation

- DATASETS.md
- SCRIPTS_ARCHITECTURE.md
- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md

---

# Related Decisions

- ADR-006 — Pipeline Traceability
- ADR-028 — Layered Generator Dependencies
- ADR-030 — Live Build Dashboard
- ADR-034 — Build Reporting System

---

# Date Approved

2026