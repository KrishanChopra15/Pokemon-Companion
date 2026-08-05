# ADR-035 — Isolated Build Workspace

## Status

Approved

---

# Purpose

Define how generation is performed without risking corruption of the active generated database.

This decision establishes an isolated build workspace where all generation and validation occur before any generated data is promoted to become the active database.

---

# Context

Generating the Pokémon Companion database involves many interconnected scripts and validation stages.

If generation writes directly into the active generated database, failures occurring midway through the process could leave the application with:

- Partially generated datasets
- Inconsistent generated data
- Missing files
- Validation failures
- Corrupted application state

The architecture therefore requires generation to occur independently of the active database until the build has been fully validated.

---

# Decision

All generation shall occur within an isolated temporary workspace.

The active generated database shall remain completely unchanged throughout generation and validation.

Only after the entire generation pipeline completes successfully and every required validation passes shall the generated workspace be promoted to replace the active generated database.

If generation or validation fails:

- The active generated database remains unchanged.
- Build reports are still generated.
- The failed workspace may optionally be retained for debugging through a developer configuration setting.

Promotion from the temporary workspace to the active generated database shall occur as a single atomic operation whenever practical.

---

# Rationale

Separating generation from deployment guarantees that users and developers never interact with partially generated data.

The isolated workspace allows every stage of the build pipeline to execute safely while ensuring that validation is completed before any generated data becomes available.

Retaining failed workspaces when requested also improves debugging without affecting the integrity of the active database.

---

# Consequences

## Benefits

- Prevents partially generated databases.
- Guarantees atomic publication of generated data.
- Improves build reliability.
- Simplifies debugging through optional workspace retention.
- Protects the active generated database from build failures.

### Trade-offs

- Requires temporary storage for the isolated workspace.
- Promotion logic must ensure atomic replacement where supported.

### Long-Term Impact

Future improvements—including incremental builds, parallel generation, distributed build systems, and deployment automation—can build upon the isolated workspace model without changing the project's core generation architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATA_ARCHITECTURE.md
- DATASETS.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-030 — Live Build Dashboard
- ADR-034 — Build Reporting System
- ADR-036 — Database Change Reporting
- ADR-039 — Dry Run Support

---

# Date Approved

2026