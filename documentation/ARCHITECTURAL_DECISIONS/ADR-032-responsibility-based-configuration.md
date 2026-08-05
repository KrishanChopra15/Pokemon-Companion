# ADR-032 — Responsibility-Based Configuration

## Status

Approved

---

# Purpose

Define how project configuration is organized throughout Pokémon Companion.

This decision establishes a responsibility-based configuration system that balances simplicity, discoverability, and maintainability by organizing configuration into a small number of focused files.

---

# Context

As Pokémon Companion grows, different parts of the build system require configuration for areas such as:

- Project paths
- Build behavior
- Downloads
- Validation
- Terminal output
- Logging
- Caching
- Environment settings

A single monolithic configuration file would become increasingly difficult to navigate and maintain.

Conversely, creating dozens of tiny configuration files would introduce unnecessary fragmentation and make the project harder to understand.

The architecture therefore requires a balanced configuration strategy.

---

# Decision

Configuration shall be organized into a small collection of responsibility-based configuration files.

Each configuration file owns one related domain of project configuration.

Examples include:

- Paths
- Build Behavior
- Downloads
- Validation
- Terminal Output
- Logging
- Environment
- Caching

Configuration responsibilities shall remain clearly separated without excessive fragmentation.

New configuration files should be introduced only when an existing responsibility grows beyond a reasonable level of complexity.

---

# Rationale

Responsibility-based configuration strikes a balance between simplicity and modularity.

Developers can quickly locate configuration related to a particular concern without navigating an oversized configuration file or searching through dozens of unrelated files.

Keeping each file focused also encourages clear ownership and reduces accidental coupling between unrelated configuration domains.

---

# Consequences

## Benefits

- Improves discoverability.
- Avoids monolithic configuration files.
- Prevents unnecessary fragmentation.
- Encourages clear ownership of configuration.
- Simplifies future maintenance.

### Trade-offs

- Developers must understand which configuration file owns a given responsibility.
- New configuration domains require thoughtful organization to avoid overlap.

### Long-Term Impact

As Pokémon Companion expands, additional configuration domains can be introduced without disrupting existing organization, preserving a predictable and scalable configuration architecture.

---

# Related Documentation

- SCRIPTS_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- COLLABORATION_CONTRACT.md

---

# Related Decisions

- ADR-003 — Database Layer Organization
- ADR-029 — Hybrid Generation Workflow
- ADR-033 — Self-Contained Scripts
- ADR-037 — Shared Script Architecture

---

# Date Approved

2026