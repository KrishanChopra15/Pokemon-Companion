# ADR-038 — Layered Script Documentation

## Status

Approved

---

# Purpose

Define a consistent documentation strategy for the Pokémon Companion Scripts system.

This decision establishes how scripts should be documented to improve readability, maintainability, onboarding, and long-term project sustainability without introducing unnecessary documentation overhead.

---

# Context

As the Scripts system expands, contributors will increasingly rely on documentation to understand script responsibilities, dependencies, and architectural intent.

Documentation that merely repeats implementation details quickly becomes outdated and provides little value, while insufficient documentation makes the project difficult to maintain.

The project therefore requires documentation that explains *why* a script exists and how it fits into the overall architecture, rather than restating what the code already expresses.

---

# Decision

Pokémon Companion shall follow a layered documentation strategy for all V2 scripts.

Every major script shall document:

- Purpose
- Responsibilities
- Inputs
- Outputs
- Dependencies
- Related documentation
- Architectural role

Major functions should explain:

- Design intent
- Architectural decisions
- Non-obvious implementation choices

Inline comments shall be reserved only for:

- Complex logic
- Unusual algorithms
- Important assumptions
- Non-obvious behavior

Documentation should explain **why** something exists rather than repeating **what** the code already expresses.

---

# Rationale

Documentation focused on architectural intent remains valuable even as implementation evolves.

Keeping high-level documentation separate from implementation details reduces duplication while making scripts easier to understand for both experienced contributors and newcomers.

Restricting inline comments to genuinely complex logic prevents unnecessary clutter and improves long-term maintainability.

---

# Consequences

## Benefits

- Improves long-term maintainability.
- Makes scripts easier to understand.
- Reduces unnecessary inline comments.
- Simplifies onboarding for new contributors.
- Keeps documentation focused on architectural intent.

### Trade-offs

- Developers must maintain documentation alongside implementation.
- Determining the appropriate level of detail requires judgment.

### Long-Term Impact

Future documentation tooling, automated documentation generation, and contributor guidelines can build upon this layered documentation strategy without requiring changes to the underlying script architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- COLLABORATION_CONTRACT.md
- CONTRIBUTING.md

---

# Related Decisions

- ADR-033 — Self-Contained Scripts
- ADR-037 — Shared Script Architecture
- ADR-039 — Dry Run Support
- ADR-041 — Documentation-First Architecture Process

---

# Date Approved

2026