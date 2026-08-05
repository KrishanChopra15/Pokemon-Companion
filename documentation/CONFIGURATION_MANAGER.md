# Configuration Manager

## Purpose

The Configuration Manager provides a single, validated source of configuration for every Pokémon Companion subsystem.

It centralizes project configuration, removes user-specific paths from the codebase, and ensures that all scripts operate using a consistent configuration model.

---

# Responsibilities

The Configuration Manager is responsible for:

- Loading project configuration.
- Applying default configuration values.
- Validating configuration.
- Providing configuration to other subsystems.
- Acting as the single source of truth for configurable project settings.

---

# Non-Responsibilities

The Configuration Manager is **not** responsible for:

- Discovering source files.
- Reading ROMs.
- Extracting game data.
- Creating build outputs.
- Managing pipeline execution.
- Performing filesystem operations beyond reading configuration.

---

# Design Principles

The Configuration Manager follows these principles:

- Single source of truth.
- No user-specific paths in implementation code.
- Platform-independent configuration.
- Configuration as data rather than code.
- Fail fast when configuration is invalid.
- Every subsystem receives validated configuration.

---

# Configuration Workflow

The Configuration Manager performs the following steps:

1. Load project configuration.
2. Apply default values.
3. Validate configuration.
4. Return an immutable configuration object.

---

# Configuration Sources

Configuration may be provided by multiple sources, including:

- Local configuration files.
- Default project configuration.
- Environment variables (future).
- Command-line overrides (future).

Regardless of the source, all configuration passes through the Configuration Manager before being used by the application.

---

# Current Configuration

The initial implementation supports:

- Sources directory

Additional configuration options will be added as new subsystems require them.

---

# Future Configuration

Examples of future configuration include:

- Cache directory
- Output directory
- Temporary directory
- Logging configuration
- Build configuration
- Validation configuration

---

# Related Documentation

- REPOSITORY_STRUCTURE.md
- SCRIPTS_ARCHITECTURE.md
- SOURCE_MANAGER.md

---

# Related Architectural Decisions

(To be added as future ADRs are approved.)