# Pokémon Companion Data Architecture

## 1. Purpose

The Data Architecture defines how Pokémon Companion stores, connects, validates, versions, generates, and serves Pokémon knowledge.

The architecture is designed for a long-lived Pokémon knowledge platform rather than a simple Pokédex. It must support canonical knowledge and game-specific historical information while keeping user-owned adventure data separate.

The architecture must preserve:

- Historical accuracy
- Canonical identity
- Version awareness
- Explicit relationships
- Referential integrity
- Reproducibility
- Traceability
- Runtime performance
- Maintainability
- Future expansion

The central principle is:

> Canonical knowledge describes Pokémon and the game world. User data describes what an individual trainer has done within that world.

No user action should modify canonical knowledge.

---

## 2. Architectural Principles

### 2.1 Canonical First

The Canonical Database is the authoritative internal representation of accepted Pokémon knowledge.

Runtime systems consume canonical information through repositories and services.

External Pokémon APIs may be used for research, comparison, or validation, but they are not the normal runtime source of canonical knowledge.

### 2.2 Historical Accuracy

Pokémon data is context-sensitive.

A Pokémon, move, item, encounter, trainer, map, or mechanic may behave differently across games.

Historical information must therefore be preserved rather than silently replaced by modern information.

### 2.3 Stable Identity

Canonical entities use permanent identifiers.

Names, translations, descriptions, artwork, URLs, and presentation formats may change without changing canonical identity.

### 2.4 Explicit Relationships

Important connections between entities are represented explicitly.

For example:

```text
Species -> Form
Pokémon -> Move
Move -> Machine
Location -> Encounter
Trainer -> Party
Game Context -> Location
Event -> Requirement
```

Relationships may carry context-specific metadata.

### 2.5 Separation of Concerns

Each layer has a specific responsibility.

```text
Official Sources
    ->
Raw Extraction
    ->
Canonical Database
    ->
Relationships
    ->
Generated Data
    ->
Application Runtime
    ->
User Database
```

A lower or derived layer must not silently become the authoritative owner of data belonging to another layer.

### 2.6 Reproducibility

Generated datasets must be reproducible from canonical inputs.

The same inputs and generation configuration should produce the same outputs.

### 2.7 Runtime Immutability

Canonical data is read-only during normal application runtime.

User actions must never modify canonical records.

### 2.8 Disposable Derived Data

Generated indexes and optimized datasets may be deleted and rebuilt.

They must never become independent sources of truth.

---

# 3. Data Architecture Overview

Pokémon Companion uses a layered data pipeline.

```text
                    OFFICIAL SOURCES
                           |
                           v
                    RAW EXTRACTION
                           |
                           v
                 CANONICAL DATABASE
                           |
                +----------+----------+
                |                     |
                v                     v
        RELATIONSHIP LAYER       VALIDATION
                |                     |
                +----------+----------+
                           |
                           v
                  GENERATED DATA
                           |
                           v
                  APPLICATION RUNTIME
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
          Backend       Frontend        AI
             |
             v
        USER DATABASE
```

The important distinction is between authoritative data and derived data.

```text
Authoritative:
Official Source -> Raw Extraction -> Canonical Data

Derived:
Canonical Data -> Relationships -> Generated Data -> Runtime Responses

User-owned:
User Database -> Trainer Progress
```

---

# 4. Data Layers

## 4.1 Layer 1: Official Sources

Official sources are the highest external authority available to the project.

Depending on the supported title, sources may include:

- Official game data
- Official ROM resources
- Official executable resources
- Official game text
- Official scripts
- Official battle data
- Official encounter data
- Official evolution data
- Official move data
- Official item data
- Official trainer data
- Official Pokédex data
- Official updates
- Official downloadable content
- Official event distributions

The project should prefer evidence that directly represents the historical game state.

Official data is not automatically the same thing as the Canonical Database. It must first pass through extraction, normalization, and validation.

## 4.2 Layer 2: Raw Extraction

Raw Extraction preserves data obtained from official sources as closely as practical.

Its purposes are:

- Archival reference
- Reproducibility
- Extraction debugging
- Historical comparison
- Future parser improvements
- Evidence preservation

Raw data should remain close to the source structure.

It should not be shaped primarily for frontend or runtime needs.

Typical raw records may retain:

```text
source identifier
source structure
original value
source file
source location
extraction version
```

Raw data should be treated as read-only output of the extraction pipeline.

If extraction logic changes, raw data should be regenerated rather than manually patched.

## 4.3 Layer 3: Canonical Database

The Canonical Database is the central internal knowledge store.

It normalizes information from supported sources into stable project-wide entities.

Typical canonical categories include:

```text
Generation
Game
Version Group
Version
Game Context

Region
Location
Location Area
Map
Map Connection

Species
Form
Type
Ability
Nature
Egg Group
Growth Rate
Gender Ratio
Evolution Method

Move
Move Effect
Battle Mechanic

Item
Machine

Encounter Table
Encounter Slot
Encounter Method

Trainer
Trainer Class
Trainer Party

Event
Objective
Requirement
Progression Rule
Story Flag

Pokédex Entry
Ribbon
Mark

Sprite
Model
Artwork
Icon
Map Asset
```

This list is representative rather than exhaustive.

A canonical entity should exist because it represents a meaningful concept, not because a screen or API happens to need a record.

## 4.4 Layer 4: Relationship Layer

The Relationship Layer connects canonical entities.

Examples include:

```text
Species -> has Form
Pokémon -> has Ability
Pokémon -> has Type
Pokémon -> learns Move
Species -> evolves into Species
Evolution -> requires Item
Game Context -> contains Location
Location -> contains Location Area
Location Area -> has Encounter Table
Encounter Table -> contains Encounter Slot
Encounter Slot -> references Species or Form
Trainer -> has Party
Party -> contains Party Member
Machine -> teaches Move
Event -> requires Requirement
```

Relationships prevent unnecessary duplication.

The Move entity describes the move.

The learnset relationship describes the fact that a particular Pokémon can learn that move in a particular context.

## 4.5 Layer 5: Generated Data

Generated data is derived from canonical entities and relationships.

It exists to make runtime access efficient.

Examples include:

- Search indexes
- Reverse relationship indexes
- Lookup tables
- Navigation indexes
- Evolution graphs
- Encounter indexes
- Trainer indexes
- Location indexes
- Map indexes
- Progression indexes
- Cross-reference indexes

Generated data may use structures optimized for application access.

It must preserve canonical identifiers.

Generated data must never become the only place where an important canonical fact exists.

If a generated dataset is lost, the project must be able to rebuild it.

## 4.6 Layer 6: Application Runtime

The Application Runtime consumes canonical and generated information.

Preferred access flow:

```text
Request
   ->
Controller
   ->
Service
   ->
Repository
   ->
Canonical / Generated Data
```

The runtime includes:

- Backend services
- Controllers
- API endpoints
- Frontend applications
- Search systems
- Map systems
- Progression systems
- AI consumers

Runtime code should not directly edit canonical storage.

Runtime code should avoid bypassing repositories and services when an approved access path exists.

## 4.7 Layer 7: User Database

The User Database contains mutable trainer-owned information.

Examples include:

- User accounts
- Adventure trackers
- Tracker settings
- Teams
- Pokémon instances
- Box contents
- Pokédex progress
- Item collection state
- Map exploration
- Completed events
- Story flags
- Achievement progress
- Notes
- Synchronization state

User data can reference canonical identifiers.

Example:

```json
{
  "pokemonInstanceId": "instance:abc123",
  "speciesId": "species:charizard",
  "formId": "form:charizard-default",
  "gameContextId": "context:firered"
}
```

The instance is user-owned.

The referenced Species, Form, and Game Context remain canonical.

---

# 5. Canonical and User Data Boundary

This boundary is fundamental.

```text
                 CANONICAL DATA
                       |
             +---------+---------+
             |                   |
             v                   v
       Knowledge Data       Game Context
             |                   |
             +---------+---------+
                       |
                       v
                    Services
                       |
                       v
                 User Tracker
                       |
                       v
                 User Database
```

User data may reference canonical data.

Canonical data must never reference a user's progress.

For example, a user may mark Charizard as caught. That action changes the user's tracker, not the canonical Charizard record.

Deleting a tracker must not delete Charizard, Flamethrower, FireRed, or any other canonical record.

---

# 6. Entity Model

## 6.1 Entity Definition

An entity is a uniquely identifiable canonical concept.

Examples:

```text
species:charizard
move:flamethrower
ability:blaze
item:charcoal
game:firered
context:firered
```

An entity should be independently addressable.

Its relationships describe how it interacts with other entities.

## 6.2 Entity Responsibilities

Each entity owns its intrinsic canonical properties.

For example, a Move may own:

```text
moveId
name
type
power
accuracy
pp
damageClass
```

A Move should not permanently own a duplicated list of every Pokémon that learns it, every trainer that uses it, and every machine that teaches it.

Those facts belong in relationships.

Similarly, a Location should not duplicate all of its encounters, trainers, items, events, and map connections as embedded copies of other canonical entities.

## 6.3 Core Entity Categories

### World

```text
Generation
Game
Version Group
Version
Game Context
Region
Location
Location Area
Map
Map Connection
```

### Pokémon

```text
Species
Form
Type
Ability
Nature
Egg Group
Growth Rate
Gender Ratio
Evolution Method
```

### Battle

```text
Move
Move Effect
Damage Class
Status Condition
Battle Mechanic
```

### Items

```text
Item
Item Category
Machine
Berry
```

### Encounters

```text
Encounter Table
Encounter Slot
Encounter Method
Static Encounter
Gift Encounter
Trade Encounter
```

### Trainers

```text
Trainer
Trainer Class
Trainer Party
Trainer Party Member
```

### Progression

```text
Event
Objective
Requirement
Progression Rule
Story Flag
Unlock Condition
```

### Collections and Assets

```text
Pokédex Entry
Ribbon
Mark
Sprite
Model
Artwork
Icon
Map Asset
```

---

# 7. Species, Form, and Pokémon Distinction

These concepts must remain separate.

## Species

Species represents the underlying canonical species.

```text
species:charizard
```

## Form

Form represents a distinct official form belonging to a Species.

Examples include:

- Regional forms
- Alternate forms
- Battle forms
- Special forms

A Form references its parent Species.

## Pokémon

Pokémon-level canonical concepts may be used when the application requires an entity between Species/Form and user-owned instances.

A captured Pokémon is different.

A captured Pokémon is a user-owned instance.

```text
Canonical:
species:charizard
form:charizard-default

User:
instance:abc123
```

The user instance does not become a new canonical species or form.

---

# 8. Intrinsic Data and Contextual Data

The architecture distinguishes between:

```text
Entity Identity
+
Context-Specific State
```

A canonical entity represents the concept.

A contextual record or relationship represents historical behavior.

For example:

```text
Move
  |
  +-- Identity
  |
  +-- Contextual State
        |
        +-- Game Context A
        +-- Game Context B
        +-- Game Context C
```

Context-specific properties may include:

- Stats
- Types
- Abilities
- Learnsets
- Move properties
- Evolution rules
- Encounter availability
- Item availability
- Mechanics
- Form availability

The exact representation should be selected according to the meaning of the data.

The architecture must avoid forcing every historical difference into duplicate entities.

---

# 9. Relationship Model

## 9.1 Purpose

Relationships describe connections between canonical entities.

They allow the application to behave like a connected knowledge graph.

```text
Pokémon
   |
   v
Move
   |
   v
Machine
   |
   v
Game Context
   |
   v
Location
   |
   v
Encounter
```

## 9.2 Relationship Principles

Relationships must:

- Reference canonical identifiers
- Have a defined meaning
- Support historical context where required
- Be validated
- Avoid unnecessary duplication
- Remain immutable at runtime

Names and URLs must not be used as authoritative relationship references.

## 9.3 Relationship Categories

### Biological

```text
Species -> Form
Pokémon -> Type
Pokémon -> Ability
Pokémon -> Egg Group
```

### Evolution

```text
Species -> evolves into Species
Evolution -> requires Level
Evolution -> requires Item
Evolution -> requires Friendship
Evolution -> requires Move
Evolution -> requires Time
Evolution -> requires Location
```

### Battle

```text
Pokémon -> learns Move
Move -> has Type
Move -> has Effect
Ability -> affects Battle
Item -> affects Battle
```

### World

```text
Game Context -> contains Region
Region -> contains Location
Location -> contains Area
Location -> uses Map
Map -> connects Map
```

### Encounters

```text
Location Area -> has Encounter Table
Encounter Table -> contains Slot
Encounter Slot -> references Pokémon
Encounter Table -> uses Method
```

### Trainers

```text
Trainer -> belongs to Class
Trainer -> appears in Game Context
Trainer -> has Party
Trainer -> appears at Location
```

### Progression

```text
Event -> occurs at Location
Event -> requires Requirement
Objective -> requires Requirement
Requirement -> references Story Flag
Requirement -> references Item
Requirement -> references Badge
```

---

# 10. Relationship Cardinality

Relationships may be:

- One-to-One
- One-to-Many
- Many-to-One
- Many-to-Many

Examples:

```text
Species -> Forms
1:N
```

```text
Region -> Locations
1:N
```

```text
Pokémon <-> Moves
N:N
```

```text
Trainer -> Parties
1:N
```

Cardinality should be part of validation rules.

If the domain says a relationship must be unique, duplicate records should fail validation.

---

# 11. Relationship Metadata

Context-sensitive relationships may require metadata.

Possible fields include:

```text
gameContextId
versionId
versionGroupId
generationId
method
level
time
weather
season
requiredItemId
requiredMoveId
requiredAbilityId
requiredFormId
probability
encounterRate
conditions
```

Only fields relevant to the relationship should be present.

A relationship should not become a general-purpose storage object.

---

# 12. Bidirectional Navigation

The application should support both directions of meaningful relationships.

For example:

```text
Charizard -> learns -> Flamethrower
Flamethrower -> learned by -> Charizard
```

The reverse view may be generated from the canonical relationship.

This avoids maintaining two independent authoritative copies.

The same principle applies to:

```text
Species <-> Form
Location <-> Encounter
Move <-> Machine
Trainer <-> Party
```

Generated reverse indexes may be used for performance.

---

# 13. Versioning Model

## 13.1 Purpose

Versioning prevents historical data from being mixed across games.

The model distinguishes:

```text
Generation
Game
Version Group
Version
Game Context
```

These concepts are related but have different responsibilities.

## 13.2 Generation

Generation represents a broad historical era.

It provides useful grouping but does not define every gameplay rule.

Games in the same Generation may still differ in:

- Available Pokémon
- Encounters
- Trainers
- Locations
- Story events
- Version exclusives
- Mechanics

## 13.3 Game

Game represents an individual Pokémon title.

Examples:

```text
game:red
game:blue
game:yellow
game:emerald
game:firered
game:platinum
game:scarlet
```

A remake is an independent Game entity.

```text
Red != FireRed
Gold != HeartGold
Ruby != Omega Ruby
```

## 13.4 Version Group

A Version Group groups closely related releases.

Examples:

```text
Red / Blue
Ruby / Sapphire
Diamond / Pearl
Scarlet / Violet
```

Shared data may be associated with a Version Group only when it genuinely applies to all relevant versions.

Version-specific differences must remain accessible.

## 13.5 Version

Version represents a specific release variant.

Examples:

```text
Red
Blue
Black
White
Black 2
White 2
Scarlet
Violet
```

Version-specific information may include:

- Encounters
- Items
- Trainers
- Story events
- Version-exclusive Pokémon
- Legendary availability
- Other release-specific content

## 13.6 Game Context

Game Context is the runtime context used to resolve historical behavior.

A context may combine:

```text
Game
Version
Generation
Version Group
Ruleset
Mechanics
Maps
Encounters
Trainers
Events
Progression
```

Example:

```text
context:firered
```

A service handling a FireRed tracker should resolve FireRed context before evaluating context-sensitive information.

This prevents modern or incompatible data from leaking into historical requests.

---

# 14. Historical State

Historical differences must remain recoverable.

Examples include:

- Base stat changes
- Type changes
- Ability changes
- Move power changes
- Learnset changes
- Evolution changes
- Encounter changes
- Trainer party changes
- Item locations
- Battle mechanics

The system must be able to answer:

```text
What could Charizard learn in FireRed?
```

without returning a modern learnset.

Likewise:

```text
What Pokémon appeared on a FireRed route?
```

must resolve FireRed encounter data.

---

# 15. Remakes and Enhanced Releases

Remakes are not replacements for their originals.

Examples:

```text
Red != FireRed
Gold != HeartGold
Ruby != Omega Ruby
Diamond != Brilliant Diamond
```

Enhanced releases are also independent historical states.

Examples include:

```text
Yellow
Crystal
Emerald
Platinum
Ultra Sun
Ultra Moon
```

Shared concepts should use the same canonical entities where appropriate.

Historical differences should be represented through context-specific state and relationships.

---

# 16. Identifier System

## 16.1 Purpose

Identifiers provide permanent references between entities and systems.

They are used by:

- Canonical data
- Relationships
- Generated datasets
- Backend services
- Frontend applications
- User data
- AI systems

## 16.2 Identifier Format

A practical canonical format is:

```text
type:stable-name
```

Examples:

```text
species:charizard
move:flamethrower
ability:blaze
item:charcoal
game:firered
context:firered
```

The exact naming convention may evolve, but existing identifiers must remain stable.

## 16.3 Identifier Rules

Identifiers must be:

- Stable
- Unique within their entity type
- Independent of presentation
- Independent of database row positions
- Independent of search indexes
- Independent of URLs
- Independent of localization

Identifiers must not encode mutable business logic.

Avoid identifiers such as:

```text
pokemon-006-in-generation-3
route1-pikachu
move-35-current
```

when those values represent mutable context rather than permanent identity.

## 16.4 Identifier Reuse

Identifiers must never be reused for unrelated concepts.

If an entity is deprecated or corrected, its historical identifier must remain traceable.

This protects old relationships and user records.

---

# 17. Reference Rules

Canonical relationships should conceptually look like:

```json
{
  "sourceId": "species:charizard",
  "relationship": "learns",
  "targetId": "move:flamethrower"
}
```

Not:

```text
"Charizard"
"Flamethrower"
"charizard.json"
"/pokemon/charizard"
```

Display values may be stored for presentation or search, but they do not replace canonical identifiers.

---

# 18. Source Priority

Pokémon Companion may use several sources.

The source hierarchy is:

```text
1. Official Game Data
2. Official Updates / DLC
3. Official Pokémon Services
4. Canonical Database
5. Verification Sources
6. Manual Review
```

The Canonical Database is the internal application authority after data has been accepted.

External sources should not silently override accepted canonical records.

---

# 19. Official Game Data

Direct game evidence is preferred whenever available.

Examples:

- Game resources
- Game data tables
- Game scripts
- Encounter data
- Trainer data
- Evolution data
- Learnset data
- Item data
- Battle data
- Pokédex data

The project should retain enough source metadata to understand where canonical facts came from.

---

# 20. Official Updates

Some games receive updates, patches, or downloadable content.

When an update changes historical behavior, the architecture should preserve the distinction between the original state and the updated state where that distinction matters.

The goal is not to rewrite history.

The goal is to represent the correct state for the requested context.

---

# 21. Verification Sources

Third-party sources are valuable for detecting extraction problems.

Examples may include:

- PokéAPI
- Veekun
- Pokémon Showdown
- Bulbapedia
- Serebii

They may be used to:

- Compare values
- Detect missing records
- Identify parser mistakes
- Investigate historical differences
- Cross-check relationships

They should not silently override verified official evidence.

---

# 22. Manual Review

Some conflicts may require human interpretation.

A manual review should record:

```text
affected entity
affected relationship
Game Context
sources considered
selected interpretation
reasoning
decision date
remaining uncertainty
```

Uncertainty should be documented rather than hidden.

The goal is reproducible decision-making.

---

# 23. Validation Architecture

Validation occurs throughout the pipeline.

```text
Official Sources
      |
      v
Extraction Validation
      |
      v
Canonical Validation
      |
      v
Relationship Validation
      |
      v
Generated Data Validation
      |
      v
Runtime Validation
```

Each stage should detect problems as early as possible.

---

# 24. Entity Validation

Entity validation should check:

- Identifier exists
- Identifier is unique
- Required properties exist
- Property values are valid
- Source metadata exists where required
- Context references are valid
- Duplicate canonical concepts are investigated

A failure should stop invalid canonical data from entering dependent generated datasets.

---

# 25. Relationship Validation

Relationship validation should check:

- Source exists
- Target exists
- Relationship type is valid
- Cardinality is valid
- Required metadata exists
- Context references resolve
- Duplicate relationships are rejected
- Historical constraints are respected

A broken relationship is a data integrity failure.

---

# 26. Referential Integrity

Every canonical reference must resolve.

Examples:

```text
Form -> valid Species
Move reference -> valid Move
Ability reference -> valid Ability
Location reference -> valid Location
Game Context -> valid Game
Relationship -> valid source and target
```

Broken references should never be accepted as valid canonical data.

---

# 27. Historical Validation

Historical validation checks that context-sensitive information belongs to the correct context.

Examples:

```text
FireRed learnset -> FireRed context
FireRed encounters -> FireRed context
FireRed trainer party -> FireRed context
Generation-specific mechanic -> compatible context
```

Validation should detect accidental mixing of records from different games.

---

# 28. Generated Data Validation

Generated datasets should be checked for:

- Complete generation
- Missing indexes
- Broken references
- Missing reverse indexes
- Invalid search entries
- Incorrect context mappings
- Deterministic output

Generated validation should compare derived structures against canonical sources where practical.

---

# 29. Runtime Validation

Runtime validation protects the application boundary.

It should validate:

- Context identifiers
- Entity identifiers
- Request parameters
- Tracker ownership
- User permissions
- Tracker context
- Valid state transitions

Runtime validation protects users and services.

It does not replace canonical validation.

---

# 30. Deterministic Generation

Generation should be deterministic.

Given identical:

```text
Canonical Input
+
Relationship Input
+
Generator Version
+
Configuration
```

the output should be identical.

Generation should not depend on:

- Current time
- Random values
- Uncontrolled execution order
- Machine-specific behavior
- Undocumented external requests

This makes builds reproducible and debugging practical.

---

# 31. Traceability

The architecture should preserve a traceability chain:

```text
Official Source
      |
      v
Raw Extraction
      |
      v
Canonical Record
      |
      v
Canonical Relationship
      |
      v
Generated Record
      |
      v
Runtime Result
```

Each layer should retain enough identifiers or metadata to follow a fact back to its source.

This is particularly important when investigating incorrect data.

---

# 32. Data Ownership

Every layer has a clear owner.

| Layer | Responsibility |
|---|---|
| Official Sources | External historical evidence |
| Raw Extraction | Extracted source representation |
| Canonical Database | Accepted canonical knowledge |
| Relationship Layer | Canonical connections |
| Generated Data | Derived runtime structures |
| Application Runtime | Data access and behavior |
| User Database | Trainer-owned mutable state |

Ownership prevents accidental cross-layer mutation.

---

# 33. Immutability Rules

Canonical knowledge is immutable during runtime.

Runtime services may:

- Read canonical data
- Filter it
- Transform it
- Combine records
- Evaluate relationships

Runtime services may not:

- Edit canonical records
- Delete canonical records
- Add user progress to canonical records
- Replace historical records with modern values

Canonical changes occur through the controlled data pipeline.

---

# 34. Generated Data Rules

Generated data is disposable.

If a generated index is incorrect:

```text
Do not manually repair the index.
```

Instead:

```text
Fix authoritative input or generator
-> regenerate
-> validate
```

This keeps generated data reproducible.

---

# 35. User Data Rules

User data is mutable.

It may store:

```text
caught
seen
owned
completed
explored
obtained
equipped
selected
notes
```

These are user states, not canonical facts.

For example:

```text
Canonical:
Charizard exists.

User:
Charizard is caught in this trainer's FireRed tracker.
```

The two facts belong to different layers.

---

# 36. Runtime Access Rules

The preferred runtime flow is:

```text
API Request
    ->
Controller
    ->
Service
    ->
Repository
    ->
Data Source
```

Controllers should handle transport concerns.

Services should handle application logic.

Repositories should handle data access.

Canonical storage should not be directly manipulated by controllers or frontend code.

---

# 37. Context Resolution

Context-sensitive services should resolve Game Context before evaluating historical data.

For example:

```text
Request:
"Show available encounters"

        |
        v

Resolve:
context:firered

        |
        v

Load:
FireRed encounter data
```

The service should not combine data from multiple contexts unless the feature explicitly requests cross-game comparison.

---

# 38. Cross-Game Queries

Cross-game features are allowed when explicitly requested.

Examples:

```text
Compare Charizard learnsets across generations.
```

```text
Show every game where Pikachu appears.
```

```text
Compare FireRed and LeafGreen encounters.
```

These queries should combine separate historical contexts deliberately.

The system must not accidentally produce cross-context results for a single-context request.

---

# 39. Search Architecture

Search should operate primarily on generated indexes.

Canonical data remains authoritative.

Search indexes may contain:

```text
canonicalId
displayName
localizedNames
entityType
context
searchTokens
ranking metadata
```

A search result should always resolve back to a canonical identifier.

Search indexes may be rebuilt whenever canonical data changes.

---

# 40. Map Data

Map systems should use canonical world entities.

A simplified structure is:

```text
Game Context
    ->
Region
    ->
Location
    ->
Location Area
    ->
Map
    ->
Map Connection
```

Map-specific information should remain context-aware.

A route in one game should not be assumed to be identical to a route with the same name in another game.

Map rendering data may be generated for performance, but canonical map identity and relationships remain authoritative.

---

# 41. Encounter Data

Encounter data should represent availability in context.

A simplified structure is:

```text
Game Context
    ->
Location Area
    ->
Encounter Table
    ->
Encounter Slot
    ->
Pokémon
```

An encounter slot may contain context-specific information such as:

```text
method
level range
probability
time
weather
conditions
```

The same Pokémon can appear in many encounter tables without creating duplicate canonical Pokémon entities.

The encounter relationship determines where and when it is available.

---

# 42. Trainer Data

Trainer data should preserve historical parties.

A simplified structure is:

```text
Game Context
    ->
Trainer
    ->
Trainer Party
    ->
Party Member
    ->
Species / Form
```

Party members may contain historical battle information appropriate to the game context.

A trainer appearing in multiple games should not automatically share a single party definition.

---

# 43. Evolution Data

Evolution should be modeled as a relationship with requirements.

Examples:

```text
Species A
    ->
Evolution
    ->
Species B
```

The evolution record may reference:

```text
level
item
friendship
move
time
location
condition
```

Historical differences should be associated with the correct Game Context.

---

# 44. Progression Data

Progression systems should use explicit requirements.

For example:

```text
Event
   ->
Requirement
   ->
Badge
```

or:

```text
Location
   ->
Unlock Condition
   ->
Story Flag
```

This allows the backend to evaluate progression rather than relying on hardcoded frontend assumptions.

---

# 45. Event Data

Events represent meaningful game-world changes or interactions.

Examples:

- Receiving an item
- Unlocking an area
- Starting a story event
- Triggering a battle
- Receiving a gift Pokémon
- Opening a passage

Events should be linked to their location and requirements where appropriate.

User completion state belongs in the User Database.

---

# 46. Asset Data

Assets should be represented separately from the entities that use them.

Examples:

```text
Species -> Sprite
Species -> Artwork
Form -> Artwork
Map -> Map Asset
Move -> Icon
Pokémon -> Cry
```

Assets may have:

- Game context
- Form
- Language
- Resolution
- Variant
- Source metadata

The canonical asset record identifies the resource.

Runtime systems may generate optimized asset manifests.

---

# 47. Localization

Localization should not change canonical identity.

For example:

```text
Canonical:
species:charizard
```

may have localized names:

```text
English: Charizard
Japanese: リザードン
Other supported languages: ...
```

Relationships continue to use:

```text
species:charizard
```

rather than localized display names.

Localization is presentation data, not identity.

---

# 48. Data Completeness

Completeness should be measured relative to a defined scope.

For example:

```text
FireRed
    -> Species data
    -> Move data
    -> Encounter data
    -> Trainer data
    -> Map data
```

A dataset is not incomplete merely because another unsupported game contains more information.

Validation should compare data against the declared scope for the current release.

---

# 49. Missing or Uncertain Data

Not every source will provide complete or perfectly understood information.

When data is missing:

1. Identify the missing fact.
2. Check authoritative sources.
3. Check verification sources.
4. Document the uncertainty.
5. Avoid inventing values.
6. Mark the dataset appropriately if needed.

An explicit unknown is better than an incorrect canonical fact.

---

# 50. Data Corrections

When an error is discovered:

```text
Identify incorrect record
        ->
Identify authoritative source
        ->
Correct extraction or canonical transformation
        ->
Validate
        ->
Regenerate affected data
        ->
Validate again
```

Do not directly patch generated output.

If a correction changes a canonical identifier, special migration handling is required.

Existing identifiers should normally remain stable.

---

# 51. Schema Evolution

The architecture should allow schemas to evolve.

When adding a new field or relationship:

1. Determine whether it is canonical or derived.
2. Identify the correct owner.
3. Determine whether it is universal or context-specific.
4. Update validation rules.
5. Update generation logic if necessary.
6. Update affected repositories and services.
7. Regenerate derived datasets.
8. Test historical contexts.

Schema evolution must not silently change historical meaning.

---

# 52. Adding a New Game

Adding a new game should generally follow:

```text
1. Create Game metadata
2. Create Version metadata
3. Create Game Context
4. Acquire authoritative source data
5. Extract raw data
6. Normalize canonical entities
7. Establish relationships
8. Validate historical context
9. Generate derived datasets
10. Validate generated data
11. Expose through repositories and services
```

Existing games should remain unchanged unless an actual shared canonical correction is required.

---

# 53. Adding a New Mechanic

A new mechanic should be modeled independently when practical.

The process should be:

```text
Identify mechanic
    ->
Define canonical concept
    ->
Define context applicability
    ->
Define relationships
    ->
Add validation
    ->
Update runtime services
```

Historical games should not automatically inherit mechanics introduced later.

---

# 54. Adding New Entity Types

A new entity type should be introduced only when an existing entity or relationship cannot represent the concept cleanly.

Before adding one, ask:

1. Is this a distinct canonical concept?
2. Does it have an independent identity?
3. Does it own intrinsic properties?
4. Is it actually a relationship?
5. Is it only a generated view?
6. Is it user-owned state?

This prevents unnecessary model growth.

---

# 55. Data Pipeline

The complete data pipeline is:

```text
Official Evidence
       |
       v
Raw Extraction
       |
       v
Extraction Validation
       |
       v
Normalization
       |
       v
Canonical Entities
       |
       v
Canonical Relationships
       |
       v
Canonical Validation
       |
       v
Generated Data
       |
       v
Generated Validation
       |
       v
Runtime
```

The pipeline should be automated as much as practical.

---

# 56. Rebuild Strategy

Derived datasets should be rebuildable from authoritative data.

A typical rebuild is:

```text
Clear generated output
        ->
Load canonical data
        ->
Load canonical relationships
        ->
Run generators
        ->
Validate output
        ->
Publish generated dataset
```

Partial regeneration may be used for performance, but the architecture must still support full regeneration.

---

# 57. Performance Strategy

Canonical storage prioritizes correctness and clarity.

Generated data prioritizes:

- Fast lookup
- Search
- Navigation
- Reverse relationships
- Map loading
- Encounter queries
- Progression queries

Caching may be used at runtime.

Caches are not canonical data.

A cache can be deleted without changing the meaning of the system.

---

# 58. Caching Rules

Caches should:

- Use canonical or generated identifiers
- Have clear invalidation rules
- Be disposable
- Never become authoritative
- Never contain unique canonical facts

If a cache contains information that cannot be rebuilt, that information belongs in an authoritative layer instead.

---

# 59. API Data Rules

APIs should expose stable identifiers.

A response may include:

```json
{
  "id": "species:charizard",
  "name": "Charizard"
}
```

The display name is useful for clients.

The identifier remains the stable reference.

Context-sensitive endpoints should make their Game Context explicit through route parameters, query parameters, request state, or resolved service context.

---

# 60. Frontend Data Rules

The frontend may maintain:

- UI state
- Loading state
- Temporary filters
- Search state
- Local presentation state

It must not become a second canonical database.

Frontend code should request canonical knowledge through backend interfaces when the backend owns the authoritative data.

User-owned state should use the User Database or approved user-data APIs.

---

# 61. AI Data Rules

AI features may consume canonical and generated data.

AI responses should be grounded in stable canonical identifiers and Game Contexts when historical correctness matters.

For example:

```text
Question:
"What moves can Charizard learn in FireRed?"

Resolution:
species:charizard
+
context:firered
+
learnset relationship
```

The AI layer must not silently substitute modern data for historical context.

---

# 62. Data Security Boundary

Canonical data may be broadly readable by application features.

User data requires appropriate ownership and authorization.

A user should only be able to modify records they are permitted to modify.

The canonical database should not be exposed as a mutable user-facing store.

---

# 63. Error Handling

Data errors should identify:

- Layer
- Entity or relationship
- Context
- Source
- Failure type

Examples:

```text
Unknown canonical identifier
Invalid relationship target
Missing Game Context
Duplicate entity
Invalid historical property
Generated index mismatch
```

Errors should be actionable.

Silent fallback to incorrect data is not acceptable for canonical historical queries.

---

# 64. Testing Strategy

Data architecture should be tested at several levels.

### Unit Tests

Test individual parsers, normalizers, validators, and generators.

### Relationship Tests

Verify important relationships resolve correctly.

### Historical Tests

Verify context-specific records remain isolated.

### Generation Tests

Verify deterministic generated output.

### Repository Tests

Verify canonical and generated data can be queried correctly.

### Integration Tests

Verify the complete path:

```text
API
 ->
Service
 ->
Repository
 ->
Data
```

### User Boundary Tests

Verify user mutations cannot modify canonical records.

---

# 65. Anti-Patterns

Avoid the following.

## Duplicating Canonical Entities Per Game

Bad:

```text
species:firered-charizard
species:scarlet-charizard
```

when both represent the same canonical species.

Prefer one canonical Species with context-specific state.

## Using Names as IDs

Bad:

```text
"Charizard"
```

Prefer:

```text
species:charizard
```

## Patching Generated Data

Bad:

```text
Edit search-index.json manually
```

Prefer:

```text
Fix canonical source or generator
-> regenerate
```

## Mixing Contexts

Bad:

```text
FireRed tracker + modern encounter data
```

unless explicitly requested.

## Storing User State in Canonical Data

Bad:

```text
canonical charizard:
caught = true
```

The caught state belongs to the user.

## Making the Frontend Authoritative

The frontend should not become the source of canonical Pokémon knowledge.

---

# 66. Documentation and Metadata

Important canonical data should retain enough metadata to support investigation.

Useful metadata may include:

```text
sourceType
sourceIdentifier
sourceGame
sourceVersion
extractionVersion
validationStatus
```

Metadata explains provenance.

It should not replace canonical meaning.

---

# 67. Data Quality Status

Datasets may use controlled quality statuses such as:

```text
draft
extracted
validated
canonical
deprecated
needs-review
```

The exact statuses may evolve.

A record should not be considered production-ready merely because it exists.

Quality status should be evaluated by the validation pipeline.

---

# 68. Release Process

A canonical data release should generally follow:

```text
Source acquisition
      ->
Extraction
      ->
Validation
      ->
Canonical update
      ->
Relationship update
      ->
Generated rebuild
      ->
Generated validation
      ->
Application tests
      ->
Release
```

A release should be reproducible from its declared source and generator versions.

---

# 69. Backward Compatibility

Historical identifiers and supported contexts should remain stable across releases.

When a schema changes, migrations should preserve:

- Canonical identity
- Historical relationships
- User references
- Context meaning

Breaking changes should be deliberate and documented.

---

# 70. Migration Principles

Migrations should be:

- Explicit
- Versioned
- Reproducible
- Tested
- Reversible where practical

Never silently reinterpret old user data as a different canonical concept.

When identifiers must change for a genuine correction, maintain an explicit migration mapping.

---

# 71. Design Decision Rule

When deciding where new data belongs, ask:

```text
Is it source evidence?
    -> Raw Extraction

Is it a canonical concept?
    -> Canonical Database

Is it a connection?
    -> Relationship Layer

Is it derived for performance?
    -> Generated Data

Is it application behavior?
    -> Runtime

Is it personal trainer state?
    -> User Database
```

This classification should be the first architectural question for new data.

---

# 72. Data Architecture Checklist

Before accepting a new dataset or feature, verify:

- Does every canonical entity have a stable identifier?
- Is ownership clear?
- Is historical context explicit where needed?
- Are relationships represented rather than duplicated?
- Are references valid?
- Are generated datasets reproducible?
- Can derived data be regenerated?
- Is user data isolated?
- Are source decisions documented?
- Are validation rules present?
- Does the feature preserve existing historical data?
- Does the runtime use approved repositories and services?

---

# 73. Final Architecture Summary

```text
                     OFFICIAL SOURCES
                            |
                            v
                     RAW EXTRACTION
                            |
                            v
                  CANONICAL DATABASE
                            |
                 +----------+----------+
                 |                     |
                 v                     v
          RELATIONSHIP LAYER      VALIDATION
                 |                     |
                 +----------+----------+
                            |
                            v
                    GENERATED DATA
                            |
                            v
                  APPLICATION RUNTIME
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
          BACKEND        FRONTEND         AI
             |
             v
        USER DATABASE
```

The ownership model is:

```text
Official Sources
    = external authority

Raw Extraction
    = source representation

Canonical Database
    = internal authority

Relationship Layer
    = canonical connections

Generated Data
    = disposable optimization

Application Runtime
    = controlled access and behavior

User Database
    = mutable trainer state
```

The most important rules are:

1. Canonical identifiers remain stable.
2. Historical information is never silently overwritten.
3. Context-sensitive data uses explicit Game Contexts.
4. Relationships reference canonical identifiers.
5. Generated data is disposable and reproducible.
6. User data is isolated from canonical knowledge.
7. Runtime services cannot modify canonical data.
8. External sources do not silently override accepted canonical data.
9. Validation must protect every data layer.
10. New games and mechanics should extend the architecture without breaking historical records.

---

# 74. Closing Principle

Pokémon Companion should treat its data as a long-lived historical knowledge system.

The application is not simply storing a list of Pokémon.

It is storing a connected representation of:

```text
Pokémon
+
Games
+
Versions
+
Mechanics
+
Moves
+
Abilities
+
Items
+
Locations
+
Maps
+
Encounters
+
Trainers
+
Events
+
Progression
+
Assets
```

The architecture keeps these concepts connected while preserving their individual identities and historical contexts.

The result is a system where:

```text
Official Evidence
      ->
Canonical Knowledge
      ->
Connected Relationships
      ->
Efficient Runtime Data
      ->
Accurate Application Features
      ->
Personal Trainer Progress
```

can evolve for many years without turning historical Pokémon data into an unmaintainable collection of duplicated records.

The Canonical Database remains the internal source of truth.

The Relationship Layer provides the knowledge graph.

Game Context preserves historical correctness.

Generated Data provides performance.

The User Database provides personal progression.

Together, these principles form the foundation of Pokémon Companion's data architecture.
