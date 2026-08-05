# Source Manager

## Purpose

The Source Manager is responsible for discovering the official Pokémon sources available to Pokémon Companion.

It provides a single entry point for locating source files while remaining independent of platform-specific readers and extraction logic.

---

# Responsibilities

The Source Manager is responsible for:

- Discovering official source files.
- Identifying the source platform from the directory structure.
- Returning discovered sources in a consistent format.
- Providing a common interface for all source readers.

---

# Does Not

The Source Manager does **not**:

- Read ROM contents.
- Validate source files.
- Parse binary formats.
- Extract Pokémon data.
- Build the database.
- Generate application data.

These responsibilities belong to platform readers and later stages of the data pipeline.

---

# Design Principles

The Source Manager should:

- Remain platform-independent.
- Discover sources using the documented directory structure.
- Avoid assumptions based on filenames.
- Return filesystem information only.
- Act as the single source discovery component for the project.

---

# Workflow

Official Sources

↓

Source Manager

↓

Platform Readers

↓

Extractors

↓

Raw Database