# Reader Architecture

## Purpose

Readers provide a platform-independent interface for accessing official Pokémon game data.

Each reader understands the storage format of a specific platform and exposes a common interface to the rest of the extraction pipeline.

The goal of the Reader subsystem is to isolate platform-specific logic from data extraction logic.

---

# Responsibilities

Readers are responsible for:

- Opening official game sources.
- Understanding platform-specific file formats.
- Reading files from the source.
- Providing access to raw game data.
- Exposing a common interface across all supported platforms.

---

# Non-Responsibilities

Readers are **not** responsible for:

- Discovering source files.
- Identifying supported platforms.
- Extracting Pokémon data.
- Normalizing data.
- Building databases.
- Validating extracted data.

---

# Design Principles

The Reader subsystem follows these principles:

- One reader per platform.
- Platform-specific implementation behind a common interface.
- Lossless access to official game data.
- Read-only interaction with source files.
- No extraction logic.
- No game-specific business logic.

---

# Reader Lifecycle

The Reader subsystem follows this workflow:

1. Receive a discovered source.
2. Select the appropriate reader.
3. Open the source.
4. Read platform-specific data.
5. Return raw data to the extraction pipeline.

---

# Supported Platforms

The Reader architecture is designed to support:

- Game Boy
- Game Boy Color
- Game Boy Advance
- Nintendo DS
- Nintendo 3DS
- Nintendo Switch
- Official Event Distributions

Additional platforms may be added without affecting existing readers.

---

# Reader Interface

Every reader provides a consistent interface regardless of platform.

A reader should be capable of:

- Opening a source.
- Reading metadata.
- Enumerating available files.
- Reading individual files.
- Closing the source.

Individual readers may perform these operations differently internally, but their public interface remains consistent.

---

# Reader Factory

Reader selection is handled by the Reader Factory.

The factory receives a discovered source and returns the appropriate reader implementation for that platform.

Readers do not select themselves.

---

# Relationships

Configuration Manager

↓

Provides project configuration.

Source Manager

↓

Discovers official game sources.

Reader Factory

↓

Selects the correct reader.

Reader

↓

Provides access to raw platform data.

Extractor

↓

Consumes raw platform data.

---

# Future Extensions

Future readers may support:

- Additional Nintendo platforms.
- Patch files.
- DLC content.
- Development builds.
- Debug builds.
- Additional official distributions.

The architecture is designed to allow new readers without modifying existing reader implementations.

---

# Related Documentation

- CONFIGURATION_MANAGER.md
- SOURCE_MANAGER.md
- SCRIPTS_ARCHITECTURE.md
- REPOSITORY_STRUCTURE.md

---

# Related Architectural Decisions

(To be added as future ADRs are approved.)