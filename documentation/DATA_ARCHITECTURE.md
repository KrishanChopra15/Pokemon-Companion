# Pokémon Companion Data Architecture

> Defines how Pokémon Companion stores, organizes, validates, and connects every piece of Pokémon knowledge.

---

# Purpose

The Data Architecture defines the structure of every dataset used by Pokémon Companion.

Its purpose is to ensure that Pokémon data remains accurate, historically correct, scalable, maintainable, and fully interconnected across every supported Pokémon game.

Unlike a traditional Pokédex, Pokémon Companion is designed as a long-term Pokémon knowledge platform capable of representing every official Pokémon title, from Pokémon Red to future releases, within a single unified architecture.

This document establishes the principles, layers, relationships, and storage rules that govern the project's database.

Every dataset, generation script, validation script, backend service, and frontend feature must follow the architecture defined here.

No component may bypass these rules.

---

# Goals

The data architecture is designed to achieve the following goals.

## Historical Accuracy

Every supported game should be represented exactly as it exists in the official release.

Pokémon data may differ between games due to changes in mechanics, learnsets, abilities, locations, encounters, items, evolutions, or battle systems.

Rather than replacing older information with newer information, Pokémon Companion preserves every historical state.

---

## Official Source of Truth

Whenever official game data is available, it is considered the canonical source.

External databases are used only for verification, comparison, research, or filling documented gaps.

No unofficial source may override confirmed official data.

---

## Complete Interconnectivity

Every entity inside the database should be connected through explicit relationships.

A user should be able to navigate naturally between related information without duplication.

Examples include:

- Pokémon → Moves
- Move → Pokémon that learn it
- Pokémon → Abilities
- Ability → Pokémon with that ability
- Pokémon → Evolution Chain
- Evolution → Required Method
- Location → Encounter Tables
- Encounter → Available Pokémon
- Game → Regions
- Region → Locations
- Trainer → Party Pokémon
- Item → Machines
- Machine → Move
- Move → Machines
- Species → Forms
- Form → Pokémon

The database should behave as a unified knowledge graph rather than a collection of isolated files.

---

## Scalability

The architecture must support future Pokémon games without requiring major structural changes.

Adding a new game should primarily involve importing new official data rather than redesigning the database.

Future mechanics should be introduced as new entities or relationships whenever possible instead of modifying existing structures.

---

## Maintainability

Every dataset should have a clearly defined owner.

Each piece of information should exist in only one canonical location.

Generated datasets should never become the primary source of truth.

The build pipeline should be capable of regenerating every derived dataset from canonical data at any time.

---

## Performance

The application should never require expensive runtime processing of raw datasets.

Instead, optimized generated datasets should provide fast lookups, search indexes, navigation indexes, and relationship indexes for the frontend and backend.

Raw canonical data prioritizes accuracy.

Generated data prioritizes speed.

---

## Longevity

The database is intended to grow alongside the Pokémon franchise.

Its architecture should remain understandable, modular, and extensible for many years, allowing future contributors to expand the project without restructuring its foundations.

---

# Data Layers

Pokémon Companion organizes information into multiple independent data layers.

Each layer has a single responsibility and exists for a specific purpose within the overall architecture.

Keeping these layers separate ensures that official Pokémon knowledge remains accurate while allowing the application to generate optimized datasets without modifying canonical information.

Every piece of data flows through these layers in a single direction.

```text
Official Sources
        │
        ▼
Raw Extraction
        │
        ▼
Canonical Database
        │
        ▼
Relationship Layer
        │
        ▼
Generated Database
        │
        ▼
Application
        │
        ▼
User Database
```

No layer may directly modify a layer above it.

Derived data may always be regenerated from its parent layer.

---

# Layer 1 — Official Sources

Official Sources represent the highest authority within Pokémon Companion.

Whenever possible, Pokémon Companion derives its data directly from official Pokémon game resources rather than community-maintained databases.

Examples include:

- Official game ROMs
- Official game executables
- Game resource archives
- Official game text
- Official game scripts
- Official battle data
- Official encounter tables
- Official evolution data
- Official move data
- Official item data
- Official Pokémon HOME data (where legally and technically appropriate)

Official data defines the canonical state of every supported Pokémon game.

Third-party databases are never considered the primary source of truth when official data is available.

---

# Layer 2 — Raw Extraction

The Raw Extraction layer contains information extracted directly from official sources.

This layer preserves the structure of the original game data as closely as possible.

Raw Extraction exists for archival purposes and reproducibility.

No normalization or interpretation should occur at this stage.

Characteristics of the Raw Extraction layer include:

- Closely mirrors official game files
- Game-specific structure
- No generated relationships
- No calculated values
- No duplicated information
- Read-only after extraction

This layer allows future extraction improvements without affecting higher layers.

---

# Layer 3 — Canonical Database

The Canonical Database represents Pokémon Companion's official internal representation of Pokémon knowledge.

All game-specific raw data is normalized into a consistent format while preserving historical accuracy.

The Canonical Database defines every entity used throughout the project.

Examples include:

- Games
- Version Groups
- Regions
- Locations
- Location Areas
- Species
- Forms
- Pokémon
- Moves
- Abilities
- Items
- Types
- Natures
- Egg Groups
- Evolution Methods
- Machines
- Trainers
- Trainer Parties
- Encounters
- Pokédex Entries
- Sprites
- Models
- Ribbons
- Marks

Each entity has one canonical representation regardless of how many games reference it.

No generated indexes exist within the Canonical Database.

---

# Layer 4 — Relationship Layer

The Relationship Layer connects canonical entities together.

Rather than embedding large amounts of duplicated information inside individual datasets, Pokémon Companion stores relationships as independent records.

Examples include:

- Pokémon learns Move
- Pokémon has Ability
- Pokémon has Type
- Pokémon evolves into Pokémon
- Pokémon appears in Encounter
- Encounter occurs at Location
- Trainer owns Pokémon
- Machine teaches Move
- Move belongs to Machine
- Species contains Form
- Game contains Region
- Region contains Location

Every relationship is explicit.

This allows every entity to reference every other entity without unnecessary duplication while forming a complete knowledge graph.

---

# Layer 5 — Generated Database

The Generated Database contains datasets created from the Canonical Database and Relationship Layer.

These datasets exist solely to improve application performance.

Generated datasets may include:

- Search indexes
- Lookup tables
- Navigation indexes
- Type indexes
- Ability indexes
- Move indexes
- Evolution graphs
- Region indexes
- Pokémon lookup tables
- Location lookup tables
- Cross-reference indexes

Generated datasets should never become the source of truth.

They may always be deleted and regenerated.

---

# Layer 6 — User Database

The User Database stores trainer-specific information.

Unlike every previous layer, this data is personal and unique to each user.

Examples include:

- User accounts
- Saved teams
- Adventure progress
- Pokédex completion
- Living Dex
- Shiny collections
- Item collections
- Achievement progress
- Personal notes
- Application preferences
- Cloud synchronization data

User data must never modify canonical Pokémon data.

Likewise, canonical data must never depend on user-generated information.

The separation between canonical knowledge and personal progress is fundamental to Pokémon Companion's architecture.

---

# Entity Model

## Purpose

Entities are the fundamental building blocks of Pokémon Companion.

Every piece of official Pokémon knowledge represented by the application should exist as a well-defined entity with its own identity, lifecycle, and relationships.

The Entity Model provides a consistent way to represent Pokémon data across every supported game while preserving historical accuracy and minimizing duplication.

All higher-level systems—including the Relationship Layer, Generated Database, Backend API, AI Assistant, and Frontend—operate on entities defined by this model.

---

# What is an Entity?

An entity is a uniquely identifiable object within the Pokémon universe.

An entity represents a real concept rather than a view, index, or generated dataset.

Examples include:

- A Pokémon Species
- A Pokémon Form
- A Move
- An Ability
- An Item
- A Game
- A Region
- A Route
- A Trainer
- A Nature

Entities are considered canonical objects.

Generated indexes, lookup tables, search results, cached objects, and frontend models are **not** entities.

---

# Canonical Entity Principles

Every entity within Pokémon Companion follows the same core principles.

## Single Identity

Every entity has one permanent identity.

That identity never changes regardless of future games, language translations, or application updates.

---

## Single Source of Truth

Every fact belongs to one canonical entity.

Information should never be duplicated across multiple entities unless explicitly generated during the build pipeline.

---

## Historical Preservation

Entities preserve historical information rather than replacing it.

When official Pokémon games change an entity over time, previous versions remain represented through historical relationships instead of being overwritten.

---

## Independent Existence

Entities should exist independently of one another.

Relationships connect entities together, but entities should not require embedded copies of other entities to remain valid.

---

## Stable References

Relationships should always reference entity identifiers rather than names.

Names may change over time.

Identifiers must remain stable.

---

# Canonical Entity Categories

The Canonical Database is composed of multiple entity categories.

Each category represents a distinct aspect of the Pokémon universe.

Current planned entity categories include:

## Core World

- Game
- Generation
- Version
- Version Group
- Region
- Location
- Location Area

---

## Pokémon Biology

- Species
- Form
- Pokémon
- Type
- Ability
- Nature
- Egg Group
- Growth Rate
- Gender Ratio
- Evolution Method

---

## Battle System

- Move
- Move Effect
- Move Target
- Damage Class
- Status Condition
- Battle Mechanic

---

## Items

- Item
- Item Category
- Machine
- Berry
- Poké Ball
- Held Item
- Key Item

---

## Encounters

- Encounter Table
- Encounter Slot
- Encounter Method
- Wild Pokémon
- Static Encounter
- Gift Pokémon

---

## Trainers

- Trainer
- Trainer Class
- Trainer Party

---

## Collections

- Pokédex Entry
- Ribbon
- Mark
- Achievement

---

## Assets

- Sprite
- Model
- Artwork
- Icon
- Cry

---

# Entity Responsibilities

Each entity is responsible only for describing itself.

Relationships to other entities should be expressed through the Relationship Layer rather than embedding large amounts of duplicated information.

For example:

A Move entity describes the move itself.

It should not contain a complete list of every Pokémon that can learn it.

Instead, those connections belong to relationship records.

Likewise:

A Pokémon entity describes the Pokémon.

It should not permanently embed every move, encounter, evolution, or trainer that references it.

This separation keeps entities small, reusable, and historically accurate.

---

# Entity Lifecycle

Every canonical entity follows the same lifecycle.

```text
Official Game Data
        │
        ▼
Raw Extraction
        │
        ▼
Canonical Entity
        │
        ▼
Relationship Layer
        │
        ▼
Generated Views
        │
        ▼
Frontend / Backend / AI
```

Canonical entities are immutable representations of official Pokémon knowledge.

Application features consume generated views rather than modifying canonical entities directly.

---

# Entity Stability

Once an entity has been introduced into the Canonical Database:

- Its identity should never change.
- Its identifier should never be reused.
- Historical information should never be deleted.
- Future games may extend the entity but should not invalidate previous representations.

This guarantees long-term compatibility across future Pokémon generations and application updates.

---

# Relationship Model

## Purpose

While entities describe individual pieces of Pokémon knowledge, relationships describe how those entities connect to one another.

Pokémon Companion is designed as a unified knowledge graph rather than a collection of independent datasets.

Every meaningful connection between two entities should be represented explicitly through the Relationship Layer.

This approach minimizes duplication, improves maintainability, preserves historical accuracy, and allows every part of the application to navigate seamlessly between related information.

---

# Relationship Principles

Every relationship within Pokémon Companion follows a consistent set of architectural principles.

## Explicit Relationships

Relationships should always be stored explicitly.

If two entities are connected, that connection should exist as its own relationship rather than being inferred from duplicated data.

---

## Stable References

Relationships always reference canonical entity identifiers.

Relationships must never rely on display names, localized names, or generated indexes.

Identifiers remain stable even when names change between games or languages.

---

## Bidirectional Navigation

Relationships should allow navigation in both directions.

For example:

- Pokémon → Moves
- Move → Pokémon

- Species → Forms
- Form → Species

- Game → Locations
- Location → Game

The application should never require duplicated datasets simply to support reverse lookups.

---

## Version Awareness

Relationships may vary between games.

Rather than replacing old relationships with newer ones, Pokémon Companion preserves every historical relationship.

Examples include:

- Learnsets changing between generations
- Ability availability changing over time
- Encounter tables differing between games
- Evolution methods changing in later generations
- Item locations changing between versions

Relationships therefore include the appropriate historical context required to determine when they are valid.

---

## No Embedded Knowledge

Entities describe themselves.

Relationships describe how entities connect.

For example:

A Move entity defines:

- Name
- Type
- Power
- Accuracy
- Effect

It does not permanently store every Pokémon capable of learning the move.

Likewise, a Pokémon entity does not permanently embed every move, encounter, evolution, or trainer associated with it.

These connections belong to relationship records.

---

# Relationship Categories

Relationships fall into several categories.

## Biological Relationships

Examples include:

- Species contains Form
- Pokémon has Type
- Pokémon has Ability
- Pokémon belongs to Egg Group
- Pokémon uses Growth Rate

---

## Evolution Relationships

Examples include:

- Pokémon evolves into Pokémon
- Evolution requires Item
- Evolution requires Move
- Evolution requires Friendship
- Evolution requires Time
- Evolution requires Region

---

## Battle Relationships

Examples include:

- Pokémon learns Move
- Machine teaches Move
- Move belongs to Damage Class
- Move targets Battle Position
- Ability modifies Move
- Item affects Battle

---

## World Relationships

Examples include:

- Game contains Region
- Region contains Location
- Location contains Area
- Area contains Encounter Table
- Encounter Table contains Pokémon

---

## Trainer Relationships

Examples include:

- Trainer appears in Game
- Trainer owns Pokémon
- Trainer belongs to Trainer Class
- Trainer appears at Location

---

## Collection Relationships

Examples include:

- Pokémon has Pokédex Entry
- Pokémon has Sprite
- Pokémon has Artwork
- Pokémon has Model
- Pokémon can receive Ribbon
- Pokémon can receive Mark

---

# Relationship Cardinality

Relationships define how many entities may connect to one another.

Supported relationship types include:

- One-to-One (1:1)
- One-to-Many (1:N)
- Many-to-One (N:1)
- Many-to-Many (N:N)

Examples:

Game → Region (1:N)

Region → Location (1:N)

Pokémon ↔ Move (N:N)

Trainer → Party Pokémon (1:N)

Machine → Move (1:1)

Move ↔ Machine (1:N across different games)

---

# Relationship Metadata

Relationships may contain metadata describing the conditions under which they are valid.

Examples include:

- Game
- Version
- Version Group
- Generation
- Method
- Level
- Time
- Weather
- Season
- Required Item
- Required Ability
- Required Form
- Probability
- Encounter Rate

This allows Pokémon Companion to represent relationships exactly as they exist in each official game.

---

# Relationship Lifecycle

Every relationship follows the same lifecycle.

```text
Official Game Data
        │
        ▼
Relationship Extraction
        │
        ▼
Canonical Relationship
        │
        ▼
Relationship Validation
        │
        ▼
Generated Indexes
        │
        ▼
Frontend / Backend / AI
```

Relationships remain immutable records of official game data.

Generated indexes may optimize access to relationships but never replace the canonical relationship records.

---

# Knowledge Graph Philosophy

The Relationship Layer transforms the Canonical Database into a complete knowledge graph.

Users should be able to navigate naturally between connected information without encountering isolated datasets.

For example:

Pokémon
→ Learnset
→ Move
→ Machines
→ Games
→ Locations
→ Encounter Tables
→ Other Pokémon

Likewise:

Game
→ Region
→ Location
→ Trainer
→ Trainer Party
→ Pokémon
→ Evolution
→ Item
→ Move

Every entity should be reachable through meaningful relationships while preserving historical accuracy and minimizing duplicated information.

This interconnected model forms the foundation of Pokémon Companion's navigation, search, backend services, and future AI features.

---

# Versioning Model

## Purpose

One of the primary goals of Pokémon Companion is to preserve the historical accuracy of every official Pokémon game.

Rather than presenting Pokémon data as a single modern snapshot, the database represents each game exactly as it existed at the time of its official release.

The Versioning Model defines how Pokémon Companion represents games, versions, mechanics, and historical changes while maintaining a unified knowledge graph.

Every canonical entity and relationship must follow the versioning rules defined in this section.

---

# Version Hierarchy

Pokémon Companion organizes official releases into a hierarchical structure.

```text
Generation
      │
      ▼
Game
      │
      ▼
Version
      │
      ▼
Version Group
      │
      ▼
Mechanics
```

Each level has a distinct responsibility.

---

## Generation

A Generation represents a major era of Pokémon game mechanics.

Examples include:

- Generation I
- Generation II
- Generation III
- Generation IV
- Generation V
- Generation VI
- Generation VII
- Generation VIII
- Generation IX

Generations introduce major gameplay systems, mechanics, Pokémon species, battle rules, and regional content.

Generations provide historical context but do not directly determine gameplay behaviour.

---

## Game

A Game represents an individual official Pokémon title.

Examples include:

- Pokémon Red
- Pokémon Blue
- Pokémon Yellow
- Pokémon Crystal
- Pokémon Emerald
- Pokémon FireRed
- Pokémon Platinum
- Pokémon Black 2
- Pokémon X
- Pokémon Ultra Moon
- Pokémon Sword
- Pokémon Legends: Arceus
- Pokémon Scarlet
- Pokémon Legends: Z-A

Spin-off titles supported by Pokémon Companion are also represented as Games.

Examples include:

- Pokémon Colosseum
- Pokémon XD: Gale of Darkness
- Pokémon GO
- Pokémon HOME
- Pokémon Battle Revolution
- PokéPark
- Pokémon Trading Card Game

Every supported official title has its own Game entity.

---

## Version

A Version represents a specific playable release of a game.

Examples include:

- Red
- Blue
- Scarlet
- Violet
- Black
- White
- Black 2
- White 2

Versions may differ in:

- Available Pokémon
- Encounter tables
- Trainers
- Items
- Story events
- Exclusive content
- Legendary Pokémon
- Regional Pokédex

Version-specific differences are preserved rather than merged.

---

## Version Group

A Version Group represents multiple game versions that share identical or nearly identical mechanics and data structures.

Examples include:

- Red / Blue
- Ruby / Sapphire
- Diamond / Pearl
- Scarlet / Violet

Version Groups simplify historical relationships while preserving version-specific content where necessary.

Not every relationship is version-group based.

Some relationships remain specific to an individual version.

---

## Mechanics

Mechanics represent the gameplay rules active within a particular historical context.

Examples include:

- Physical / Special split
- Fairy type introduction
- Mega Evolution
- Z-Moves
- Dynamax
- Terastalization
- Battle styles
- Move effects
- Ability behaviour

Mechanics are version-aware and may change independently of entities.

---

# Historical Preservation

Historical information is never overwritten.

When official Pokémon games change data over time, Pokémon Companion preserves every historical state.

Examples include:

- Learnsets changing between generations
- Base stats being adjusted
- Abilities being added or removed
- Evolution methods changing
- Item locations changing
- Encounter tables changing
- Battle mechanics changing

Previous historical states remain accessible.

---

# Remakes and Enhanced Versions

Remakes are treated as independent games rather than replacements for their original releases.

Examples include:

- FireRed is not a replacement for Red.
- HeartGold is not a replacement for Gold.
- Omega Ruby is not a replacement for Ruby.
- Brilliant Diamond is not a replacement for Diamond.

Likewise, enhanced editions remain independent historical releases.

Examples include:

- Yellow
- Crystal
- Emerald
- Platinum
- Ultra Sun
- Ultra Moon

Each release preserves its own official data.

---

# Version-Aware Relationships

Relationships may exist only within specific historical contexts.

For example:

- A Pokémon may learn a move in one generation but not another.
- An encounter may exist in one game but not another.
- A trainer party may differ between versions.
- An item may appear in different locations across releases.

Relationships therefore include the appropriate version information required to determine when they are valid.

---

# Future Compatibility

The Versioning Model is designed to support future Pokémon titles without requiring structural changes.

Adding a new official game should primarily involve importing new canonical data and establishing new version-aware relationships.

Existing historical data should remain unchanged.

New games extend the database rather than replacing previous information.

This approach ensures Pokémon Companion remains historically accurate across the entire lifespan of the Pokémon franchise.

---

# Identifier Rules

## Purpose

Every entity and relationship within Pokémon Companion must have a stable, permanent, and globally unique identity.

Identifiers form the backbone of the entire knowledge graph.

Every relationship, generated dataset, backend service, frontend component, validation script, and future AI feature depends on identifiers remaining consistent over time.

The rules defined in this section ensure that Pokémon Companion can continue evolving for many years without breaking compatibility between datasets or application versions.

---

# Core Principles

## Permanence

Once an identifier has been assigned, it must never change.

Changes to an entity's name, appearance, mechanics, or properties must never require a new identifier unless the entity itself is fundamentally different.

Stable identifiers allow relationships created today to remain valid across future versions of the database.

---

## Global Uniqueness

Every identifier must be globally unique within its entity type.

No two entities of the same type may share the same identifier.

For example:

- Every Game has a unique Game ID.
- Every Species has a unique Species ID.
- Every Pokémon Form has a unique Form ID.
- Every Move has a unique Move ID.
- Every Ability has a unique Ability ID.

This guarantees that every reference resolves to exactly one canonical entity.

---

## Canonical Identity

Identifiers represent the canonical identity of an entity rather than its presentation.

Names, localized text, icons, artwork, and other display properties may change over time without affecting the entity's identity.

For example:

- Display names may be translated into multiple languages.
- Official terminology may change between generations.
- Formatting conventions may evolve.

The identifier remains unchanged.

---

## No Meaningful Encoding

Identifiers should not encode business logic.

An identifier should never imply:

- Generation
- Region
- Type
- Category
- Version
- Evolution stage
- Position within another dataset

These properties belong to the entity itself, not its identifier.

This prevents identifiers from becoming obsolete as the Pokémon franchise evolves.

---

## Never Reuse Identifiers

Once an identifier has been retired, it must never be assigned to a different entity.

Historical references should always resolve to the original entity.

This preserves long-term data integrity and prevents ambiguity.

---

# Relationship References

Relationships must always reference canonical identifiers.

Relationships must never depend upon:

- Display names
- Localized names
- Search indexes
- Generated lookup tables
- User-facing URLs

Identifiers are the only supported method for linking canonical entities together.

---

# Generated Datasets

Generated datasets must preserve canonical identifiers.

Generated indexes may reorganize data for performance, but they must never create replacement identifiers.

Every generated record should always be traceable back to its canonical entity.

---

# User Data

User-generated content should reference canonical identifiers rather than copying Pokémon data.

Examples include:

- Saved Pokémon teams
- Pokédex completion
- Adventure progress
- Item collections
- Achievement progress
- AI conversations

This allows canonical Pokémon data to be updated without affecting user progress.

---

# Future Compatibility

Future Pokémon games, mechanics, forms, and entities must extend the identifier system rather than replacing it.

Existing identifiers should remain valid indefinitely.

This ensures long-term compatibility between historical game data, generated datasets, user saves, cloud synchronization, and future application updates.

The identifier system is intended to remain stable for the lifetime of Pokémon Companion.

---

# Source Priority Rules

## Purpose

Pokémon Companion is built upon the principle that official Pokémon game data is the ultimate source of truth.

Multiple public databases, research projects, and community-maintained resources exist within the Pokémon community. While these resources are extremely valuable, they occasionally differ due to interpretation, implementation details, historical inconsistencies, incomplete information, or delayed updates.

The Source Priority Rules define how Pokémon Companion resolves conflicting information while maintaining the highest possible level of historical accuracy.

Every extraction script, normalization process, validation rule, and manual review must follow these rules.

---

# Source Hierarchy

Whenever multiple sources provide conflicting information, the following priority order must be used.

## Priority 1 — Official Game Data

Official game data is the highest authority.

Examples include:

- Official game ROMs
- Official game executables
- Official game resource archives
- Official game text
- Official battle data
- Official encounter tables
- Official evolution data
- Official learnset data
- Official item data
- Official trainer data
- Official Pokédex data

Whenever official game data is available, it overrides every other source.

---

## Priority 2 — Official Updates

Official updates released after a game's launch are considered part of the game's canonical data.

Examples include:

- Software updates
- DLC content
- Balance patches
- Official event updates
- Downloadable content

Updates modify the canonical state of the affected game while preserving previous historical releases where appropriate.

---

## Priority 3 — Official Companion Services

Official Pokémon services may provide additional canonical information that is not directly available within a game.

Examples include:

- Pokémon HOME
- Pokémon Bank
- Official event distributions
- Official Pokémon websites
- Official strategy guides (where applicable)

These sources supplement official game data but do not override confirmed information extracted directly from the games themselves.

---

## Priority 4 — Internal Canonical Database

After extraction, Pokémon Companion's Canonical Database becomes the authoritative internal representation of official Pokémon knowledge.

Every generated dataset, backend service, frontend feature, and AI system should consume data from the Canonical Database rather than repeatedly consulting external sources.

---

## Priority 5 — Verification Sources

Community-maintained databases are used for verification, comparison, and identifying potential extraction issues.

Examples include:

- PokéAPI
- Veekun Pokédex Database
- Pokémon Showdown
- Bulbapedia
- Serebii

These resources are invaluable for validation but are not considered canonical when they conflict with verified official game data.

---

## Priority 6 — Manual Review

When conflicts remain unresolved after comparing all available sources, the data enters manual review.

Manual review should:

- Document the conflicting sources.
- Record the reasoning behind the chosen interpretation.
- Preserve references to the original evidence.
- Avoid undocumented assumptions.

Every manual decision should be reproducible and transparent.

---

# Conflict Resolution

When conflicting information is discovered, Pokémon Companion follows a consistent process.

```text
Official Game Data
        │
        ▼
Official Updates
        │
        ▼
Official Companion Services
        │
        ▼
Canonical Database
        │
        ▼
Verification Sources
        │
        ▼
Manual Review
```

Conflicts should always be resolved using the highest available authoritative source.

If no definitive answer exists, the uncertainty should be documented rather than hidden.

---

# Documentation Requirements

Every manual correction or deviation from extracted data should include:

- The affected entity or relationship.
- The conflicting sources.
- The selected source.
- The reasoning for the decision.
- The date of the decision.
- References to supporting evidence where possible.

This ensures future contributors can understand and verify previous decisions.

---

# Long-Term Philosophy

Pokémon Companion should never depend upon a single external database.

Instead, it maintains its own canonical representation of official Pokémon knowledge, built from authoritative sources and supported by transparent validation.

This approach ensures that the project remains accurate, reproducible, and maintainable as new Pokémon games, mechanics, and official data become available.

---

# Validation Principles

## Purpose

Validation ensures that Pokémon Companion's data remains accurate, internally consistent, reproducible, and trustworthy.

Because the project is built upon a multi-stage data pipeline, every layer must be verified before data progresses to the next stage.

Validation is not a single script or build step. It is a continuous architectural principle applied throughout the entire lifecycle of the database.

Every canonical entity, relationship, generated dataset, and user-facing feature depends upon successful validation.

---

# Core Principles

## Accuracy

Every canonical record should accurately represent official Pokémon data.

If extracted data differs from verified official sources, the discrepancy must be investigated rather than ignored.

Accuracy always takes priority over convenience.

---

## Referential Integrity

Every reference within the Canonical Database must resolve successfully.

Examples include:

- Every Pokémon must reference an existing Species.
- Every Move reference must point to an existing Move.
- Every Ability reference must point to an existing Ability.
- Every Location reference must point to an existing Location.
- Every Relationship must reference valid canonical entities.

Broken references are never considered valid.

---

## Historical Consistency

Historical information must remain internally consistent across every supported game.

Examples include:

- Learnsets should reflect the correct game and version.
- Evolution methods should match the official mechanics of that release.
- Encounter tables should correspond to the appropriate game.
- Trainer parties should remain historically accurate.
- Mechanics should not be mixed across incompatible generations.

Historical data should never be overwritten by newer information.

---

## Deterministic Generation

Running the build pipeline with identical canonical data should always produce identical generated datasets.

Generated output should never depend upon:

- Execution order
- Machine configuration
- Local environment
- Current date or time
- Random values

This guarantees reproducible builds and simplifies debugging.

---

## Single Source of Truth

Canonical data exists in only one location.

Generated datasets may reorganize or optimize information, but they must never become independent sources of truth.

If canonical data changes, every derived dataset should be regenerated rather than manually edited.

---

## No Orphan Records

Every canonical entity should either:

- Be referenced by another valid entity,
- Represent a valid standalone concept, or
- Be explicitly documented as intentionally isolated.

Unexpected orphan records should be treated as potential data quality issues.

---

## No Duplicate Canonical Entities

Canonical entities must never be duplicated.

If two records describe the same real-world Pokémon concept, they should be represented by a single canonical entity connected through relationships rather than duplicate records.

---

## Traceability

Every generated record should be traceable back to its canonical origin.

Likewise, every canonical record should be traceable to the official source from which it was extracted.

This makes validation, debugging, and future maintenance significantly easier.

---

# Validation Layers

Validation occurs throughout the complete data pipeline.

```text
Official Sources
        │
        ▼
Extraction Validation
        │
        ▼
Canonical Validation
        │
        ▼
Relationship Validation
        │
        ▼
Generated Dataset Validation
        │
        ▼
Application Validation
```

Each layer validates only the responsibilities of that stage.

Errors should be resolved as early as possible within the pipeline.

---

# Validation Categories

The validation system should eventually include, but is not limited to:

## Entity Validation

- Missing identifiers
- Duplicate identifiers
- Duplicate canonical entities
- Missing required properties
- Invalid property values

---

## Relationship Validation

- Broken references
- Missing entities
- Invalid relationship types
- Duplicate relationships
- Invalid cardinality
- Invalid version references

---

## Historical Validation

- Version consistency
- Generation consistency
- Timeline consistency
- Historical mechanic validation
- Version-aware relationship validation

---

## Generated Dataset Validation

- Complete generation
- Missing indexes
- Broken lookup tables
- Invalid search indexes
- Missing generated relationships
- Deterministic output verification

---

## Performance Validation

Generated datasets should also satisfy practical performance requirements.

Examples include:

- Efficient lookup structures
- Minimal duplication
- Optimized search indexes
- Consistent file organization
- Predictable loading behaviour

Performance improvements must never compromise canonical accuracy.

---

# Error Handling Philosophy

Validation failures should never be ignored.

When an error is detected, the preferred approach is to:

1. Detect the issue.
2. Identify the canonical source.
3. Determine the root cause.
4. Correct the canonical data or extraction process.
5. Regenerate all affected datasets.
6. Re-run validation until the issue is resolved.

Manual workarounds should be avoided whenever a systematic solution is possible.

---

# Long-Term Philosophy

Validation is a permanent part of Pokémon Companion's architecture rather than a one-time development task.

As the database grows to include additional games, mechanics, entities, and relationships, the validation system should evolve alongside it.

The objective is not simply to produce working datasets, but to maintain a trustworthy Pokémon knowledge base whose correctness can be verified, reproduced, and confidently extended for many years.