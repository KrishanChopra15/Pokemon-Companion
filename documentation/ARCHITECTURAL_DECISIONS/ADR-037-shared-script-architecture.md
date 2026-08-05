# ADR-037 — Shared Script Architecture

## Status

Approved

---

# Purpose

Define a consistent architectural template for every V2 script while allowing each script to implement its own domain-specific processing logic.

This decision establishes a predictable structure across the entire Scripts system, improving readability, maintainability, onboarding, and long-term consistency.

---

# Context

As Pokémon Companion grows, the number of build scripts will increase significantly across multiple domains.

Without a shared architectural structure, individual scripts may evolve different initialization patterns, logging systems, configuration loading, reporting styles, and error handling approaches, making the codebase harder to understand and maintain.

The project therefore requires every script to follow a common architectural template while preserving flexibility where domain logic differs.

---

# Decision

Every V2 script shall follow a shared architectural template.

Each script should implement consistent sections for:

- Initialization
- Configuration loading
- Logging
- Progress reporting
- Core processing
- Validation (where applicable)
- Error handling
- Report generation
- Cleanup

Only the core processing logic should vary according to the script's responsibility.

Shared infrastructure should remain consistent across every script to provide a predictable developer experience while avoiding unnecessary structural rigidity.

---

# Rationale

A shared script architecture reduces cognitive overhead by ensuring that every script follows familiar patterns.

Developers can quickly understand any script regardless of its domain because supporting functionality appears in predictable locations, while domain-specific logic remains clearly isolated.

This balance improves maintainability without sacrificing flexibility.

---

# Consequences

## Benefits

- Creates a predictable structure across all scripts.
- Improves readability and developer onboarding.
- Simplifies maintenance and debugging.
- Encourages reuse of shared infrastructure.
- Keeps domain-specific logic clearly isolated.

### Trade-offs

- Some scripts may include template sections that perform minimal work.
- Minor architectural constraints are introduced to preserve consistency.

### Long-Term Impact

Future tooling—including script generators, automated validation, shared testing utilities, and developer documentation—can assume a consistent script structure across the entire Scripts system.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- COLLABORATION_CONTRACT.md

---

# Related Decisions

- ADR-032 — Responsibility-Based Configuration
- ADR-033 — Self-Contained Scripts
- ADR-034 — Build Reporting System
- ADR-038 — Layered Script Documentation
- ADR-039 — Dry Run Support

---

# Date Approved

2026