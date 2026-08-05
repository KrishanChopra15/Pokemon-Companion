# ADR-036 — Database Change Reporting

## Status

Approved

---

# Purpose

Define how changes between successive canonical database builds are identified and reported.

This decision establishes a standardized change reporting mechanism that summarizes how the canonical database has evolved between successful builds, improving transparency, auditing, and debugging.

---

# Context

As Pokémon Companion grows, updates to extraction logic, normalization, relationship generation, or official Pokémon data may alter the canonical database.

Without structured change reporting, developers must manually compare datasets to determine:

- What changed
- Why it changed
- Which domains were affected
- Whether the changes were expected

The architecture therefore requires every successful build to include an integrated summary of database changes.

---

# Decision

Every Master Build report shall include a dedicated **Database Changes** section.

This section compares the newly generated canonical database against the previous successful build.

The report shall summarize, where applicable:

- Added records
- Modified records
- Removed records
- Significant structural changes

Where appropriate, additional details may identify the affected domains or datasets.

Database change reporting shall be integrated into the Master Build report rather than generated as a separate document.

Each build report therefore becomes the single comprehensive record describing both the execution process and the resulting database changes.

---

# Rationale

Integrating change reporting directly into the build report simplifies auditing and debugging by keeping all build information together.

Developers can immediately understand how the database evolved without running separate comparison tools or consulting additional reports.

This also supports regression analysis by making unexpected changes visible immediately after generation.

---

# Consequences

## Benefits

- Makes database evolution transparent.
- Simplifies debugging and regression analysis.
- Reduces the need for manual dataset comparisons.
- Keeps execution information and database changes together.
- Provides a complete historical record for each successful build.

### Trade-offs

- Comparing builds introduces additional processing during report generation.
- Large updates may require summarized reporting to remain readable.

### Long-Term Impact

Future enhancements—including graphical change summaries, domain-level statistics, historical trends, and automated regression detection—can extend the reporting system without changing the overall reporting architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATASETS.md
- DATABASE_SCHEMA.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-030 — Live Build Dashboard
- ADR-031 — Generated File Provenance
- ADR-034 — Build Reporting System
- ADR-035 — Isolated Build Workspace

---

# Date Approved

2026