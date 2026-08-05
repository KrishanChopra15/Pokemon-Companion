# ADR-034 — Build Reporting System

## Status

Approved

---

# Purpose

Define how build reports are generated, organized, and retained throughout the Pokémon Companion generation system.

This decision establishes a structured reporting system that records every execution, providing developers with a consistent history for debugging, auditing, and comparing builds.

---

# Context

Every generation task produces valuable information, including:

- Build metadata
- Execution statistics
- Warnings
- Errors
- Validation results
- Generated datasets
- Execution duration

Without standardized reports, diagnosing failures, comparing builds, and reviewing historical executions becomes significantly more difficult.

The architecture therefore requires a consistent reporting system that captures the outcome of every execution while remaining easy to navigate.

---

# Decision

Pokémon Companion shall maintain a structured reporting system with separate report histories for:

- Master Builds
- Individual Script Runs

Every execution shall generate a report regardless of whether it succeeds or fails.

Each report shall contain, where applicable:

- Execution Summary
- Build Metadata
- Warnings
- Errors
- Validation Results
- Statistics
- Execution Details
- Duration

Master Build reports provide comprehensive information covering the entire generation pipeline.

Individual Script reports provide concise information focused on the executed script.

Reports shall be organized automatically by script and timestamp.

Each report category retains only the five most recent executions.

Older reports are automatically removed according to the project's retention policy.

---

# Rationale

Standardized reporting ensures that every execution leaves an audit trail.

Separating Master Build reports from Individual Script reports keeps information appropriately scoped while making reports easier to browse.

Automatic retention prevents report directories from growing indefinitely while preserving enough history for debugging and regression analysis.

Generating reports for both successful and failed executions ensures failures remain fully diagnosable.

---

# Consequences

## Benefits

- Provides a complete execution history.
- Simplifies debugging and regression analysis.
- Standardizes reporting across the generation system.
- Prevents uncontrolled report accumulation.
- Ensures failures are documented as thoroughly as successful builds.

### Trade-offs

- Report generation introduces a small amount of additional processing.
- Developers may occasionally need archived reports that have already been removed by the retention policy.

### Long-Term Impact

Future reporting enhancements—including performance trends, historical comparisons, automated diagnostics, and build analytics—can extend the existing reporting framework without changing the overall architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATASETS.md
- DEVELOPMENT_ROADMAP.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-030 — Live Build Dashboard
- ADR-031 — Generated File Provenance
- ADR-035 — Isolated Build Workspace
- ADR-036 — Database Change Reporting

---

# Date Approved

2026