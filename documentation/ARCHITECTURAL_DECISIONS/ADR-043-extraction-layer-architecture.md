# ADR-043 — Extraction Layer Architecture

## Status

Accepted

## Context

Readers provide access to platform-specific game sources.

However, readers must remain independent of Pokémon-specific knowledge.

Pokémon Companion requires a dedicated layer responsible for understanding game data and converting platform-specific information into structured Pokémon domain objects.

## Decision

Pokémon Companion adopts a dedicated Extraction Layer between Readers and the generated database.

Readers understand platforms.

Extractors understand Pokémon.

Readers never extract Pokémon data.

Extractors never open ROMs.

The Extraction Layer consumes platform readers and produces structured domain objects.

## Responsibilities

Extractors are responsible for:

- Extracting Pokémon species
- Extracting moves
- Extracting abilities
- Extracting items
- Extracting trainers
- Extracting maps
- Extracting encounters
- Extracting evolutions
- Extracting game-specific data

Extractors are not responsible for:

- Opening sources
- Reading binary files
- Managing reader lifecycle
- Building the database
- Serving backend APIs

## Architecture

The Extraction Layer is composed of:

- Extractor
- ExtractorFactory
- Platform Extractors

Platform extractors may share common logic while allowing game-specific implementations when required.

## Separation of Concerns

Reader

↓

Platform Data

↓

Extractor

↓

Pokémon Domain Objects

↓

Database Builder

The Reader and Extractor remain independent.

Neither subsystem owns the responsibilities of the other.

## Consequences

Advantages

- Clear separation between platform logic and Pokémon logic
- Reusable readers
- Independent extractors
- Easier testing
- Easier support for additional games and platforms

Trade-offs

- Additional architectural layer
- More classes and interfaces
- Slightly increased implementation complexity