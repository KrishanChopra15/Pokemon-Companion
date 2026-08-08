# ADR-045 — Binary Layout Architecture

## Status

Accepted

## Context

After a game has been identified, extractors must locate the binary structures that contain the game's data.

Examples include:

- Pokémon species table
- Move table
- Ability table
- Item table
- Trainer data
- Text tables

The location and organization of these structures vary between games, even when those games share the same platform.

Embedding binary offsets directly within extractors mixes extraction logic with knowledge of the binary's organization.

Similarly, storing binary layout information within domain objects such as `Game` couples domain concepts with implementation details.

A dedicated representation of binary structure is required.

## Decision

Pokémon Companion introduces the concept of a Binary Layout.

A Binary Layout describes how a specific game's binary is organized.

It defines the locations of binary structures required for extraction without performing any extraction itself.

Binary Layouts are resolved after game identification and before dataset extraction.

## Responsibilities

A Binary Layout is responsible for:

- Describing the organization of a game's binary.
- Defining the locations of extractable data structures.
- Providing binary layout information to dataset extractors.

A Binary Layout is not responsible for:

- Identifying games.
- Opening binary files.
- Reading binary data.
- Constructing domain objects.
- Extracting datasets.
- Building the database.

A Binary Layout Resolver is responsible for:

- Selecting the appropriate Binary Layout for an identified game.
- Decoupling game identification from binary layout selection.

The Binary Layout Resolver is not responsible for:

- Identifying games.
- Reading binary data.
- Extracting datasets.
- Constructing domain objects.

## Architecture

The extraction workflow is:

Reader

↓

Metadata

↓

Game Registry

↓

Game

↓

Binary Layout Resolver

↓

Binary Layout

↓

Dataset Extractors

Readers remain responsible for accessing binary data.

The Game Registry remains responsible for identifying games.

The Binary Layout Resolver remains responsible for selecting the appropriate Binary Layout.

Binary Layouts remain responsible for describing binary organization.

Dataset extractors remain responsible for interpreting binary data and constructing domain objects.

Each layer has a single responsibility.

## Consequences

### Advantages

- Clear separation between domain knowledge and binary organization.
- Binary layouts remain reusable across multiple dataset extractors.
- Binary layout selection remains isolated from extraction logic.
- Extractors focus on interpreting data rather than locating it.
- Additional games can be supported by introducing new Binary Layouts.
- Platform-specific binary knowledge remains centralized.

### Trade-offs

- Introduces an additional architectural concept.
- Requires maintenance of Binary Layout definitions.