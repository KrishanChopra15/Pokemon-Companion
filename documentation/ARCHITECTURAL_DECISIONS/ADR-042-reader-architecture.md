# ADR-042 — Reader Architecture

## Status

Accepted

## Context

Pokémon Companion supports multiple Nintendo platforms including:

- Game Boy
- Game Boy Color
- Game Boy Advance
- Nintendo DS
- Nintendo 3DS
- Nintendo Switch

Each platform stores game data differently.

A common architecture is required to open, inspect and read platform-specific sources while preventing Pokémon-specific knowledge from leaking into low-level readers.

## Decision

Pokémon Companion adopts a layered Reader architecture.

Every platform implements a Reader derived from a shared Reader contract.

Reader responsibilities include:

- Opening sources
- Managing reader lifecycle
- Reading binary data
- Reading platform metadata
- Providing platform-level access

Readers do NOT:

- Understand Pokémon
- Parse species
- Parse moves
- Parse items
- Build the database

Pokémon knowledge belongs to the Extraction Layer.

The Reader subsystem consists of:

- Reader
- ReaderFactory
- Platform Readers
- BinaryReader
- Platform Header Specifications
- Platform Metadata objects

## Reader Lifecycle

Every reader follows the same lifecycle.

CREATED

↓

OPEN

↓

CLOSED

Readers cannot perform operations outside the appropriate lifecycle state.

## Binary Reading

Binary parsing is separated from platform reading.

BinaryReader provides reusable binary operations.

Platform Readers interpret platform-specific structures.

## Metadata

Platform metadata is represented as immutable value objects.

Metadata represents facts extracted from the source.

Metadata is never modified after creation.

## Consequences

Advantages

- Platform-independent architecture
- Reusable binary parsing
- Consistent lifecycle
- Clear separation of concerns
- Easy addition of new Nintendo platforms

Trade-offs

- More classes than a monolithic reader
- Slightly higher architectural complexity
- Additional abstractions for very small readers