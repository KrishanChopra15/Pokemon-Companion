# ADR-028 — Layered Generator Dependencies

## Status

Approved

---

# Purpose

Define how generators depend upon one another within the Pokémon Companion build pipeline.

This decision establishes a layered dependency model that ensures generated datasets remain deterministic, maintainable, and free from circular dependencies.

---

# Context

Pokémon Companion produces many generated datasets for different purposes, including:

- Lookup tables
- Search indexes
- Page profiles
- Navigation datasets
- AI datasets
- Analytical datasets
- Optimization caches

Some generators naturally depend on the output of others.

Without clear dependency rules, generators could become tightly coupled, create circular dependencies, or duplicate expensive work.

The architecture therefore requires a structured dependency model that governs how generators consume data produced earlier in the build pipeline.

---

# Decision

Generators shall follow a layered dependency model.

Three generator layers are defined:

### Foundation Generators

Foundation Generators read only from the Canonical Database and Relationship Datasets.

They never depend upon generated output.

Typical examples include:

- Lookup datasets
- Navigation indexes
- Relationship views
- Core search indexes

---

### Experience Generators

Experience Generators may consume Foundation datasets to assemble page-oriented experiences optimized for the application.

Typical examples include:

- Pokémon Profiles
- Move Profiles
- Trainer Profiles
- Game Profiles
- Interactive map datasets

---

### Optimization Generators

Optimization Generators may consume Experience datasets to accelerate advanced features.

Typical examples include:

- AI datasets
- Recommendation indexes
- Search optimization
- Cache datasets
- Analytical summaries

---

Dependencies shall always flow downward through these layers.

Circular dependencies are not permitted.

No generator may depend on another generator from the same or a higher layer.

---

# Rationale

A layered dependency model creates a predictable generation pipeline.

Foundation datasets remain reusable building blocks.

Experience datasets focus on assembling application-ready views.

Optimization datasets improve performance without becoming part of the application's canonical architecture.

Restricting dependency direction prevents circular generation chains while simplifying maintenance, debugging, and future expansion.

---

# Consequences

## Benefits

- Eliminates circular generator dependencies.
- Produces a predictable build pipeline.
- Encourages reusable generated datasets.
- Simplifies debugging and dependency analysis.
- Supports future optimization without architectural changes.

### Trade-offs

- Some generators must be split into multiple stages.
- Dependency validation becomes part of the build system.

### Long-Term Impact

Future generated datasets can be introduced by assigning them to the appropriate layer, allowing the generation pipeline to expand while preserving deterministic execution and architectural consistency.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATASETS.md
- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md

---

# Related Decisions

- ADR-011 — Canonical and Generated Database Responsibilities
- ADR-012 — Feature-Oriented Generated Database
- ADR-016 — Page-Oriented Generated Profiles
- ADR-029 — Hybrid Generation Workflow

---

# Date Approved

2026