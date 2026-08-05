# Architectural Decisions

## Purpose

The Architectural Decisions directory records the significant architectural decisions that define Pokémon Companion.

Each Architectural Decision Record (ADR) documents a single approved decision, the reasoning behind it, and its long-term impact on the project.

Together, these records provide a historical reference for why major architectural choices were made and help preserve consistency as the project evolves.

---

# Relationship to Project Documentation

Project documentation should reference the relevant ADR where appropriate rather than duplicating the decision's rationale.

The ADR remains the authoritative record of why the decision was made.

---

# Scope

Architectural Decisions are intended for significant project-wide decisions, including:

- Architecture
- Data modeling
- Database design
- Build systems
- Documentation strategy
- APIs
- Generation pipelines
- Long-term development principles

Routine implementation details, bug fixes, and small refactorings should not be documented as Architectural Decisions.

---

# Directory Organization

Each decision is documented in its own file.

Files follow a numbered naming convention.

Example:

```text
ADR-001-database-optimized-for-consumption.md
ADR-002-multi-layer-database-pipeline.md
ADR-003-layer-organization.md
```

Decision numbers are permanent identifiers and should never be reused.

New ADRs should always receive the next available identifier. Existing identifiers should never be renumbered, even if earlier decisions are superseded or deprecated.

---

# Decision Index

The ADR directory currently contains 41 approved architectural decisions.

Decision identifiers are permanent and sequential.

Developers should locate individual decisions directly within this directory rather than maintaining a duplicated index inside this document.

---
# Decision Status

Each Architectural Decision records its current status.

Possible statuses include:

- Proposed
- Approved
- Superseded
- Deprecated

Unless otherwise noted, decisions within this directory are considered Approved.

---

# Relationship Between Decisions

Architectural Decisions are intended to remain independent whenever practical.

When one decision builds upon another, the related decision should be referenced rather than duplicated.

This preserves a clear history while avoiding unnecessary repetition.

---

# Creating New Decisions

New ADRs should be created using `_TEMPLATE.md` to ensure consistency throughout the project.

Each new decision should:

- Describe the problem or motivation.
- Record the approved decision.
- Explain the rationale behind the decision.
- Describe important consequences or trade-offs.
- Reference related Architectural Decisions where appropriate.

Architectural Decisions should be documented before implementation whenever practical, following the project's documentation-first development philosophy.

---

# Relationship to the Collaboration Contract

The process for proposing, reviewing, approving, and documenting Architectural Decisions is defined by the Collaboration Contract.

This directory serves as the permanent record of approved decisions rather than defining the decision-making process itself.

---

# Document Status

**Version:** 1.0

**Status:** Approved