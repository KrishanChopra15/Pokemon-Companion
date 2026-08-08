# ADR-044 — Game Identification Architecture

## Status

Accepted

## Context

Readers provide platform-specific metadata extracted directly from game sources.

Extractors transform platform metadata into Pokémon domain objects.

However, platform metadata alone does not identify the logical game represented by the source.

For example, a Game Boy Advance ROM header contains the Nintendo game code `BPRE`, but it does not directly provide domain concepts such as:

- Pokémon FireRed
- Generation III
- Kanto
- FireRed

These concepts belong to the application's domain rather than the platform metadata.

A centralized identification mechanism is required before extraction can construct domain objects.

## Decision

Pokémon Companion introduces a Game Registry.

The Game Registry is responsible for translating platform-specific metadata into immutable `Game` domain objects.

The registry acts as the authoritative source of supported game definitions.

Extractors consume `Game` objects provided by the registry rather than constructing them independently.

## Responsibilities

The Game Registry is responsible for:

- Identifying the game represented by platform metadata.
- Translating platform-specific identifiers into domain objects.
- Storing the definitions of supported games.
- Providing a consistent identification mechanism across supported Nintendo platforms.

The registry is not responsible for:

- Opening sources.
- Reading binary data.
- Extracting Pokémon data.
- Building the database.

## Architecture

The identification workflow is:

Metadata

↓

Game Registry

↓

Game

↓

Extractor

Readers remain responsible for platform metadata.

The Game Registry remains responsible for game identification.

Extractors remain responsible for extracting Pokémon domain data.

Each layer has a single responsibility.

## Consequences

### Advantages

- Clear separation between platform metadata and domain concepts.
- Centralized game identification.
- Centralized storage of supported games.
- Simpler extractors.
- Eliminates duplicate game definitions.
- Easier support for additional games.

### Trade-offs

- Requires maintenance of the supported game registry.