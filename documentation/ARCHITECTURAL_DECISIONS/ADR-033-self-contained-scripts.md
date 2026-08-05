# ADR-033 — Self-Contained Scripts

## Status

Approved

---

# Purpose

Define how individual scripts are structured within the Pokémon Companion generation system.

This decision establishes that every V2 script is a self-contained executable unit with a single responsibility, while a master build script coordinates execution without owning generation logic.

---

# Context

The Pokémon Companion generation pipeline consists of many independent tasks, including:

- Downloading data
- Normalization
- Validation
- Dataset generation
- Report generation
- Inspection
- Utility operations

If generation logic were centralized inside one large master script, development and debugging would become increasingly difficult as the project grows.

Conversely, completely independent scripts without orchestration would make full builds difficult to execute consistently.

The architecture therefore requires independent scripts coordinated by a lightweight execution layer.

---

# Decision

Every V2 script shall be a self-contained executable unit responsible for one clearly defined task.

Each script shall:

- Be executable independently.
- Own a single responsibility.
- Manage its own initialization and cleanup.
- Produce its own logging and reporting.
- Validate its own inputs where appropriate.

A Master Build Script shall coordinate execution of these scripts in the correct order.

The Master Build Script shall orchestrate execution only.

It shall not contain unique generation logic that exists nowhere else in the project.

Generation logic belongs exclusively to the individual scripts responsible for that domain.

---

# Rationale

Independent scripts simplify development by allowing contributors to execute, debug, and maintain individual parts of the generation pipeline without rebuilding the entire project.

Keeping orchestration separate from implementation prevents the master build from becoming a monolithic script while preserving a predictable execution order for complete builds.

This separation improves modularity, maintainability, and testability throughout the generation system.

---

# Consequences

## Benefits

- Simplifies debugging and development.
- Encourages modular, single-responsibility scripts.
- Prevents the Master Build Script from becoming overly complex.
- Enables selective execution during development.
- Improves long-term maintainability.

### Trade-offs

- Common behavior must be standardized across multiple scripts.
- Script dependencies must be coordinated by the orchestration layer.

### Long-Term Impact

Future generation stages, developer tools, and automation workflows can be added as new self-contained scripts without modifying existing generation logic, allowing the build system to scale while preserving architectural consistency.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATA_ARCHITECTURE.md
- COLLABORATION_CONTRACT.md

---

# Related Decisions

- ADR-029 — Hybrid Generation Workflow
- ADR-030 — Live Build Dashboard
- ADR-032 — Responsibility-Based Configuration
- ADR-034 — Build Reporting System
- ADR-037 — Shared Script Architecture

---

# Date Approved

2026