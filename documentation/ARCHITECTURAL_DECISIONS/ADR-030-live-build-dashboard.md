# ADR-030 — Live Build Dashboard

## Status

Approved

---

# Purpose

Define how long-running generation processes communicate progress to developers.

This decision establishes a live, continuously updating build dashboard that provides clear visibility into the current state of the Pokémon Companion generation pipeline.

---

# Context

Generating the Pokémon Companion database may involve processing large amounts of data across multiple domains and generation stages.

Without meaningful progress reporting, developers cannot easily determine:

- Which stage is currently running.
- Whether the build is progressing normally.
- Which dataset is being processed.
- How much work remains.
- Whether the build has stalled.

Traditional console logging often produces excessive output while providing little insight into overall progress.

The architecture therefore requires a centralized, continuously updating build dashboard.

---

# Decision

The V2 generation system shall provide a live build dashboard throughout every master build and long-running generation task.

The dashboard shall update in place rather than continuously printing new log entries.

Where practical, the dashboard shall report:

- Current generation stage.
- Overall progress.
- Domain currently being processed.
- Current item being processed.
- Elapsed execution time.
- Estimated remaining time.
- Processing throughput.
- Current status.
- Warnings and errors.

Individual scripts may expose simplified dashboards appropriate to their scope while following the same reporting principles.

---

# Rationale

A live dashboard provides developers with immediate insight into build progress without overwhelming the terminal with unnecessary output.

Updating information in place keeps logs clean while allowing developers to quickly identify slow stages, bottlenecks, or failures.

Consistent reporting across all generation tasks also improves the overall development experience.

---

# Consequences

## Benefits

- Improves visibility into long-running builds.
- Makes stalled builds easier to detect.
- Reduces noisy console output.
- Provides a consistent developer experience.
- Simplifies performance monitoring and debugging.

### Trade-offs

- Requires additional infrastructure for progress reporting.
- Estimated remaining time may not always be accurate for highly variable workloads.

### Long-Term Impact

Future enhancements—including parallel generation, distributed builds, incremental generation, and richer developer tooling—can integrate with the same dashboard architecture without changing the underlying reporting model.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATASETS.md
- BACKEND_ARCHITECTURE.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-031 — Generated File Provenance
- ADR-034 — Build Reporting System
- ADR-037 — Shared Script Architecture

---

# Date Approved

2026