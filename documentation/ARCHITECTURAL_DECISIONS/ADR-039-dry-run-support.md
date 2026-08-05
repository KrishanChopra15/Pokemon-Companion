# ADR-039 — Dry Run Support

## Status

Approved

---

# Purpose

Define how the Pokémon Companion generation system supports safe execution planning without modifying project data.

This decision establishes a Dry Run mode that allows developers to verify configuration, dependencies, and execution plans before performing a real build.

---

# Context

Generation scripts often perform large numbers of file operations, database generation steps, and validation tasks.

Developers frequently need to answer questions such as:

- Will this script run successfully?
- Which datasets will be generated?
- Are all dependencies available?
- Which validations will execute?
- What outputs will be produced?

Running a full build simply to answer these questions is inefficient and may perform unnecessary work.

The project therefore requires a Dry Run mode that exercises the generation pipeline without making permanent changes.

---

# Decision

All major V2 scripts and the Master Build shall support a **Dry Run** mode.

Dry Run shall execute the normal build workflow up to the point where permanent modifications would occur.

Dry Run may perform:

- Initialization
- Configuration loading
- Dependency analysis
- Input validation
- Execution planning
- Generator selection
- Output planning

Dry Run shall report, where applicable:

- Planned actions
- Expected outputs
- Potential issues
- Dependency status
- Estimated work

Dry Run shall not:

- Modify datasets
- Write generated output
- Replace the active database
- Delete files
- Perform irreversible operations

The Dry Run execution path should remain as close as practical to the normal execution path to maximize confidence in its results.

---

# Rationale

A realistic Dry Run allows developers to verify builds before committing time and resources to generation.

Using the same execution path as a normal build reduces the risk that Dry Run behavior diverges from real execution, improving reliability while supporting debugging and development workflows.

---

# Consequences

## Benefits

- Detects problems before generation begins.
- Improves developer confidence.
- Simplifies debugging.
- Supports safer development workflows.
- Reduces unnecessary generation work.

### Trade-offs

- Dry Run functionality must be maintained alongside normal execution.
- Certain runtime behaviors cannot be fully simulated without actual generation.

### Long-Term Impact

Future enhancements—including build previews, dependency visualization, execution estimation, and IDE integration—can extend Dry Run capabilities without changing the underlying generation architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DEVELOPMENT_ROADMAP.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-030 — Live Build Dashboard
- ADR-033 — Self-Contained Scripts
- ADR-035 — Isolated Build Workspace
- ADR-037 — Shared Script Architecture

---

# Date Approved

2026