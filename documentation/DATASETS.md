# Pokémon Companion Datasets

> Defines every dataset used throughout Pokémon Companion and documents how data is organized, generated, validated, and consumed across the entire platform.

---

# Purpose

The Datasets document serves as the master catalog of every dataset used by Pokémon Companion.

Its purpose is to describe what datasets exist, why they exist, where they belong within the data architecture, and how they interact with one another.

Unlike the Database Schema, which defines the structure of canonical entities and relationships, this document focuses on the datasets that store, organize, and expose those entities throughout the project.

Every dataset, whether extracted from official sources, generated during the build pipeline, or created by users, should be documented here.

This document acts as the central reference for developers working with the Pokémon Companion data ecosystem.

---

# Dataset Philosophy

Pokémon Companion treats datasets as independent architectural components.

Each dataset should have one clearly defined responsibility.

Information should exist in only one canonical location.

Derived datasets should never become the source of truth.

Instead, they exist to improve performance, simplify application development, and expose optimized views of the canonical knowledge graph.

Every dataset should be:

- Clearly defined
- Version-aware
- Fully documented
- Deterministically generated where applicable
- Independently validated
- Easily maintainable

Datasets should remain understandable without requiring knowledge of their implementation.

---

# Dataset Lifecycle

Datasets follow the lifecycle defined in `DATA_ARCHITECTURE.md`.

This document describes the datasets present at each stage of that lifecycle rather than redefining it.

---

# Dataset Classification

Every dataset within Pokémon Companion belongs to exactly one architectural layer.

The primary dataset categories are:

## Layer 1 — Official Sources

Official Pokémon resources used during extraction.

These datasets exist outside Pokémon Companion and act as the project's highest authority.

---

## Layer 2 — Raw Sources

Machine-readable representations extracted directly from official sources.

These datasets preserve the original structure of official game data and act as the archival foundation of the project.

---

## Layer 3 — Canonical Datasets

Canonical datasets define the permanent entities used throughout Pokémon Companion.

Each canonical concept exists exactly once.

These datasets form the project's knowledge graph.

---

## Layer 4 — Relationship Datasets

Relationship datasets explicitly connect canonical entities together.

Rather than embedding duplicated information inside canonical datasets, relationships are stored independently.

These datasets transform isolated entities into a fully interconnected knowledge graph.

---

## Layer 5 — Generated Datasets

Generated datasets provide optimized views of the knowledge graph.

These datasets exist solely to improve application performance and developer experience.

They may always be regenerated from canonical and relationship datasets.

---

## Layer 6 — User Datasets

User datasets store trainer-specific information.

Unlike every previous layer, these datasets are unique to each trainer and remain completely independent from official Pokémon knowledge.

User datasets should reference canonical entities without modifying them.

---

# Layer 1 — Official Sources

## Purpose

Official Sources represent the origin of every piece of Pokémon knowledge used throughout Pokémon Companion.

Unlike every other dataset layer, Official Sources are not created, modified, or maintained by Pokémon Companion.

Instead, they provide the authoritative information from which every internal dataset is ultimately derived.

Whenever official information is available, it is considered the canonical source of truth.

Every later dataset should be traceable back to one or more official sources through the project's provenance system.

---

# Dataset Characteristics

Official Source datasets have the following characteristics:

- External to Pokémon Companion
- Read-only
- Not version-controlled by the project
- Never modified directly
- Used only during extraction
- Fully traceable through provenance metadata

Official Sources define what exists.

Pokémon Companion defines how that information is represented.

---

# Dataset Categories

Official Sources include several categories of information.

## Game Data

Official game data provides the majority of Pokémon Companion's knowledge.

Examples include:

- Game executables
- Game archives
- Binary resources
- Internal data tables
- Game scripts
- Battle data
- Save structures

These datasets define the mechanics and behaviour of each supported game.

---

## Game Assets

Official game assets describe the visual and audio presentation of Pokémon.

Examples include:

- Sprites
- Models
- Animations
- Icons
- Cries
- Backgrounds
- Interface assets

Assets should remain linked to their originating games.

---

## Text Resources

Official localized text.

Examples include:

- Pokémon names
- Move names
- Ability names
- Item names
- Pokédex entries
- Dialogue
- Location names
- Trainer names

Text resources should preserve language-specific information whenever possible.

---

## Gameplay Data

Gameplay datasets define how Pokémon games function.

Examples include:

- Learnsets
- Evolution methods
- Encounter tables
- Trainer parties
- Item locations
- Machine compatibility
- Battle facilities

Gameplay data provides the behavioural foundation for later canonical relationships.

---

## Event Data

Official event information distributed throughout the lifetime of Pokémon games.

Examples include:

- Mystery Gifts
- Event Pokémon
- Distribution events
- Promotional items
- Time-limited events

Event datasets should preserve their original availability and historical context.

---

# Dataset Ownership

Official Sources are owned by their respective copyright holders.

Pokémon Companion does not modify, redistribute, or redefine official information.

Instead, Official Sources are used solely to extract factual Pokémon knowledge for use within the project's internal build pipeline.

---

# Dataset Consumers

Official Sources are consumed only by:

- Official Data Extraction
- Provenance Tracking
- Verification Processes

No application component should consume Official Sources directly.

All application data should originate from later stages of the build pipeline.

---

# Validation

Official Sources are validated before extraction.

Validation includes:

- Source identification
- File integrity
- Version detection
- Platform detection
- Language detection
- Compatibility verification

Extraction should begin only after the selected sources have been successfully identified and validated.

---

# Layer 2 — Raw Sources

## Purpose

Raw Sources represent the permanent archival layer of Pokémon Companion.

These datasets are created directly from Official Sources through the Official Data Extraction pipeline.

Their purpose is to preserve extracted Pokémon game data as faithfully as possible before any normalization, interpretation, or optimization occurs.

Raw Sources provide the foundation from which every canonical dataset can be regenerated.

They should always remain reproducible from the same official inputs.

---

# Dataset Characteristics

Raw Source datasets have the following characteristics:

- Generated directly from Official Sources
- Machine-readable
- Read-only after extraction
- Closely mirror official game structures
- Contain no generated relationships
- Contain no calculated values
- Preserve provenance information
- Fully reproducible

Raw Sources prioritize completeness and accuracy over application performance.

---

# Dataset Categories

Raw Sources are organized by game engine and platform.

Each supported game contributes one or more raw datasets.

Typical dataset categories include:

---

## Game Data

Examples include:

- Games
- Generations
- Version Groups
- Versions
- Platforms
- Regions

These datasets describe the supported Pokémon titles and their organizational hierarchy.

---

## World Data

Examples include:

- Maps
- Locations
- Location Areas
- Routes
- Cities
- Buildings
- Landmarks

World datasets preserve the original structure of each supported game.

---

## Pokémon Data

Examples include:

- Species
- Forms
- Pokémon
- Evolutions
- Learnsets
- Types
- Abilities
- Base Statistics
- Growth Rates

These datasets preserve official Pokémon mechanics before normalization.

---

## Battle Data

Examples include:

- Moves
- Move Effects
- Damage Classes
- Move Targets
- Battle Mechanics
- Status Effects

Battle datasets describe official gameplay behaviour.

---

## Trainer Data

Examples include:

- Trainers
- Trainer Parties
- Trainer Classes
- AI Behaviour
- Battle Facilities

Trainer datasets preserve opponent information exactly as defined within official games.

---

## Item Data

Examples include:

- Items
- Machines
- Berries
- Held Items
- Key Items
- Battle Items

Item datasets preserve official item definitions.

---

## Asset Data

Examples include:

- Sprites
- Models
- Animations
- Icons
- Cries
- Artwork Metadata

Assets remain associated with their originating games.

---

## Text Data

Examples include:

- Pokémon Names
- Move Names
- Ability Names
- Item Names
- Pokédex Entries
- Trainer Names
- Location Names

Text datasets preserve official localization before canonical processing.

---

# Dataset Ownership

Raw Sources are generated and maintained by Pokémon Companion.

However, they remain archival representations of official data rather than independent sources of truth.

Whenever extraction improves, Raw Sources should be regenerated rather than edited manually.

---

# Dataset Consumers

Raw Sources are consumed by:

- Canonical Database Generation
- Verification Tools
- Build Pipeline
- Validation Framework

Application Services, Frontend Applications, and AI systems should never consume Raw Sources directly.

---

# Validation

Raw Sources are validated immediately after extraction.

Validation includes:

- File integrity
- Schema validation
- Metadata completeness
- Source consistency
- Duplicate detection
- Extraction completeness
- Provenance verification

Validation confirms that Raw Sources accurately represent the extracted official data before canonical processing begins.

---

# Layer 3 — Canonical Datasets

## Purpose

Canonical Datasets define Pokémon Companion's permanent representation of official Pokémon knowledge.

Unlike Raw Sources, which preserve the structure of individual games, Canonical Datasets organize information into stable entities that remain consistent across every supported Pokémon title.

Each canonical concept exists exactly once within the Canonical Database.

Historical differences between games are represented through contexts and relationship datasets rather than duplicate canonical records.

Canonical Datasets form the foundation of Pokémon Companion's knowledge graph.

---

# Dataset Characteristics

Canonical Datasets have the following characteristics:

- One dataset per canonical entity
- Version-independent whenever possible
- Stable identifiers
- No duplicated concepts
- Fully validated
- Source-attributed
- Context-aware
- Independent of generated datasets

Canonical Datasets prioritize correctness, consistency, and maintainability.

---

# Core Canonical Datasets

Each canonical dataset represents one permanent Pokémon concept.

---

## Game Family

Datasets include:

- Generations
- Version Groups
- Versions
- Game Contexts

Purpose

Defines the complete hierarchy of supported Pokémon games.

Consumers

- Relationship Layer
- Generated Database
- Application Services

---

## World

Datasets include:

- Regions
- Locations
- Location Areas
- Maps
- Routes
- Cities
- Landmarks

Purpose

Defines the explorable Pokémon world independently from any specific game implementation.

Consumers

- Relationship Layer
- Generated Database
- World Explorer
- Adventure Tracker

---

## Species

Dataset

- species

Purpose

Defines every official Pokémon species.

Species describe permanent biological concepts independent of individual forms or game contexts.

Consumers

- Pokémon
- Evolutions
- Pokédex
- Generated Database

---

## Forms

Dataset

- forms

Purpose

Defines every official Pokémon form.

Examples include:

- Regional Forms
- Mega Evolution Forms
- Gigantamax Forms
- Primal Forms
- Alternate Forms

Forms remain independent from battle-specific Pokémon instances.

Consumers

- Pokémon
- Relationship Layer
- Generated Database

---

## Pokémon

Dataset

- pokemon

Purpose

Defines every canonical Pokémon representation.

Pokémon combine Species with Forms while remaining independent of trainer-owned Pokémon.

Consumers

- Learnsets
- Evolutions
- Encounters
- Sprites
- Models

---

## Moves

Dataset

- moves

Purpose

Defines every official Pokémon move.

Consumers

- Learnsets
- Machines
- Battle Systems
- AI

---

## Abilities

Dataset

- abilities

Purpose

Defines every official Pokémon ability.

Consumers

- Pokémon
- Battle Systems
- Generated Database

---

## Types

Dataset

- types

Purpose

Defines elemental Pokémon types and their permanent characteristics.

Consumers

- Pokémon
- Moves
- Type Effectiveness
- Team Analysis

---

## Items

Dataset

- items

Purpose

Defines every official Pokémon item.

Consumers

- Machines
- Encounters
- Trainers
- Battle Systems

---

## Evolution Methods

Dataset

- evolution-methods

Purpose

Defines every official evolution mechanism.

Consumers

- Evolution Relationships
- Pokédex
- AI Assistant

---

## Machines

Dataset

- machines

Purpose

Defines technical machines, hidden machines, technical records, and future teaching systems.

Consumers

- Learnsets
- Relationship Layer

---

## Trainers

Dataset

- trainers

Purpose

Defines canonical trainer identities.

Consumers

- Trainer Parties
- Encounters
- Adventure Tracker

---

## Encounters

Dataset

- encounters

Purpose

Defines encounter definitions independently from locations.

Consumers

- World Explorer
- Adventure Tracker
- Generated Database

---

## Pokédex Entries

Dataset

- pokedex-entries

Purpose

Stores official Pokédex descriptions across supported games and languages.

Consumers

- Pokédex
- AI Assistant

---

## Assets

Datasets include:

- Sprites
- Models
- Artwork Metadata
- Icons
- Animations

Purpose

Defines canonical visual representations of Pokémon and related entities.

Consumers

- Frontend
- Generated Database

---

# Dataset Ownership

Canonical Datasets are owned and maintained by Pokémon Companion.

They are generated from validated Raw Sources through the normalization process.

Canonical Datasets become the permanent source of truth for every later stage of the build pipeline.

No application should modify Canonical Datasets directly.

---

# Dataset Consumers

Canonical Datasets are consumed by:

- Relationship Datasets
- Generated Datasets
- Validation Framework
- Application Services
- Intelligence Layer

Every later layer depends upon the stability of the Canonical Database.

---

# Validation

Canonical Datasets undergo comprehensive validation.

Validation includes:

- Identifier validation
- Duplicate detection
- Required property validation
- Metadata validation
- Provenance verification
- Context consistency
- Historical consistency

Only validated canonical datasets may progress to the Relationship Layer.

---

# Layer 4 — Relationship Datasets

## Purpose

Relationship Datasets define the connections between canonical entities throughout Pokémon Companion.

Rather than embedding relationships directly within canonical datasets, every significant connection is represented as an independent dataset.

This approach minimizes duplication, preserves historical accuracy, simplifies validation, and enables efficient navigation throughout the knowledge graph.

Relationship Datasets transform isolated canonical entities into a fully interconnected Pokémon ecosystem.

---

# Dataset Characteristics

Relationship Datasets have the following characteristics:

- Connect two or more canonical entities
- Context-aware
- Version-aware
- Historically accurate
- Independently validated
- Source-attributed
- Deterministically generated

Relationships should contain only connection-specific information.

Canonical properties remain within their respective canonical datasets.

---

# Core Relationship Datasets

Each relationship dataset describes one specific connection within the Pokémon universe.

---

## Species Relationships

Datasets include:

- species-has-form
- species-has-pokemon

Purpose

Defines how Species relate to their Forms and canonical Pokémon representations.

Consumers

- Pokédex
- Generated Database
- Intelligence Layer

---

## Pokémon Relationships

Datasets include:

- pokemon-has-type
- pokemon-has-ability
- pokemon-learns-move
- pokemon-evolves-into-pokemon
- pokemon-has-sprite
- pokemon-has-model

Purpose

Defines the characteristics and progression of every canonical Pokémon.

Consumers

- Battle Systems
- Pokédex
- Team Analysis
- AI Assistant

---

## Move Relationships

Datasets include:

- machine-teaches-move
- move-has-type
- move-has-damage-class
- move-has-target

Purpose

Defines how moves interact with machines and battle mechanics.

Consumers

- Move Pages
- Battle Tools
- Generated Database

---

## World Relationships

Datasets include:

- game-contains-region
- region-contains-location
- location-contains-area
- area-contains-encounter

Purpose

Defines the hierarchical structure of the Pokémon world.

Consumers

- World Explorer
- Adventure Tracker
- Map Systems

---

## Encounter Relationships

Datasets include:

- encounter-contains-pokemon
- encounter-requires-condition
- encounter-occurs-in-context

Purpose

Defines how Pokémon are encountered across every supported game.

Consumers

- Encounter Tables
- Route Guides
- AI Assistant

---

## Trainer Relationships

Datasets include:

- trainer-uses-pokemon
- trainer-appears-in-game
- trainer-located-at-location

Purpose

Defines trainer battles and trainer progression.

Consumers

- Trainer Database
- Adventure Tracker
- Battle Reference

---

## Item Relationships

Datasets include:

- item-used-for-evolution
- item-found-at-location
- item-held-by-pokemon
- item-available-in-game

Purpose

Defines how items interact with Pokémon and the game world.

Consumers

- Item Database
- World Explorer
- AI Assistant

---

## Context Relationships

Datasets include:

- context-enables-pokemon
- context-enables-move
- context-enables-item
- context-enables-mechanic

Purpose

Determines which entities and relationships are active within a specific Game Context.

Consumers

- Context Engine
- Generated Database
- Application Services

---

# Dataset Ownership

Relationship Datasets are generated from Canonical Datasets and Raw Sources.

They are maintained automatically and should never be edited manually.

Changes to canonical entities or official game data should regenerate the affected relationships.

---

# Dataset Consumers

Relationship Datasets are consumed by:

- Generated Datasets
- Application Services
- Search Engine
- Navigation Systems
- Intelligence Layer
- Validation Framework

Every feature that traverses the knowledge graph depends upon these datasets.

---

# Validation

Relationship Datasets undergo extensive validation.

Validation includes:

- Entity existence
- Identifier validation
- Duplicate relationships
- Context validation
- Historical consistency
- Circular relationship detection (where applicable)
- Provenance verification

Relationships containing invalid references should prevent the build from succeeding.

---

# Layer 5 — Generated Datasets

## Purpose

Generated Datasets provide optimized representations of Pokémon Companion's knowledge graph.

Unlike Canonical and Relationship Datasets, Generated Datasets are created specifically for application performance, efficient querying, fast navigation, and intelligent analysis.

Every generated dataset is derived entirely from validated Canonical Datasets and Relationship Datasets.

Generated Datasets should never become the source of truth.

They exist solely to improve performance and developer experience.

Whenever the canonical knowledge graph changes, generated datasets should be regenerated automatically.

---

# Dataset Characteristics

Generated Datasets have the following characteristics:

- Automatically generated
- Deterministic
- Reproducible
- Optimized for performance
- Read-only
- Fully validated
- Derived from canonical data
- Never manually maintained

Generated datasets should minimize runtime computation throughout the application.

---

# Dataset Categories

Generated Datasets are organized according to their purpose rather than the entities they represent.

---

## Lookup Datasets

Lookup datasets provide fast access to canonical entities through optimized indexes.

Examples include:

- Pokémon Lookup
- Species Lookup
- Move Lookup
- Ability Lookup
- Item Lookup
- Type Lookup
- Trainer Lookup
- Location Lookup

Purpose

Enable constant-time or near constant-time retrieval of canonical entities.

Consumers

- Backend Services
- Frontend
- AI
- Search Engine

---

## Search Datasets

Search datasets support fast discovery of Pokémon knowledge.

Examples include:

- Global Search Index
- Autocomplete Index
- Alias Index
- Name Index
- Keyword Index
- Full Text Index

Purpose

Provide efficient search across every supported entity.

Consumers

- Search Service
- AI Assistant
- Frontend

---

## Navigation Datasets

Navigation datasets simplify movement throughout the knowledge graph.

Examples include:

- Pokémon by Type
- Pokémon by Ability
- Pokémon by Region
- Pokémon by Generation
- Pokémon by Game
- Moves by Type
- Items by Category
- Trainers by Region

Purpose

Reduce expensive relationship traversal during normal application usage.

Consumers

- Frontend
- Navigation
- Search
- AI

---

## Relationship Views

Relationship Views provide optimized access to commonly used relationship data.

Examples include:

- Evolution Graph
- Learnsets
- Encounter Tables
- Species Forms
- Machine Compatibility
- Type Effectiveness
- Regional Pokédexes

Purpose

Expose complex relationship data through application-friendly structures.

Consumers

- Pokédex
- Adventure Tracker
- Team Builder
- Battle Tools

---

## Analytical Datasets

Analytical datasets contain pre-computed statistics and derived information.

Examples include:

- Type Coverage
- Collection Statistics
- Encounter Statistics
- Battle Statistics
- Completion Statistics
- Evolution Statistics

Purpose

Reduce runtime calculations for advanced features.

Consumers

- Team Analysis
- Collection Tracker
- AI Assistant
- Dashboard

---

## Build Metadata

Metadata datasets describe the generated database itself.

Examples include:

- Build Manifest
- Dataset Manifest
- Build Version
- Generator Versions
- Validation Summary
- Generation Timestamp
- Supported Games

Purpose

Support reproducibility, debugging, auditing, and deployment.

Consumers

- Build System
- Validation
- Developers
- Deployment Pipeline

---

# Dataset Ownership

Generated Datasets are produced automatically by the build pipeline.

They should never be edited manually.

Whenever canonical data changes, the affected generated datasets should be regenerated.

Generated datasets are disposable implementation artifacts rather than permanent knowledge stores.

---

# Dataset Consumers

Generated Datasets are consumed by:

- Application Services
- User Experience Platform
- Intelligence Layer
- Community Platform
- Search Engine
- External APIs
- Future SDKs

Applications should consume Generated Datasets whenever possible instead of querying the canonical knowledge graph directly.

---

# Validation

Generated Datasets are validated before publication.

Validation includes:

- Schema validation
- Reference validation
- Build consistency
- Metadata validation
- Duplicate detection
- Performance verification
- Completeness validation

Only validated generated datasets should be distributed to application services.

---

# Layer 6 — User Datasets

## Purpose

User Datasets store trainer-specific information created through interaction with Pokémon Companion.

Unlike Official Sources, Raw Sources, Canonical Datasets, Relationship Datasets, and Generated Datasets, User Datasets are unique to each individual trainer.

These datasets record personal progress, preferences, collections, and application settings while maintaining complete separation from the canonical Pokémon knowledge graph.

User Datasets should reference canonical entities through permanent identifiers without modifying official Pokémon data.

---

# Dataset Characteristics

User Datasets have the following characteristics:

- User-owned
- Persistent
- Cloud synchronizable
- Independently versioned
- Privacy-aware
- Canonical reference based
- Never generated from official data
- Never modify canonical datasets

User Datasets prioritize personalization, reliability, and privacy.

---

# Dataset Categories

User Datasets are organized according to trainer activities.

---

## Account Datasets

Examples include:

- User Profile
- Authentication
- Preferences
- Settings
- Privacy Configuration
- Notification Preferences

Purpose

Store trainer identity and application preferences.

Consumers

- Application Services
- User Experience Platform

---

## Team Datasets

Examples include:

- Saved Teams
- Team Members
- Nicknames
- Team Notes
- Battle Roles
- Team Tags

Purpose

Store trainer-created Pokémon teams independently from canonical Pokémon data.

Consumers

- Team Builder
- Battle Tools
- AI Assistant

---

## Collection Datasets

Examples include:

- National Pokédex Progress
- Regional Pokédex Progress
- Living Dex
- Shiny Collection
- Form Collection
- Ribbon Collection
- Mark Collection
- Item Collection

Purpose

Track each trainer's collection progress.

Consumers

- Collection Tracker
- Dashboard
- Achievement System

---

## Adventure Datasets

Examples include:

- Current Adventure
- Story Progress
- Gym Badges
- Elite Four Progress
- Champion Status
- Completed Objectives
- Personal Notes
- Challenge Runs

Purpose

Track progress throughout supported Pokémon games.

Consumers

- Adventure Tracker
- Dashboard
- AI Assistant

---

## Achievement Datasets

Examples include:

- Achievement Progress
- Completed Achievements
- Milestones
- Rewards
- Statistics

Purpose

Track long-term trainer accomplishments.

Consumers

- Dashboard
- Community Platform
- Collection Tracker

---

## AI Datasets

Examples include:

- Conversation History
- Saved Prompts
- AI Preferences
- Personalized Recommendations
- Interaction History

Purpose

Provide continuity and personalization for intelligent features.

Consumers

- Intelligence Layer
- AI Assistant

---

## Community Datasets

Examples include:

- Friends
- Friend Requests
- Shared Teams
- Shared Collections
- Community Activity
- Event Participation

Purpose

Support optional community interactions between trainers.

Consumers

- Community Platform

---

# Dataset Ownership

User Datasets belong exclusively to the trainer.

Pokémon Companion manages the storage and synchronization of these datasets but does not treat them as canonical Pokémon knowledge.

Users should retain ownership and control over their personal information.

---

# Dataset Consumers

User Datasets are consumed by:

- Application Services
- User Experience Platform
- Trainer Experience
- Intelligence Layer
- Community Platform

Canonical and Relationship Datasets should never depend upon User Datasets.

---

# Validation

User Datasets undergo validation to ensure data integrity.

Validation includes:

- Authentication validation
- Canonical reference validation
- Data consistency
- Permission validation
- Synchronization validation
- Version compatibility

Validation should protect user data while maintaining compatibility with the canonical knowledge graph.

---

# Dataset Metadata

## Purpose

Every dataset within Pokémon Companion should include standardized metadata describing its identity, origin, ownership, lifecycle, and validation status.

Consistent metadata improves traceability, debugging, validation, automation, and long-term maintenance.

Metadata should describe the dataset itself rather than the data it contains.

---

## Standard Metadata

Every dataset should define the following metadata where applicable.

### Dataset Identifier

A permanent identifier that uniquely identifies the dataset within Pokémon Companion.

Examples:

- species
- pokemon
- pokemon-has-ability
- pokemon-lookup
- trainer-collections

Dataset identifiers should remain stable over time.

---

### Display Name

A human-readable name used throughout documentation and developer tooling.

Examples:

- Species
- Pokémon
- Pokémon Has Ability
- Pokémon Lookup
- Trainer Collections

Display names should never be used as permanent identifiers.

---

### Dataset Layer

Identifies which architectural layer owns the dataset.

Possible values include:

- Official Sources
- Raw Sources
- Canonical Datasets
- Relationship Datasets
- Generated Datasets
- User Datasets

Each dataset belongs to exactly one layer.

---

### Dataset Type

Describes the dataset's architectural purpose.

Examples include:

- Canonical
- Relationship
- Generated
- User
- Metadata
- Configuration

Dataset type helps determine how the dataset is generated, validated, and consumed.

---

### Source

Identifies where the dataset originates.

Examples include:

- Official Game Data
- Raw Sources
- Canonical Database
- Relationship Layer
- Build Pipeline
- User Input

Every dataset should have a clearly defined origin.

---

### Consumers

Lists the systems that depend upon the dataset.

Examples include:

- Validation Framework
- Application Services
- User Experience Platform
- Intelligence Layer
- Community Platform

Understanding dataset consumers simplifies dependency management.

---

### Generation Method

Describes how the dataset is created.

Examples include:

- Extracted
- Normalized
- Generated
- User Managed

This field documents the dataset lifecycle.

---

### Validation Status

Records whether the dataset has successfully passed the validation pipeline.

Possible values include:

- Pending
- Validated
- Deprecated
- Archived

Only validated datasets should progress through the build pipeline.

---

### Version

Records the dataset version used for compatibility and maintenance.

Version information supports reproducible builds and future schema evolution.

---

### Status

Indicates the current lifecycle state of the dataset.

Possible values include:

- Planned
- Active
- Deprecated
- Archived

Status provides visibility into long-term maintenance and future development.

---

# Dataset Ownership

Dataset ownership follows the ownership model defined in Data Architecture.

This document identifies the owner of each dataset.

---

# Future Compatibility

As Pokémon Companion expands, new datasets should integrate into the existing ownership model rather than introducing new ownership rules.

Maintaining consistent ownership simplifies validation, documentation, automation, and long-term maintenance while preserving the integrity of the project's knowledge graph.

---

# Dataset Validation

Datasets follow the validation framework defined in Validation Principles.

This document records

• which datasets are validated

• which layer validates them

• their validation status

---

# Future Expansion

As Pokémon Companion grows, new validation rules should extend the existing framework rather than replacing it.

Future validation may include:

- Performance validation
- AI dataset validation
- Localization validation
- Asset validation
- Community dataset validation
- Security validation

Expanding the validation framework ensures that the project's data quality remains consistent as new datasets and features are introduced.

---

# Dataset Naming Standards

Dataset names follow the Naming Standards defined in Database Schema.

Only dataset-specific conventions are documented here.

---

# Internal Identifiers

Every dataset should also define a stable internal identifier.

Examples:

```text
species
pokemon
moves
pokemon-has-ability
pokemon-lookup
trainer-collections
```

Internal identifiers should:

- remain stable
- be language-independent
- never depend on display names
- never change without a documented migration strategy

---

# Reserved Terms

Certain terms have specific architectural meanings and should be used consistently throughout the project.

Examples include:

- Canonical
- Relationship
- Generated
- Context
- Validation
- Metadata
- Lookup
- Index
- Manifest

These terms should not be reused for unrelated purposes.

---

# Future Compatibility

Future datasets should follow the established naming conventions without introducing alternative styles.

Maintaining a single naming system improves automation, documentation, validation, and developer experience while ensuring Pokémon Companion remains consistent as the project continues to expand.

---

# Dataset Versioning

Dataset versioning follows the Versioning Strategy defined in Database Schema.

This document records only dataset-specific version metadata.

---

# Compatibility

Dataset changes should be classified according to their impact.

### Compatible Changes

Examples include:

- Adding new records
- Adding optional fields
- Supporting new Pokémon games
- Extending metadata
- Improving validation

These changes should not require dataset consumers to be rewritten.

---

### Breaking Changes

Examples include:

- Removing required fields
- Changing identifier formats
- Renaming canonical datasets
- Modifying relationship semantics
- Removing supported structures

Breaking changes should be rare, carefully documented, and introduced only when absolutely necessary.

---

# Version Tracking

Every build should record the versions of all major datasets.

Examples include:

- Dataset Version
- Build Version
- Schema Version
- Generator Version
- Validation Version

Version tracking improves debugging, auditing, and long-term reproducibility.

---

# Future Compatibility

The versioning strategy should allow Pokémon Companion to support future Pokémon generations without requiring structural redesign.

Future datasets should extend existing systems while preserving historical compatibility and maintaining stable canonical references.

Versioning is considered a long-term architectural commitment rather than an implementation detail.

---

# Future Expansion

Pokémon Companion is designed to evolve alongside the Pokémon franchise.

As new games, mechanics, platforms, and technologies are introduced, new datasets should integrate into the existing architecture without requiring structural redesign.

Future expansion should extend the dataset ecosystem while preserving the architectural principles established throughout this document.

---

## Expansion Principles

Future datasets should:

- Follow the established architectural layers.
- Have one clearly defined responsibility.
- Belong to exactly one owning layer.
- Reuse existing canonical entities whenever possible.
- Introduce new relationships instead of duplicating information.
- Be fully documented before implementation.
- Be validated before publication.

Expanding the dataset ecosystem should strengthen the architecture rather than increase complexity.

---

## Future Dataset Categories

As Pokémon Companion grows, additional datasets may include:

### World Data

Examples include:

- Buildings
- NPC Database
- Interactive Maps
- Landmark Database
- Route Connections
- Dungeon Layouts

---

### Battle Data

Examples include:

- Battle Facilities
- Battle Rules
- Rental Teams
- Competitive Formats
- Battle Records

---

### Gameplay Data

Examples include:

- Side Quests
- Missions
- Achievements
- Minigames
- Contest Data
- Pokéathlon Data

---

### Event Data

Examples include:

- Mystery Gifts
- Distribution Events
- Limited-Time Events
- Promotional Pokémon
- Event Items

---

### Collection Data

Examples include:

- Ribbon Database
- Mark Database
- Decoration Database
- Fashion Items
- Trainer Card Data

---

### Intelligence Data

Examples include:

- AI Knowledge Cache
- Recommendation Models
- Strategy Datasets
- Analytical Reports
- Usage Statistics

These datasets should enhance intelligent features without becoming canonical sources of truth.

---

## Evolution Strategy

Future datasets should integrate into existing architectural layers rather than creating new layers.

Whenever possible:

- Extend Canonical Datasets.
- Extend Relationship Datasets.
- Regenerate Generated Datasets.
- Preserve User Datasets.

Maintaining a stable architecture simplifies long-term maintenance and future development.

---

## Documentation

Every new dataset introduced into Pokémon Companion should be documented before implementation.

Documentation should include:

- Purpose
- Ownership
- Architectural Layer
- Source
- Consumers
- Validation
- Versioning
- Relationships

This document should remain the authoritative catalog of every dataset used throughout Pokémon Companion.

---

# Document Status

**Document Version:** 1.0

**Status:** Approved

This document defines the complete dataset ecosystem used by Pokémon Companion.

Detailed dataset structures, entity definitions, relationship schemas, generation pipelines, and implementation details are documented separately within the project's architectural and reference documentation.

As Pokémon Companion evolves, this document should be updated to reflect new datasets while preserving the architectural principles established throughout Version 1.0.