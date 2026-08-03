# Pokémon Companion Database Schema

> Defines every canonical entity, relationship, identifier, and structural rule used throughout the Pokémon Companion knowledge graph.

---

# Purpose

The Database Schema defines the canonical structure of Pokémon Companion's knowledge graph.

While the Data Architecture explains how data flows through the system, this document defines what the data is.

Every entity, relationship, identifier, and generated dataset must conform to the schema described here.

The schema is designed to support every official Pokémon game while preserving historical accuracy, minimizing duplication, and allowing future expansion without structural redesign.

---

# Design Principles

The database schema is guided by the following principles.

## Canonical First

Every real-world Pokémon concept should have exactly one canonical representation.

Examples include:

- One Species record for Pikachu
- One Move record for Thunderbolt
- One Item record for Potion
- One Ability record for Levitate

Canonical entities should never be duplicated across games.

Historical differences are represented through relationships and context rather than duplicate entities.

---

## Relationship Driven

Entities should not directly contain large amounts of duplicated information.

Instead, relationships describe how entities interact.

Examples include:

- Pokémon learns Move
- Pokémon has Ability
- Pokémon appears in Encounter
- Machine teaches Move
- Trainer owns Pokémon

Relationships are first-class records within the schema and may contain their own properties, such as game, version, level, conditions, or method.

---

## Context Aware

Every piece of information is interpreted within an appropriate context.

A context defines the rules under which entities and relationships are valid.

Examples include:

- Pokémon Red
- Pokémon Emerald
- Pokémon Platinum
- Pokémon Scarlet
- Pokémon HOME
- Pokémon GO

Rather than creating separate copies of entities for every game, contexts determine which entities and relationships are available at any point in time.

---

## Version Aware

Historical changes are never overwritten.

Instead, relationships and properties record the versions in which they apply.

This allows Pokémon Companion to accurately represent every supported title while maintaining a single unified knowledge graph.

---

## Extensible

New mechanics, games, entities, and relationships should be introduced without requiring existing entities to be redesigned.

Future Pokémon titles should integrate into the schema by adding new canonical records and relationships rather than replacing existing ones.

---

# Canonical Entity Hierarchy

Pokémon Companion organizes its database into three complementary categories.

```text
Knowledge Graph
│
├── Canonical Entities
│       │
│       ├── Game
│       ├── Generation
│       ├── Version
│       ├── Region
│       ├── Location
│       ├── Species
│       ├── Form
│       ├── Pokémon
│       ├── Move
│       ├── Ability
│       ├── Item
│       ├── Type
│       ├── Nature
│       ├── Egg Group
│       ├── Evolution Method
│       ├── Machine
│       ├── Encounter
│       ├── Trainer
│       ├── Pokédex Entry
│       ├── Sprite
│       ├── Model
│       ├── Ribbon
│       └── Mark
│
├── Relationship Entities
│       │
│       ├── Pokémon Learns Move
│       ├── Pokémon Has Ability
│       ├── Pokémon Has Type
│       ├── Pokémon Evolves Into Pokémon
│       ├── Species Has Form
│       ├── Encounter Contains Pokémon
│       ├── Trainer Uses Pokémon
│       ├── Machine Teaches Move
│       ├── Location Contains Encounter
│       ├── Game Contains Region
│       └── ...
│
└── Context Entities
        │
        ├── Game Context
        ├── Version Context
        ├── Version Group Context
        └── Rule Set Context
```

---

# Entity Categories

Every record within the database belongs to exactly one of these categories.

## Canonical Entities

Canonical entities describe concepts that exist independently within the Pokémon universe.

They possess stable identities and may be referenced by any number of relationships.

Canonical entities never contain duplicated historical information.

---

## Relationship Entities

Relationship entities connect canonical entities together.

Unlike traditional foreign-key links, relationships are treated as independent records capable of storing additional information such as:

- Version
- Method
- Level
- Conditions
- Probability
- Restrictions
- Notes

This allows the database to accurately model historical differences without duplicating canonical entities.

---

## Context Entities

Context entities determine how the knowledge graph should be interpreted.

Contexts define which entities and relationships are active for a particular game, version, or ruleset.

Every user interaction with Pokémon Companion occurs within a context, whether explicitly selected by the user or inferred by the application.

---

# Common Entity Template

Every canonical entity within Pokémon Companion follows a common structural template.

Using a consistent schema makes the database easier to understand, validate, extend, and generate.

Although individual entity types contain different properties, they all follow the same architectural pattern.

---

## Entity Definition

Every entity should define the following information.

### Purpose

Describes what real-world Pokémon concept the entity represents.

The purpose explains why the entity exists and what responsibilities belong to it.

Every entity should have one clearly defined responsibility.

---

### Identifier

Every canonical entity has one permanent identifier.

Identifiers must:

- be globally unique
- never change once assigned
- never be reused
- remain independent of display names
- be suitable for long-term references

Identifiers are the primary way entities reference one another throughout the knowledge graph.

---

### Canonical Properties

Canonical properties describe information that belongs directly to the entity itself.

These properties should remain independent of any specific game whenever possible.

Examples include:

- name
- internal identifier
- category
- description
- classification
- permanent characteristics

Canonical properties should never duplicate information owned by another entity.

---

### Relationships

Relationships describe how an entity connects to other canonical entities.

Rather than embedding large collections directly inside records, entities are connected through explicit relationship entities.

Examples include:

- Species has Form
- Pokémon learns Move
- Move belongs to Machine
- Trainer owns Pokémon
- Encounter occurs at Location

Relationships define the structure of the knowledge graph.

---

### Contextual Data

Some information is only valid within a particular game, version, or ruleset.

Such information should not replace canonical properties.

Instead, contextual information is associated through version-aware relationships.

Examples include:

- learnsets
- encounter availability
- move compatibility
- trainer parties
- evolution methods
- location availability

---

### Historical Behaviour

Whenever an entity changes across Pokémon games, previous versions must be preserved.

Historical information should never overwrite earlier data.

Instead, the database records which games, versions, or contexts each variation applies to.

---

### Validation Rules

Every entity should define the validation requirements necessary to ensure its correctness.

Examples include:

- required properties
- valid references
- allowed value ranges
- uniqueness constraints
- version consistency
- historical consistency

Validation rules are defined as part of the schema rather than individual scripts.

---

### Generated Views

Canonical entities may produce one or more generated datasets used by the application.

Generated views never become the source of truth.

Examples include:

- lookup tables
- search indexes
- navigation indexes
- autocomplete indexes
- relationship indexes
- statistics

Generated datasets exist solely for performance and usability.

---

### Future Expansion

Each entity definition should describe how it may evolve without breaking compatibility.

New mechanics should extend existing entities whenever appropriate rather than replacing them.

This ensures long-term stability as new Pokémon games introduce additional features.

---

# Reference Standards

Reference Standards define how entities identify themselves and how they reference one another throughout Pokémon Companion.

A consistent reference system is essential for maintaining a stable, scalable, and interconnected knowledge graph.

Every canonical entity, relationship entity, generated dataset, backend service, frontend component, and validation script must follow these standards.

No alternative reference formats should be introduced.

---

# Design Goals

The reference system is designed to satisfy the following goals.

- Global uniqueness
- Human readability
- Long-term stability
- Version independence
- Efficient lookups
- Cross-platform compatibility
- Deterministic generation
- Easy validation

References should remain stable even if display names, translations, or internal implementations change.

---

# Canonical Entity IDs

Every canonical entity owns exactly one permanent identifier.

A canonical identifier:

- never changes
- is never reused
- uniquely identifies one entity
- remains valid across all Pokémon games
- is independent of localized names

Examples:

```text
species:25

pokemon:25-default

pokemon:25-gmax

move:85

ability:31

item:4

game:emerald

region:hoenn

location:petalburg-woods

trainer:emerald-brawly
```

Applications should always reference entities by their canonical identifiers rather than display names.

---

# Relationship IDs

Relationship entities also receive permanent identifiers.

Relationships should never be represented as anonymous objects embedded inside other entities.

Instead, every relationship is treated as an independent record.

Examples:

```text
pokemon-learns-move:000001

pokemon-has-ability:000842

pokemon-has-type:000315

encounter:014523

trainer-party:002315
```

This allows relationships to contain their own metadata, history, validation rules, and contextual information.

---

# Context IDs

Context entities define the rules under which data is interpreted.

Examples include:

```text
context:red

context:emerald

context:platinum

context:black-2

context:scarlet

context:go

context:home
```

Contexts may reference one or more games, versions, or rulesets depending on their purpose.

---

# References

Relationships should reference entities only through canonical identifiers.

Example:

```text
Pokemon
--------
id:
pokemon:25-default

Relationship
------------
pokemon:
pokemon:25-default

move:
move:85
```

Entity names should never be used as foreign keys.

---

# Display Names

Display names exist solely for presentation.

Examples:

```text
Display Name

Pikachu

Thunderbolt

Levitate

Potion
```

Display names may vary by:

- language
- localization
- capitalization
- formatting

Display names must never be used as identifiers.

---

# Generated References

Generated datasets may contain additional lookup structures for performance.

Examples include:

- numeric indexes
- search indexes
- autocomplete indexes
- hash maps

These generated references are implementation details.

They do not replace canonical identifiers.

---

# Validation Rules

Every reference must satisfy the following requirements.

- Target entity exists
- Identifier is unique
- Identifier format is valid
- Reference type is correct
- Circular references are permitted only where explicitly defined
- Broken references are not allowed

Every build should verify all references before generated datasets are produced.

---

# Future Compatibility

The reference system is designed to support future Pokémon games, mechanics, entities, and generated datasets without changing existing identifiers.

Once assigned, canonical identifiers remain valid permanently.

Backward compatibility is considered a core architectural requirement.

---

# Naming Standards

Naming standards define how entities, properties, files, directories, scripts, generated datasets, and APIs should be named throughout Pokémon Companion.

A consistent naming convention improves readability, reduces ambiguity, simplifies validation, and makes the project easier to maintain as it grows.

Every part of the project should follow these standards.

---

# Goals

The naming system is designed to be:

- Consistent
- Predictable
- Human-readable
- Machine-friendly
- Easy to search
- Easy to validate
- Stable over time

Names should clearly describe their purpose without relying on abbreviations whenever possible.

---

# Entity Names

Canonical entity names should use singular nouns.

Examples:

- Game
- Generation
- Version
- Region
- Location
- Species
- Form
- Pokémon
- Move
- Ability
- Item
- Trainer
- Encounter
- Machine

Entity names represent a single conceptual object.

---

# Relationship Names

Relationship entities should describe the connection between two canonical entities.

Relationships should follow a verb-based naming pattern.

Examples:

- Pokémon Learns Move
- Pokémon Has Ability
- Pokémon Has Type
- Species Has Form
- Pokémon Evolves Into Pokémon
- Machine Teaches Move
- Trainer Uses Pokémon
- Encounter Contains Pokémon
- Game Contains Region
- Region Contains Location

Relationship names should read naturally as sentences.

---

# Property Names

All property names should use **camelCase**.

Examples:

```text
speciesId
pokemonId
moveId
abilityId
versionGroupId
locationAreaId
displayName
baseExperience
captureRate
isLegendary
```

Property names should:

- begin with a lowercase letter
- avoid abbreviations unless universally understood
- clearly describe their purpose
- remain consistent across every entity

---

# File Names

Data files should use **kebab-case**.

Examples:

```text
species.json
pokemon.json
moves.json
abilities.json
version-groups.json
encounter-tables.json
trainer-parties.json
```

Generated datasets should also use kebab-case.

Examples:

```text
pokemon-index.json
move-lookup.json
search-index.json
relationship-index.json
```

---

# Directory Names

Directories should also use **kebab-case**.

Examples:

```text
database-v2/
generated/
relationships/
validation/
canonical/
contexts/
```

Directory names should represent logical groups rather than implementation details.

---

# Script Names

Scripts should begin with an action describing their responsibility.

Examples:

```text
extract-games.js
normalize-species.js
build-relationships.js
generate-search-index.js
validate-references.js
inspect-pokemon.js
```

Each script should perform one primary task.

---

# Display Names

Display names are intended for user interfaces.

They may include:

- Spaces
- Accented characters
- Punctuation
- Localized translations

Examples:

```text
Mr. Mime
Farfetch'd
Type: Null
Pokémon HOME
Pokémon GO
```

Display names must never be used as identifiers.

---

# Internal Names

Internal names should be lowercase, language-independent, and stable.

Examples:

```text
mr-mime
farfetchd
type-null
pokemon-home
pokemon-go
```

Internal names are intended for identifiers, file names, URLs, and references.

---

# Reserved Words

Certain words have specific meanings within Pokémon Companion and should not be reused for unrelated purposes.

Examples include:

- Entity
- Relationship
- Context
- Canonical
- Generated
- Validation
- Reference
- Identifier
- Schema

Using consistent terminology improves documentation and reduces ambiguity across the project.

---

# Naming Consistency

Whenever a concept appears in multiple parts of the project, it should retain the same name.

For example:

- The database field
- The backend API
- The frontend model
- The validation rules
- The documentation

should all refer to the same concept using identical terminology.

Consistency takes priority over brevity.

---

# Future Compatibility

New entities, relationships, mechanics, and datasets should follow these naming standards without introducing alternative conventions.

A single, consistent naming system ensures Pokémon Companion remains understandable and maintainable as it expands to support future Pokémon games.

---

# Versioning Strategy

## Purpose

One of the primary goals of Pokémon Companion is to accurately represent every official Pokémon game exactly as it existed at release.

Rather than replacing older data with newer information, Pokémon Companion preserves the complete historical evolution of the Pokémon franchise.

Versioning is therefore a fundamental architectural feature rather than a simple metadata field.

Every canonical entity, relationship, and generated dataset must be capable of representing historical changes without losing previous information.

---

# Core Philosophy

The database stores one canonical knowledge graph.

Historical differences are represented through contexts and relationships rather than duplicate canonical entities.

For example:

- Pikachu remains one Species.
- Thunderbolt remains one Move.
- Levitate remains one Ability.

Only their relationships and properties may vary between games.

This minimizes duplication while preserving historical accuracy.

---

# Version Hierarchy

Pokémon Companion represents official releases using a hierarchical structure.

```text
Generation
        │
        ▼
Version Group
        │
        ▼
Version
        │
        ▼
Context
```

Each level has a distinct responsibility.

---

## Generation

Represents a major era of Pokémon mechanics.

Examples include:

- Generation I
- Generation II
- Generation III
- ...
- Generation X

Generations introduce new mechanics, Pokémon, battle systems, abilities, and gameplay features.

---

## Version Group

A Version Group represents games that share almost identical mechanics and data.

Examples include:

- Red / Blue
- Gold / Silver
- Ruby / Sapphire
- Diamond / Pearl
- Scarlet / Violet

Version Groups reduce unnecessary duplication by grouping games with nearly identical gameplay systems.

---

## Version

A Version represents one specific official release.

Examples include:

- Pokémon Red
- Pokémon Blue
- Pokémon Yellow
- Pokémon Emerald
- Pokémon Platinum
- Pokémon Scarlet
- Pokémon Violet

Version-specific differences should always be preserved.

---

## Context

A Context represents the exact rules under which the knowledge graph should be interpreted.

Contexts determine:

- available Pokémon
- available forms
- available moves
- available abilities
- available encounters
- available trainers
- available items
- available mechanics

The same canonical database may therefore produce different results depending on the selected context.

---

# Historical Changes

Historical changes should never overwrite previous information.

Instead, every change is represented by version-aware relationships.

Examples include:

- Learnset changes
- Ability changes
- Type changes
- Base stat changes
- Encounter changes
- Evolution method changes
- Item availability
- Machine compatibility
- Trainer party changes

Older games remain permanently reproducible.

---

# Version Inheritance

Where possible, Pokémon Companion should reuse inherited data rather than duplicate identical information.

For example:

```text
Generation III
        │
        ▼
Ruby / Sapphire
        │
        ▼
Emerald
```

If Emerald does not modify a particular relationship, it should inherit the relationship from its parent version where appropriate.

Inheritance should reduce duplication without sacrificing historical accuracy.

---

# Future Compatibility

The versioning system is designed to support future official Pokémon games without requiring structural redesign.

When a new game releases, Pokémon Companion should primarily add new contexts and relationships while preserving every historical version already stored.

Backward compatibility is considered a permanent architectural requirement.

---

# Game Family

The Game Family defines the official Pokémon releases and the hierarchical structure used to organize them.

Every other canonical entity within Pokémon Companion is interpreted through the Game Family.

Rather than representing games as simple metadata, Pokémon Companion treats them as first-class canonical entities within the knowledge graph.

The Game Family provides the historical framework that allows the database to accurately represent every official Pokémon title while minimizing duplication.

---

# Entity Hierarchy

```text
Generation
        │
        ▼
Version Group
        │
        ▼
Version
        │
        ▼
Game Context
```

Each entity has a distinct responsibility.

---

# Generation

## Purpose

A Generation represents a major era of Pokémon game mechanics.

Generations introduce new Pokémon, battle systems, mechanics, abilities, moves, items, regions, and gameplay features.

A Generation groups together games that share the same overall mechanical foundation.

---

## Responsibilities

A Generation is responsible for defining:

- Generation number
- Generation name
- Release period
- Core mechanics introduced
- Available Pokémon range
- Battle system characteristics
- Parent generation relationships

A Generation does not directly store Pokémon, moves, items, or locations.

Those entities remain independent and are connected through relationships.

---

# Version Group

## Purpose

A Version Group represents a collection of games that share nearly identical game mechanics and data.

Examples include:

- Red / Blue
- Gold / Silver
- Ruby / Sapphire
- Diamond / Pearl
- Scarlet / Violet

Version Groups reduce duplication by allowing common mechanics and relationships to be shared across multiple games.

---

## Responsibilities

A Version Group defines:

- Shared mechanics
- Shared learnsets
- Shared encounters (where applicable)
- Shared TM compatibility
- Shared move availability
- Shared item availability
- Shared evolution rules

Individual games may override inherited information when official differences exist.

---

# Version

## Purpose

A Version represents one specific official game release.

Examples include:

- Pokémon Red
- Pokémon Blue
- Pokémon Yellow
- Pokémon Emerald
- Pokémon Platinum
- Pokémon Scarlet
- Pokémon Violet

Every officially released game supported by Pokémon Companion has one Version record.

---

## Responsibilities

A Version defines:

- Official title
- Internal identifier
- Release date
- Platform
- Region availability
- Supported languages
- Parent Version Group
- Generation
- Available game features

Version records should contain only information unique to that specific release.

---

# Game Context

## Purpose

A Game Context represents the exact rules under which Pokémon Companion interprets the knowledge graph.

Every page, search result, relationship, and generated dataset is evaluated within a selected Game Context.

Examples include:

- Pokémon Emerald
- Pokémon Platinum
- Pokémon Scarlet
- Pokémon GO
- Pokémon HOME

Changing the active context changes the interpretation of the database without changing the canonical entities themselves.

---

## Responsibilities

A Game Context determines:

- Available Pokémon
- Available forms
- Available moves
- Available abilities
- Available items
- Available locations
- Available encounters
- Available trainers
- Available mechanics
- Available evolutions

Game Contexts are the primary mechanism that enables historical accuracy throughout Pokémon Companion.

---

# Relationships

The Game Family connects to nearly every other canonical entity.

Examples include:

- Generation contains Version Groups
- Version Group contains Versions
- Version defines Game Context
- Game Context enables Mechanics
- Game Context enables Encounters
- Game Context enables Trainers
- Game Context enables Learnsets
- Game Context enables Machines
- Game Context enables Pokédex entries

These relationships allow the same canonical knowledge graph to be interpreted differently depending on the selected game.

---

# Design Principles

The Game Family follows several architectural principles.

- Every official game has one canonical Version.
- Version Groups reduce duplication.
- Historical changes are preserved rather than overwritten.
- Canonical entities remain independent of games.
- Game Context controls interpretation instead of duplication.
- Future Pokémon games should integrate without requiring structural redesign.

---

# Validation Standards

Validation ensures that every entity, relationship, and generated dataset within Pokémon Companion is internally consistent before it is used by any part of the application.

Validation is a mandatory stage of the build pipeline.

No dataset should be considered valid until every applicable validation rule has passed successfully.

Validation protects the integrity of the knowledge graph and prevents invalid or incomplete data from reaching the backend, frontend, AI systems, or user database.

---

# Validation Philosophy

Validation follows four fundamental principles.

## Correctness

Every record should accurately represent the official source data from which it was derived.

---

## Completeness

Required information should never be missing.

Every mandatory field, relationship, and reference must exist.

---

## Consistency

Equivalent information should be represented identically throughout the database.

The same entity should never appear with conflicting identifiers, properties, or relationships.

---

## Reproducibility

Running the complete build pipeline using identical source data should always produce identical validation results.

Validation must be deterministic.

---

# Entity Validation

Every canonical entity should be validated independently.

Examples include:

- Identifier uniqueness
- Required properties
- Property data types
- Enumeration values
- Value ranges
- Duplicate detection
- Canonical ownership

Entities should never contain information owned by another canonical entity.

---

# Relationship Validation

Every relationship must satisfy the following requirements.

- Both referenced entities exist.
- Relationship identifiers are unique.
- Relationship type is valid.
- Context references exist.
- Duplicate relationships are not created.
- Relationship metadata is complete.

Relationships should never reference deleted or unknown entities.

---

# Context Validation

Every context should be validated independently.

Validation includes:

- Valid game reference
- Valid version reference
- Valid version group reference
- Supported mechanics
- Historical consistency
- Context inheritance rules

Contexts should never activate relationships that are impossible within the selected game.

---

# Cross-Reference Validation

Every reference throughout the knowledge graph must resolve successfully.

Examples include:

- Species references
- Form references
- Pokémon references
- Move references
- Ability references
- Item references
- Trainer references
- Encounter references
- Machine references

Broken references are never permitted.

---

# Historical Validation

Historical information should remain internally consistent.

Validation includes:

- Version ordering
- Version inheritance
- Historical overrides
- Timeline consistency
- Context compatibility

Older games should remain reproducible without being affected by later generations.

---

# Generated Dataset Validation

Generated datasets should be validated separately from canonical data.

Validation includes:

- Search indexes
- Lookup tables
- Navigation indexes
- Statistics
- Autocomplete indexes
- Relationship indexes

Generated datasets should always be reproducible from canonical data.

---

# Build Validation

The complete build process should fail whenever a critical validation error is detected.

Examples include:

- Missing entity
- Broken relationship
- Duplicate identifier
- Invalid context
- Corrupted generated dataset
- Circular dependency where prohibited

Validation failures should prevent publication of the generated database.

---

# Validation Reports

Every build should generate validation reports describing:

- Total entities
- Total relationships
- Validation duration
- Passed checks
- Failed checks
- Warnings
- Build status

Validation reports should assist debugging without modifying the database.

---

# Future Expansion

As Pokémon Companion grows, additional validation rules may be introduced for new mechanics, entities, relationships, and official game releases.

New validation rules should strengthen data integrity without breaking compatibility with existing canonical records.

---

# Generated Dataset Standards

Generated datasets are derived representations of the canonical knowledge graph.

They exist solely to improve application performance, simplify queries, and reduce runtime computation.

Generated datasets are never considered the source of truth.

Every generated dataset must be reproducible from the canonical database and its relationships.

If a generated dataset is deleted, it should be possible to recreate it entirely through the build pipeline without any loss of information.

---

# Purpose

Generated datasets exist to:

- Improve application performance
- Reduce frontend processing
- Reduce backend query complexity
- Support fast searching
- Support navigation
- Support AI features
- Support analytics
- Support offline usage

Generation is an optimization step rather than a data creation step.

---

# Source of Truth

Generated datasets must never contain information that does not exist within the canonical database or its relationships.

Every generated value should be traceable back to one or more canonical records.

If canonical data changes, generated datasets must be regenerated.

Manual editing of generated datasets is prohibited.

---

# Types of Generated Datasets

Generated datasets may include, but are not limited to:

## Lookup Datasets

Designed for direct identifier-based access.

Examples include:

- Pokémon Lookup
- Move Lookup
- Item Lookup
- Ability Lookup
- Species Lookup

---

## Search Datasets

Optimized for searching.

Examples include:

- Search Index
- Autocomplete Index
- Name Index
- Alias Index

---

## Navigation Datasets

Support fast navigation throughout the application.

Examples include:

- Pokémon by Type
- Pokémon by Ability
- Pokémon by Region
- Pokémon by Generation
- Moves by Type
- Items by Category

---

## Relationship Datasets

Pre-computed relationship structures.

Examples include:

- Evolution Graph
- Species Forms
- Pokémon Learnsets
- Machine Compatibility
- Encounter Tables

---

## Statistical Datasets

Pre-calculated information used for analysis.

Examples include:

- Type Statistics
- Collection Statistics
- Completion Statistics
- Coverage Statistics

---

# Generation Rules

Every generated dataset should:

- be deterministic
- be reproducible
- contain no duplicated canonical information
- contain no manually edited records
- reference canonical identifiers
- preserve historical accuracy

Generation should never alter canonical data.

---

# Performance Goals

Generated datasets should be optimized for:

- Fast loading
- Minimal memory usage
- Efficient searching
- Efficient filtering
- Efficient sorting
- Offline availability

Optimization should never sacrifice correctness.

---

# Version Awareness

Generated datasets should respect the currently selected Game Context.

Where appropriate, generation may produce:

- global datasets
- game-specific datasets
- version-specific datasets
- context-specific datasets

The generation process should preserve historical accuracy across every supported Pokémon title.

---

# Validation

Every generated dataset should undergo independent validation before publication.

Validation includes:

- Schema validation
- Identifier validation
- Reference validation
- Duplicate detection
- Relationship verification
- Context verification

Generated datasets should never bypass the validation pipeline.

---

# Future Expansion

Additional generated datasets may be introduced to support new application features, future Pokémon games, AI capabilities, analytics, or performance improvements.

The generated layer should remain completely replaceable without affecting the canonical database.

---

# User Data Integration

The canonical database represents the official Pokémon knowledge graph.

The User Database represents each trainer's personal journey through that knowledge graph.

These two systems serve different purposes and must remain completely independent.

The canonical database describes the Pokémon world.

The User Database describes a trainer's interaction with that world.

User data must never modify canonical records.

Likewise, canonical records must never depend upon user-generated information.

---

# Separation of Responsibilities

The database is divided into two independent domains.

## Canonical Database

The Canonical Database stores official Pokémon knowledge.

Examples include:

- Species
- Forms
- Pokémon
- Moves
- Abilities
- Items
- Types
- Games
- Regions
- Locations
- Trainers
- Encounters

This information is shared by every user.

---

## User Database

The User Database stores trainer-specific information.

Examples include:

- User accounts
- Adventure progress
- Pokédex completion
- Living Dex
- Shiny collections
- Teams
- Pokémon instances
- Notes
- Settings
- Achievements

This information belongs only to the individual trainer.

---

# User References

User records should never duplicate canonical information.

Instead, they reference canonical entities using their permanent identifiers.

Example:

```text
Pokemon Instance

speciesId:
species:6

pokemonId:
pokemon:6-default

contextId:
context:scarlet
```

The canonical database provides the official information.

The User Database provides the trainer's personal information.

---

# Pokémon Instances

A Pokémon Instance represents one specific Pokémon owned by a trainer.

Unlike canonical Pokémon entities, Pokémon Instances contain user-specific information.

Examples include:

- Nickname
- Level
- Nature
- Ability
- Individual Values (IVs)
- Effort Values (EVs)
- Moves
- Original Trainer
- Trainer ID
- Held Item
- Poké Ball
- Ribbons
- Marks
- Date Met
- Met Location
- Shiny status

Multiple Pokémon Instances may reference the same canonical Pokémon.

Each remains completely independent.

---

# Synchronization

Cloud synchronization should synchronize only user-generated information.

Canonical Pokémon data should be distributed as part of the application's official database updates.

This approach reduces synchronization traffic and guarantees consistency across all supported devices.

---

# Offline Support

Pokémon Companion is designed to function offline.

Each device stores a local copy of the canonical database.

Only user-generated information requires synchronization between devices.

This architecture enables:

- Fast loading
- Reliable offline access
- Reduced bandwidth usage
- Consistent gameplay tracking

Changes made while offline should synchronize automatically once connectivity is restored.

---

# Future Expansion

The User Database should support future features without requiring changes to the canonical database.

Examples include:

- Cloud backups
- Cross-device synchronization
- Shared collections
- Trading history
- Team sharing
- Multiplayer features
- AI personalization
- Future official integrations

All future user features should remain isolated from the canonical knowledge graph.

---

# Database Lifecycle

The Pokémon Companion database follows a deterministic lifecycle that transforms official Pokémon game data into a validated knowledge graph used by the application.

Every stage has a single responsibility.

Data always flows in one direction.

No stage may directly modify a previous stage.

This architecture ensures reproducibility, maintainability, and long-term scalability.

---

# Lifecycle Overview

```text
Official Sources
        │
        ▼
Raw Extraction
        │
        ▼
Raw Sources
        │
        ▼
Normalization
        │
        ▼
Canonical Database
        │
        ▼
Relationship Generation
        │
        ▼
Generated Database
        │
        ▼
Validation
        │
        ▼
Application Database
        │
        ▼
Backend Services
        │
        ▼
Frontend Applications
        │
        ▼
User Database
```

Each stage is independent and produces output consumed by the following stage.

---

# Stage 1 — Official Sources

The lifecycle begins with official Pokémon resources.

Examples include:

- Official Pokémon game data
- Official game assets
- Official game text
- Official battle data
- Official encounter tables
- Official evolution data
- Official item data
- Official move data

Where official data is unavailable or incomplete, external resources may be used for verification or research, but never replace confirmed official information.

Official game data remains the primary source of truth.

---

# Stage 2 — Raw Extraction

Extraction converts official resources into machine-readable formats.

Extraction should preserve the original information as faithfully as possible.

No interpretation, normalization, or optimization should occur during extraction.

Raw Extraction should be reproducible using the same source material.

---

# Stage 3 — Raw Sources

Raw Sources store extracted data before normalization.

Characteristics include:

- Closely mirrors official data
- Read-only after extraction
- Game-specific organization
- No generated relationships
- No calculated values

Raw Sources act as an archival layer that allows future improvements to extraction without affecting higher layers.

---

# Stage 4 — Normalization

Normalization converts game-specific structures into Pokémon Companion's canonical schema.

Normalization is responsible for:

- Standardizing formats
- Assigning canonical identifiers
- Resolving naming differences
- Preserving historical information
- Preparing data for relationship generation

Normalization never changes the meaning of official data.

---

# Stage 5 — Canonical Database

The Canonical Database stores the permanent knowledge graph.

Each canonical entity exists exactly once.

Examples include:

- Species
- Forms
- Pokémon
- Moves
- Abilities
- Items
- Types
- Games
- Regions
- Locations
- Trainers

Canonical entities remain independent of individual games whenever possible.

---

# Stage 6 — Relationship Generation

Relationship Generation creates explicit connections between canonical entities.

Examples include:

- Pokémon learns Move
- Pokémon has Ability
- Species has Form
- Machine teaches Move
- Encounter contains Pokémon
- Trainer uses Pokémon

Relationships preserve context, historical changes, and version-specific behaviour without duplicating canonical entities.

---

# Stage 7 — Generated Database

Generated datasets are optimized for application performance.

Examples include:

- Search indexes
- Lookup tables
- Navigation datasets
- Statistics
- Relationship indexes
- Autocomplete indexes

Generated datasets may always be deleted and regenerated.

They never become the source of truth.

---

# Stage 8 — Validation

Validation verifies the integrity of the complete knowledge graph.

Validation includes:

- Entity validation
- Relationship validation
- Reference validation
- Historical validation
- Context validation
- Generated dataset validation

The build process should fail if critical validation errors are detected.

---

# Stage 9 — Application Database

The validated generated database becomes the application's read-only Pokémon knowledge base.

All backend services, frontend applications, search systems, AI features, and supporting tools should consume this database rather than the canonical records directly.

This layer provides a stable interface between the build pipeline and the application.

---

# Stage 10 — User Database

The User Database stores trainer-specific information independently of the official knowledge graph.

Examples include:

- User accounts
- Pokémon instances
- Adventure progress
- Teams
- Collections
- Achievements
- Preferences

User data references canonical entities but never modifies them.

---

# Lifecycle Principles

The complete lifecycle follows several core principles.

- Official data is the source of truth.
- Every stage has one responsibility.
- Data flows in one direction.
- Canonical entities remain immutable between builds.
- Generated datasets are disposable.
- Validation is mandatory.
- User data remains separate from official Pokémon knowledge.
- Every build should be reproducible.

---

# Future Expansion

Additional lifecycle stages may be introduced to support future tooling, official Pokémon games, AI capabilities, or build optimizations.

Any future additions should preserve the existing lifecycle principles and maintain backward compatibility with the canonical knowledge graph.

---

# Source Attribution & Data Provenance

Data Provenance defines how Pokémon Companion tracks the origin, verification, and history of every piece of canonical information.

Every canonical record should be traceable back to the official source from which it was obtained.

This ensures that the database remains transparent, auditable, reproducible, and maintainable throughout its lifetime.

Whenever possible, every fact within the knowledge graph should answer the following questions:

- Where did this information originate?
- How was it obtained?
- When was it verified?
- Which official game or resource does it represent?
- How confident are we that it is correct?

Data provenance is considered a core architectural requirement rather than optional metadata.

---

# Source Hierarchy

Pokémon Companion recognizes different categories of data sources.

Sources are prioritized according to the following hierarchy.

## Tier 1 — Official Sources

Official sources are considered the canonical source of truth.

Examples include:

- Official Pokémon game data
- Official game assets
- Official text resources
- Official encounter tables
- Official battle data
- Official event data
- Official Pokémon HOME data (where legally and technically appropriate)

Whenever official information is available, it always takes precedence.

---

## Tier 2 — Verified Reference Sources

Verified reference sources may be used to validate, compare, or fill documented gaps in official data.

Examples include:

- Community-maintained research projects
- ROM disassembly projects
- Technical documentation
- Verified data extraction research

These sources must never override confirmed official data.

---

## Tier 3 — Supporting Sources

Supporting sources may provide additional context or assist during development.

Examples include:

- Public databases
- Community documentation
- Research notes
- Historical archives

Supporting sources should only be used when higher-priority sources are unavailable or incomplete.

---

# Provenance Metadata

Canonical records may store provenance metadata describing how the information was obtained.

Examples include:

- Source category
- Source identifier
- Source game
- Extraction method
- Extraction tool
- Extraction date
- Verification date
- Verification status
- Supporting references
- Developer notes

This metadata supports auditing and long-term maintenance without changing the canonical meaning of the data.

---

# Verification

Every imported record should progress through a verification process.

Typical stages include:

- Extracted
- Normalized
- Verified
- Validated
- Published

Verification confirms that the canonical representation accurately reflects the original source.

---

# Reproducibility

Given the same official sources and the same build pipeline, Pokémon Companion should always produce identical canonical records.

Every transformation should be deterministic.

No manual editing should be required after the extraction process.

---

# Auditing

The database should support future auditing of every canonical record.

Auditing should make it possible to determine:

- Which source produced the record
- Which build generated it
- Which relationships were created
- Which validation rules were applied
- When the record was last verified

Auditing improves long-term maintainability and simplifies future corrections when new official information becomes available.

---

# Future Expansion

As Pokémon Companion expands to support additional games, mechanics, and official resources, the provenance system should continue providing a complete history of every canonical record without affecting the stability of existing identifiers or relationships.

Maintaining transparent data provenance is essential to preserving Pokémon Companion as a reliable and historically accurate knowledge platform.