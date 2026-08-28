# Configuration Manager

## Purpose

The Configuration Manager provides a single, validated source of configuration for Pokémon Companion development tools and supporting subsystems.

It centralizes project configuration, removes user-specific paths and environment assumptions from implementation code, and ensures that scripts and pipeline components operate using a consistent configuration model.

The Configuration Manager is responsible for configuration only. It does not perform the work of the systems that consume the configuration.

---

# Responsibilities

The Configuration Manager is responsible for:

- Loading project configuration.
- Resolving configuration sources.
- Applying default configuration values.
- Validating configuration values.
- Normalizing configured paths and values.
- Providing validated configuration to consuming subsystems.
- Preventing invalid configuration from reaching dependent systems.
- Acting as the single source of truth for configurable project settings.
- Providing a consistent configuration interface across development environments.

---

# Non-Responsibilities

The Configuration Manager is **not** responsible for:

- Discovering source files.
- Reading ROMs.
- Extracting game data.
- Parsing extracted data.
- Generating datasets.
- Creating build outputs.
- Managing pipeline execution.
- Performing validation of generated Pokémon data.
- Managing application business logic.
- Managing user accounts or trainer data.
- Performing filesystem operations beyond configuration-related access.

The Configuration Manager provides configuration to these systems when required but does not perform their responsibilities.

---

# Design Principles

The Configuration Manager follows these principles:

## Single Source of Truth

Configuration should have one authoritative representation.

Subsystems should obtain configurable values through the Configuration Manager rather than maintaining independent configuration values.

---

## No User-Specific Paths in Implementation Code

Implementation code should not contain hardcoded paths that depend on an individual development environment.

Paths should be derived from project configuration and resolved consistently.

---

## Platform Independence

Configuration should avoid unnecessary assumptions about the operating system or development environment.

Where platform-specific behavior is required, it should be handled by the Configuration Manager or an appropriate lower-level utility rather than duplicated throughout the project.

---

## Configuration as Data

Configuration should be represented as data rather than embedded directly into application logic.

This allows configuration to change without requiring unrelated implementation changes.

---

## Validate Before Use

Configuration must be validated before it is provided to dependent subsystems.

Invalid configuration should prevent the affected process from continuing rather than producing unpredictable downstream failures.

---

## Fail Fast

If required configuration is missing, invalid, or inconsistent, the Configuration Manager should report the problem as early as possible.

Errors should identify the affected configuration value and provide enough information to correct the problem without exposing unnecessary internal details.

---

## Immutable Runtime Configuration

Once configuration has been loaded, normalized, and validated, the resulting configuration object should be treated as immutable.

Subsystems should consume configuration rather than modifying the shared configuration state.

---

## Explicit Configuration

Configuration values should have clear names and documented purposes.

Implicit behavior based on undocumented environment assumptions should be avoided.

---

# Configuration Workflow

The Configuration Manager performs the following workflow:

```text
Configuration Sources
        ↓
Load Configuration
        ↓
Apply Defaults
        ↓
Resolve Values
        ↓
Normalize Configuration
        ↓
Validate Configuration
        ↓
Immutable Configuration
        ↓
Consuming Subsystems
```

The standard workflow is:

1. Load project configuration.
2. Resolve available configuration sources.
3. Apply default values where appropriate.
4. Resolve project-relative paths.
5. Normalize configuration values.
6. Validate required configuration.
7. Reject invalid configuration.
8. Return an immutable configuration object.

---

# Configuration Sources

Configuration may be provided by multiple sources, including:

- Local configuration files.
- Default project configuration.
- Environment variables (future).
- Command-line overrides (future).

Configuration sources should follow a documented precedence order when multiple sources provide the same value.

Regardless of the source, all configuration passes through the Configuration Manager before being used by the application or development tooling.

The Configuration Manager should prevent individual subsystems from implementing their own independent configuration resolution rules.

---

# Configuration Scope

Configuration should be divided according to responsibility.

Examples include:

- Project paths.
- Dataset paths.
- Source paths.
- Output paths.
- Cache paths.
- Temporary paths.
- Logging settings.
- Validation settings.
- Build settings.

Configuration should only be added when a subsystem has a genuine requirement for the value.

Avoid introducing configuration options merely for speculative future functionality.

---

# Current Configuration

The initial implementation supports:

- Sources directory.

The configured sources directory provides the base location required by development and data-processing tools that operate on project source data.

Additional configuration options should be introduced as new subsystems require them.

---

# Future Configuration

Potential future configuration includes:

- Cache directory.
- Output directory.
- Temporary directory.
- Generated dataset directory.
- Asset directory.
- Logging configuration.
- Build configuration.
- Validation configuration.
- Dataset generation configuration.
- Environment-specific configuration.
- Command-line configuration overrides.

Future configuration should be added only when the corresponding subsystem is implemented or when a documented architectural requirement exists.

---

# Path Management

Project paths should be resolved through configuration rather than hardcoded throughout individual scripts.

Where practical:

- Project-relative paths should remain relative to the project configuration.
- Absolute paths should be resolved only when required.
- User-specific paths should remain outside implementation logic.
- Path resolution should be consistent across supported environments.
- Invalid or inaccessible required paths should be reported during configuration validation.

The Configuration Manager should provide normalized paths to consumers so that individual subsystems do not need to implement their own path-resolution rules.

---

# Validation

Configuration validation should occur before dependent systems begin their work.

Validation should verify:

- Required values are present.
- Values use the expected type.
- Paths use valid formats.
- Required directories or files exist when existence is part of the configuration contract.
- Configuration values do not conflict with one another.
- Unsupported configuration values are rejected when appropriate.

Configuration validation is distinct from Pokémon data validation.

The Configuration Manager validates whether configuration is usable. Data validation systems validate the correctness of generated Pokémon datasets.

---

# Error Handling

Configuration errors should fail early and clearly.

Errors should identify:

- The configuration value involved.
- The reason validation failed.
- Whether the value is missing, malformed, inaccessible, or conflicting.
- The expected configuration when practical.

Example:

```text
Configuration Error

sourcesDirectory is required but was not provided.

Provide a valid project source directory in the project configuration.
```

Configuration errors should prevent dependent processes from continuing with invalid state.

---

# Configuration Consumers

Subsystems should receive validated configuration from the Configuration Manager.

Examples of potential consumers include:

- Source Manager.
- Data extraction tools.
- Dataset generators.
- Validation systems.
- Build systems.
- Asset processors.
- Development scripts.

Consumers should not independently reload or reinterpret the primary configuration source unless explicitly required by their documented responsibility.

---

# Configuration Lifecycle

The Configuration Manager should normally operate once during application or tool initialization.

```text
Initialize
    ↓
Load Configuration
    ↓
Validate Configuration
    ↓
Create Immutable Configuration
    ↓
Inject Configuration
    ↓
Run Subsystem
    ↓
Shutdown
```

Configuration should not be repeatedly reconstructed during normal execution unless a documented runtime reload mechanism is introduced.

---

# Testing Requirements

The Configuration Manager should be tested independently from the systems that consume it.

Tests should cover:

- Valid configuration.
- Missing required configuration.
- Invalid configuration types.
- Invalid paths.
- Missing directories where required.
- Default values.
- Configuration precedence.
- Path normalization.
- Immutable configuration behavior.
- Conflicting configuration values.

Configuration tests should not require the full Pokémon data-generation pipeline to execute.

---

# Future Expansion

The Configuration Manager is expected to remain small and focused.

Future additions should extend configuration capabilities without turning the manager into a general-purpose project orchestration system.

Potential future capabilities include:

- Environment-specific configuration.
- Configuration schemas.
- Environment variable support.
- Command-line overrides.
- Configuration diagnostics.
- Configuration versioning.
- Development and production configuration profiles.

These capabilities should be introduced only when supported by an actual project requirement.

---

# Related Documentation

- `REPOSITORY_STRUCTURE.md`
- `SCRIPTS_ARCHITECTURE.md`
- `SOURCE_MANAGER.md`
- `DATA_GENERATION_PIPELINE.md`
- `VALIDATION_ARCHITECTURE.md`

---

# Related Architectural Decisions

Architectural decisions affecting configuration management should be documented through the project's ADR process.

Examples may include:

- Configuration file format.
- Configuration precedence.
- Environment variable support.
- Path resolution strategy.
- Runtime configuration immutability.

(To be added as future ADRs are approved.)

---

# Summary

The Configuration Manager provides a centralized and validated configuration boundary for Pokémon Companion development tools and supporting subsystems.

It ensures that:

- Configuration has a single source of truth.
- User-specific paths remain outside implementation code.
- Configuration is validated before use.
- Project paths are resolved consistently.
- Dependent systems receive immutable configuration.
- Configuration responsibilities remain separate from data processing and pipeline execution.

The Configuration Manager should remain focused on configuration and should not become responsible for the operations performed by the systems that consume it.
