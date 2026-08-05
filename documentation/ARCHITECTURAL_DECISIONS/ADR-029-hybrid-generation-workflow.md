# ADR-029 — Hybrid Generation Workflow

## Status

Approved

---

# Purpose

Define how generated datasets are built during development and release.

This decision establishes a hybrid generation workflow that balances rapid development with reliable, reproducible release builds.

---

# Context

Pokémon Companion contains numerous interconnected generators.

Regenerating the entire Generated Database after every small change would significantly slow development.

Conversely, regenerating only individual datasets without periodically rebuilding everything could allow hidden dependency issues or inconsistencies to accumulate.

The architecture therefore requires separate workflows for day-to-day development and official releases.

---

# Decision

Pokémon Companion shall use a hybrid generation workflow.

### Development Workflow

During development, contributors regenerate only the domains they are actively modifying.

This enables rapid iteration while minimizing unnecessary build time.

The generation system reports downstream datasets that may be affected by the changes but does not regenerate them automatically unless explicitly requested.

---

### Release Workflow

Before every official release, the entire Generated Database shall be rebuilt from a clean state.

The release build shall:

- Regenerate every generated dataset.
- Validate every generation stage.
- Verify cross-dataset consistency.
- Confirm dependency integrity.
- Produce complete build reports.

Only a fully successful release build may become the project's official generated database.

---

# Rationale

Development and release builds have different objectives.

Development prioritizes speed, allowing contributors to focus on the domains they are actively modifying.

Release builds prioritize correctness, ensuring the published database is completely regenerated, validated, and internally consistent.

Separating these workflows improves developer productivity without sacrificing build reliability.

---

# Consequences

## Benefits

- Greatly reduces development build times.
- Encourages rapid iteration.
- Preserves deterministic release builds.
- Detects dependency issues before publication.
- Improves overall build reliability.

### Trade-offs

- Developers remain responsible for regenerating additional datasets when needed.
- Release builds require more time than development builds.

### Long-Term Impact

As Pokémon Companion grows, increasingly complex generation pipelines can be introduced without slowing everyday development, while official releases continue to provide a fully reproducible and validated database.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATASETS.md
- DATA_ARCHITECTURE.md
- DEVELOPMENT_ROADMAP.md

---

# Related Decisions

- ADR-028 — Layered Generator Dependencies
- ADR-030 — Live Build Dashboard
- ADR-034 — Build Reporting System
- ADR-035 — Isolated Build Workspace

---

# Date Approved

2026