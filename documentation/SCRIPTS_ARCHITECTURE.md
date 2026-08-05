# Scripts Architecture

## Purpose

This document defines the architecture of the Pokémon Companion Scripts system.

The Scripts system is responsible for acquiring, transforming, validating, and generating the canonical Pokémon Companion database.

It serves as the bridge between external Pokémon data sources and the generated datasets consumed by the backend.

The Scripts system is designed to remain independent of the backend, frontend, and user interface while providing a maintainable, scalable, and reproducible data generation pipeline.

---

## Scope

This document defines:

- The responsibilities of the Scripts system.
- Script organization.
- Domain organization.
- Build workflow.
- Validation workflow.
- Shared utilities.
- Development principles.
- Future extensibility.

This document does not define database schemas, API endpoints, backend implementation, or frontend behavior. Those responsibilities are documented separately within the appropriate project documentation.

---

# Responsibilities

The Scripts system is responsible for:

- Downloading external Pokémon data.
- Transforming raw data into canonical project models.
- Building generated datasets.
- Validating generated datasets.
- Providing developer inspection tools.
- Producing reproducible database builds.

The Scripts system should remain independent of backend and frontend implementation details.

---

# Dependencies

The Scripts system depends upon:

- Project Documentation
- Official Sources
- Raw Sources
- Canonical Datasets
- Relationship Datasets
- Validation Framework

The Scripts system consumes upstream data but does not define canonical Pokémon knowledge itself.

Changes to canonical schemas, dataset definitions, or validation standards should be reflected within the corresponding build scripts where appropriate.

---

# Design Goals

The Scripts system should:

- Support every main-series Pokémon game.
- Produce deterministic builds.
- Remain easy to understand.
- Minimize unnecessary complexity.
- Organize scripts around Pokémon domains.
- Encourage reusable utilities.
- Support future data sources.
- Scale without requiring architectural redesign.

---

# Core Principles

## Documentation First

The documentation defines the architecture.

Scripts implement the documented architecture rather than defining it.

Whenever implementation decisions conflict with documentation, the documentation should be reviewed before code changes are made.

---

## Domain-Based Organization

Scripts are organized around Pokémon domains rather than implementation details.

Examples include:

- Pokémon
- Species
- Moves
- Abilities
- Evolutions
- Learnsets
- Forms
- Items
- Locations

This organization keeps related functionality together and reduces cognitive overhead.

---

## One Responsibility Per File

Every script has a single clearly defined responsibility.

Examples include:

- Download
- Build
- Validate
- Inspect

Files should avoid mixing unrelated responsibilities.

---

## Predictable Structure

Every domain should follow the same internal organization whenever practical.

A developer familiar with one domain should immediately understand every other domain.

---

## Readability Over Cleverness

The Scripts system prioritizes readability and maintainability over minimizing line count or introducing unnecessary abstraction.

Code should be understandable by contributors with varying levels of experience.

---

## Shared Means Shared

Reusable functionality belongs within shared utilities only when it is genuinely reused across multiple domains.

Domain-specific logic should remain within the domain that owns it.

---

# Script Lifecycle

Every domain follows the same conceptual workflow.

Download
   │
   ▼
Build
   │
   ▼
Validate
   │
   ▼
Inspect

---

## Download

Downloads external data from supported sources.

The download stage should preserve source information without introducing project-specific transformations.

---

## Build

Transforms downloaded data into Pokémon Companion's canonical datasets.

Relationship building, normalization, and dataset generation occur during this stage.

---

## Validate

Ensures generated datasets satisfy project requirements.

Validation should detect:

- Missing references
- Invalid relationships
- Duplicate entries
- Structural inconsistencies
- Schema violations

---

## Inspect

Provides developer tools for viewing, debugging, and understanding generated data.

Inspection tools should never modify datasets.

---

# Directory Structure

The Scripts system is organized by domain.

Each domain contains its own download, build, validation, and inspection scripts.

Shared functionality is centralized separately.

The overall structure is defined within the project itself and should remain consistent across every domain.

---

# Shared Utilities

Shared utilities provide reusable functionality used throughout the Scripts system.

Examples include:

- Logging
- File handling
- JSON utilities
- HTTP utilities
- Path utilities
- Common helper functions

Shared utilities should avoid containing domain-specific logic.

---

# Master Runner

The Scripts system provides a centralized execution entry point responsible for coordinating script execution.

The master runner may support:

- Complete pipeline execution.
- Individual domain execution.
- Validation.
- Inspection.
- Future incremental builds.

Execution order should remain deterministic.

---

# Output Philosophy

Scripts should produce output that is:

- Human-readable.
- Consistent.
- Colorized where appropriate.
- Easy to debug.
- Informative without being verbose.

Logs should clearly communicate progress, warnings, errors, and completion.

---

# Error Handling

Scripts should fail clearly when unrecoverable errors occur.

Errors should:

- Explain what failed.
- Explain why it failed.
- Identify the affected domain.
- Provide sufficient context for debugging.

Silent failures should be avoided.

---

# Future Expansion

The Scripts system should support future enhancements without architectural redesign.

Potential future capabilities include:

- Parallel execution.
- Incremental builds.
- Build caching.
- Dependency management.
- Continuous integration.
- Additional external data sources.

---

# Relationship to Other Systems

The Scripts system forms the bridge between project documentation and generated datasets.

Documentation

↓

Scripts

↓

Database

↓

Backend

↓

Frontend

The Scripts system implements the architecture defined by the documentation and produces the datasets consumed by the remainder of the platform.

---

# Design Philosophy

The Scripts system exists to make Pokémon Companion maintainable for many years.

Every architectural decision should prioritize:

- Clarity.
- Consistency.
- Simplicity.
- Predictability.
- Scalability.
- Maintainability.

The goal is to make the project understandable not only to experienced developers but also to contributors who are new to the project or programming in general.