# Pokémon Companion Datasets

> **Master Dataset Catalog**
>
> Defines the datasets used by Pokémon Companion, their responsibilities, ownership, lifecycle, dependencies, validation, versioning, and consumption rules.

---

## 1. Purpose

The Datasets document is the master catalog for the Pokémon Companion data ecosystem.

It explains:

- What datasets exist
- Why each dataset exists
- Which architectural layer owns it
- Where its data originates
- Which systems consume it
- How it is generated
- How it is validated
- How it is versioned
- How it evolves as the project expands

This document catalogs datasets. It does not replace:

- `DATA_ARCHITECTURE.md`, which defines the overall data pipeline and architecture
- `DATABASE_SCHEMA.md`, which defines entity and relationship structures
- Validation documentation, which defines detailed validation algorithms
- API documentation, which defines external application interfaces

The goal is to provide one practical reference for understanding the dataset ecosystem without duplicating the detailed specifications maintained elsewhere.

---

# 2. Dataset Philosophy

Pokémon Companion treats datasets as independent architectural components with clearly defined responsibilities.

The following principles apply to every dataset.

### 2.1 Single Responsibility

Each dataset should answer one primary data question.

For example:

```text
species
```

defines species.

```text
pokemon-learns-move
```

defines learning relationships.

```text
pokemon-lookup
```

provides an optimized lookup view.

A dataset should not gradually become a general-purpose storage area.

### 2.2 One Canonical Location

A factual concept should have one canonical home.

Duplicated information should normally be represented as a reference.

For example, a move name belongs to the Move dataset. A learnset references the Move identifier rather than storing another authoritative copy of the move.

### 2.3 Derived Data Is Disposable

Generated datasets may duplicate information for performance.

However:

> A generated dataset is never the source of truth.

Generated data must be reproducible from its inputs.

### 2.4 Context Matters

Pokémon data changes between generations, versions, and games.

Datasets must preserve the context required to interpret historical information correctly.

### 2.5 User Data Is Independent

User datasets represent personal state.

They may reference canonical entities but must never modify canonical knowledge.

### 2.6 Provenance Matters

Data should remain traceable to its source and transformation path.

A developer should be able to determine:

```text
Official Source
    ↓
Raw Dataset
    ↓
Canonical Dataset
    ↓
Relationship Dataset
    ↓
Generated Dataset
    ↓
Application
```

---

# 3. Dataset Lifecycle

The dataset lifecycle follows the project's broader data architecture.

```text
Official Sources
      ↓
Raw Sources
      ↓
Canonical Datasets
      ↓
Relationship Datasets
      ↓
Generated Datasets
      ↓
Application Runtime

User Input
      ↓
User Datasets
      ↓
Application Runtime
```

The first five layers describe official Pokémon knowledge.

The User Dataset layer describes trainer-specific state.

These two flows may interact through identifiers, but they must remain logically separated.

---

# 4. Dataset Layers

Every dataset belongs to exactly one primary layer.

| Layer | Name | Primary Responsibility |
|---|---|---|
| 1 | Official Sources | External authoritative Pokémon information |
| 2 | Raw Sources | Faithful extracted representations |
| 3 | Canonical Datasets | Stable internal knowledge |
| 4 | Relationship Datasets | Connections between canonical entities |
| 5 | Generated Datasets | Optimized derived views |
| 6 | User Datasets | Trainer-owned mutable state |

A dataset should not move between layers during normal operation.

If the purpose of a dataset changes substantially, it should normally be replaced by a dataset appropriate to the new layer.

---

# 5. Dataset Registry

The following registry provides the high-level catalog.

## 5.1 Official Source Categories

```text
official-game-data
official-game-assets
official-text-resources
official-event-data
official-platform-data
```

## 5.2 Raw Dataset Categories

```text
raw-game
raw-world
raw-pokemon
raw-battle
raw-trainer
raw-item
raw-asset
raw-text
raw-event
```

## 5.3 Canonical Dataset Categories

```text
generations
version-groups
versions
game-contexts

regions
locations
location-areas
maps

species
forms
pokemon
types
moves
abilities
items
evolution-methods
machines
natures
egg-groups
pokedex-entries

trainers
encounters
events
requirements
objectives

assets
```

## 5.4 Relationship Dataset Categories

```text
species-has-form
species-has-pokemon

pokemon-has-type
pokemon-has-ability
pokemon-learns-move
pokemon-evolves-into-pokemon
pokemon-has-asset

move-has-type
move-has-damage-class
move-has-target
machine-teaches-move

game-contains-region
region-contains-location
location-contains-area
area-contains-encounter

encounter-contains-pokemon
encounter-requires-condition
encounter-occurs-in-context

trainer-uses-pokemon
trainer-appears-in-game
trainer-located-at-location

item-used-for-evolution
item-found-at-location
item-held-by-pokemon
item-available-in-game

context-enables-pokemon
context-enables-move
context-enables-item
context-enables-mechanic
```

## 5.5 Generated Dataset Categories

```text
pokemon-lookup
species-lookup
move-lookup
ability-lookup
item-lookup
trainer-lookup
location-lookup

search-index
autocomplete-index
alias-index

pokemon-by-type
pokemon-by-ability
pokemon-by-region
pokemon-by-generation
pokemon-by-game

evolution-graph
learnset-index
encounter-index
map-connection-index
progression-index
type-effectiveness-index

regional-pokedex-index
machine-compatibility-index

build-manifest
dataset-manifest
validation-summary
```

## 5.6 User Dataset Categories

```text
users
user-settings
adventures
trackers
tracker-state
tracker-map-state
tracker-objectives

pokemon-instances
teams
team-members

collection-state
item-collection
form-collection
shiny-collection
ribbon-collection
mark-collection

achievement-state
notes
challenge-runs

ai-preferences
ai-history
saved-prompts

friends
shared-teams
community-activity
```

---

# 6. Layer 1: Official Sources

## 6.1 Purpose

Official Sources are external resources used as inputs to the Pokémon Companion extraction pipeline.

They are not application datasets and should never be consumed directly by application code.

They provide the factual and historical foundation for supported games.

## 6.2 Ownership

Official Sources remain owned by their respective rights holders.

Pokémon Companion does not treat these resources as project-owned canonical datasets.

## 6.3 Source Categories

### Game Data

May include:

- Executables
- Archives
- Binary tables
- Scripts
- Battle data
- Save structures
- Internal resources

### Game Assets

May include:

- Sprites
- Models
- Animations
- Icons
- Cries
- Backgrounds
- Interface resources

### Text Resources

May include:

- Names
- Dialogue
- Pokédex entries
- Location text
- Trainer names
- Item text
- Move descriptions

### Gameplay Data

May include:

- Learnsets
- Evolution definitions
- Encounters
- Trainer parties
- Item placements
- Machine compatibility
- Battle rules

### Event Data

May include:

- Mystery Gifts
- Event Pokémon
- Promotional distributions
- Event items
- Time-limited content

## 6.4 Consumption Rules

Official Sources are consumed only by:

- Extraction
- Provenance tooling
- Verification
- Research tooling

Application services must not depend directly on Official Sources.

## 6.5 Validation

Before extraction, the source should be checked for:

- Identity
- Game version
- Platform
- File integrity
- Compatibility
- Language
- Expected structure

---

# 7. Layer 2: Raw Sources

## 7.1 Purpose

Raw Sources preserve extracted information before normalization.

They should remain close to the original game representation.

Raw data is optimized for fidelity rather than application convenience.

## 7.2 Responsibilities

Raw datasets preserve:

- Original values
- Original structures
- Source identifiers
- Game-specific details
- Extraction metadata
- Provenance
- Unnormalized relationships where necessary

## 7.3 Raw Dataset Families

### Raw Game Dataset

Describes:

- Games
- Generations
- Version groups
- Versions
- Platforms

### Raw World Dataset

Describes:

- Maps
- Map headers
- Locations
- Areas
- Connections
- Objects
- Tiles

### Raw Pokémon Dataset

Describes:

- Species
- Forms
- Pokémon
- Base statistics
- Types
- Abilities
- Growth data
- Evolution data
- Learnsets

### Raw Battle Dataset

Describes:

- Moves
- Effects
- Targets
- Damage classes
- Status mechanics
- Battle-specific values

### Raw Trainer Dataset

Describes:

- Trainers
- Trainer classes
- Parties
- Levels
- Held items
- AI flags
- Battle facilities

### Raw Item Dataset

Describes:

- Items
- Item categories
- Machines
- Held items
- Key items
- Item effects

### Raw Asset Dataset

Describes:

- Sprites
- Models
- Animations
- Icons
- Cries
- Asset metadata

### Raw Text Dataset

Preserves:

- Original text
- Language
- String identifiers
- Localization metadata

### Raw Event Dataset

Preserves:

- Event definitions
- Event conditions
- Distribution information
- Historical availability

## 7.4 Raw Data Rules

Raw datasets:

- Are generated by extraction
- Are read-only after generation
- Must retain provenance
- Must not contain application-specific calculations
- Must not contain user state
- Should be reproducible

Manual correction should normally occur in the extraction or normalization layer, not by silently editing raw output.

---

# 8. Layer 3: Canonical Datasets

## 8.1 Purpose

Canonical Datasets provide the stable internal representation of Pokémon knowledge.

They normalize differences between source formats while preserving historical context through relationships and game contexts.

## 8.2 Canonical Dataset Rules

Canonical datasets should:

- Have stable identifiers
- Avoid unnecessary duplication
- Represent one conceptual entity per record
- Preserve provenance
- Support historical interpretation
- Remain independent of generated views
- Remain independent of user state

---

# 9. Game Context Datasets

## 9.1 Generations

Dataset:

```text
generations
```

Represents major mechanical eras.

Primary fields:

```text
id
number
name
release-period
```

## 9.2 Version Groups

Dataset:

```text
version-groups
```

Groups releases sharing a common rules/data family.

## 9.3 Versions

Dataset:

```text
versions
```

Represents individual official releases.

## 9.4 Game Contexts

Dataset:

```text
game-contexts
```

Defines the context required to interpret data correctly.

A Game Context may reference:

- Version
- Version Group
- Generation
- Rule Set
- Enabled mechanics
- Available entities
- Map set
- Progression model

Game Contexts are critical for historical accuracy.

---

# 10. World Datasets

## 10.1 Regions

Dataset:

```text
regions
```

Represents broad Pokémon world regions.

## 10.2 Locations

Dataset:

```text
locations
```

Represents named places such as:

- Cities
- Towns
- Routes
- Caves
- Forests
- Towers
- Buildings
- Islands

## 10.3 Location Areas

Dataset:

```text
location-areas
```

Represents logical sub-areas used for encounters, events, and navigation.

## 10.4 Maps

Dataset:

```text
maps
```

Represents context-specific playable map representations.

Maps may reference:

- Location
- Game Context
- Dimensions
- Tile set
- Collision metadata
- Object layers
- Connection metadata

---

# 11. Pokémon Datasets

## 11.1 Species

Dataset:

```text
species
```

One record per canonical species.

Examples:

```text
species:bulbasaur
species:pikachu
species:charizard
```

## 11.2 Forms

Dataset:

```text
forms
```

Represents recognized variations of species.

Examples:

- Regional forms
- Mega forms
- Primal forms
- Gigantamax forms
- Battle forms
- Cosmetic forms

## 11.3 Pokémon

Dataset:

```text
pokemon
```

Represents canonical Pokémon/form combinations used by the application.

This is not the same as a trainer-owned Pokémon instance.

## 11.4 Types

Dataset:

```text
types
```

Represents canonical elemental types.

## 11.5 Moves

Dataset:

```text
moves
```

Represents canonical moves.

## 11.6 Abilities

Dataset:

```text
abilities
```

Represents canonical abilities.

## 11.7 Natures

Dataset:

```text
natures
```

Represents canonical natures and their mechanical characteristics.

## 11.8 Egg Groups

Dataset:

```text
egg-groups
```

Represents breeding compatibility categories.

## 11.9 Evolution Methods

Dataset:

```text
evolution-methods
```

Defines reusable evolution mechanisms.

Examples:

```text
level-up
use-item
trade
trade-with-held-item
friendship
location
known-move
time-of-day
```

---

# 12. Item Datasets

## 12.1 Items

Dataset:

```text
items
```

Represents canonical items.

Examples include:

- Poké Balls
- Potions
- Key Items
- Held Items
- Battle Items
- Evolution Items

## 12.2 Machines

Dataset:

```text
machines
```

Represents move-teaching items or systems.

The dataset supports historical differences between:

- HM
- TM
- TR
- Other teaching systems

Machine applicability is represented through relationships.

---

# 13. Trainer Datasets

## 13.1 Trainers

Dataset:

```text
trainers
```

Represents canonical trainer definitions.

A trainer record may include:

- Trainer identity
- Trainer class
- Display name
- Game-specific identity
- Context information

## 13.2 Trainer Parties

Trainer parties are represented through relationship or party datasets rather than embedding permanent Pokémon entities inside trainer records.

Party information may include:

- Pokémon
- Level
- Moves
- Held items
- Ability
- Nature
- IV/EV information where available
- Battle context

---

# 14. Encounter Datasets

## 14.1 Encounters

Dataset:

```text
encounters
```

Defines encounter definitions.

An encounter can contain:

- Pokémon reference
- Location area
- Game context
- Encounter method
- Level range
- Probability
- Time restrictions
- Conditions
- Special rules

Examples of methods:

```text
walk
surf
fish
old-rod
good-rod
super-rod
rock-smash
headbutt
gift
static
special
```

Encounter datasets must preserve version-specific differences.

---

# 15. Event Datasets

## 15.1 Events

Dataset:

```text
events
```

Represents important in-game or distribution events.

Examples:

- Receiving a key item
- Receiving a gift Pokémon
- Defeating a story trainer
- Triggering a story event
- Removing an obstacle
- Unlocking an area

Events may reference:

- Game Context
- Location
- NPC
- Object
- Requirement Set
- Rewards
- State changes

---

# 16. Requirement Datasets

## 16.1 Requirements

Dataset:

```text
requirements
```

Represents conditions used by progression and world systems.

Requirement types may include:

```text
badge
item
key-item
move
field-move
story-flag
event
trainer-defeat
location-visit
pokemon-state
developer-setting
glitch-enabled
```

Requirements should be composable through explicit operators such as:

```text
all
any
not
```

Requirements must remain context-aware.

---

# 17. Objective Datasets

## 17.1 Objectives

Dataset:

```text
objectives
```

Represents discoverable progression goals.

Objectives are not necessarily linear.

They may describe:

- Story goals
- Optional goals
- Collection goals
- Exploration goals
- Preparation goals
- Challenge goals

An objective may reference:

- Location
- Event
- Requirement Set
- Reward
- Completion condition

---

# 18. Asset Datasets

## 18.1 Assets

Dataset:

```text
assets
```

Defines metadata and references for visual or audio resources.

Asset records may include:

```text
id
asset-type
subject-id
game-context-id
variant
path
format
dimensions
checksum
license/provenance metadata
```

Asset files themselves should not be treated as canonical entity definitions.

---

# 19. Pokédex Dataset

## 19.1 Pokédex Entries

Dataset:

```text
pokedex-entries
```

Stores context-specific and language-specific Pokédex descriptions.

Each entry may reference:

- Pokémon
- Version
- Language
- Text
- Source

A Pokémon can therefore have different Pokédex entries without duplicating the Pokémon entity.

---

# 20. Layer 4: Relationship Datasets

## 20.1 Purpose

Relationship Datasets connect canonical entities.

They contain facts about how entities interact rather than redefining the entities themselves.

## 20.2 Relationship Rules

Every relationship should define:

```text
id
source
target
relationship-type
context
conditions
provenance
```

Additional fields may be added when they describe the relationship itself.

Examples:

```text
level
method
slot
probability
quantity
priority
availability
```

---

# 21. Pokémon Relationships

## 21.1 Species to Form

```text
species-has-form
```

Connects a species to its recognized forms.

## 21.2 Pokémon to Type

```text
pokemon-has-type
```

May contain:

```text
slot
game-context
```

This permits historical type changes.

## 21.3 Pokémon to Ability

```text
pokemon-has-ability
```

May contain:

```text
slot
hidden
game-context
```

## 21.4 Pokémon to Move

```text
pokemon-learns-move
```

May contain:

```text
method
level
machine
move-tutor
egg
event
requirements
game-context
```

## 21.5 Evolution

```text
pokemon-evolves-into-pokemon
```

May contain:

```text
method
item
level
time
location
known-move
friendship
trade-target
conditions
```

---

# 22. Move Relationships

Supported relationships include:

```text
move-has-type
move-has-damage-class
move-has-target
machine-teaches-move
```

These relationships allow mechanics to change historically without duplicating move records.

---

# 23. World Relationships

Core world relationships include:

```text
game-contains-region
region-contains-location
location-contains-area
location-contains-map
map-connects-to-map
area-contains-encounter
map-contains-object
```

World relationships should preserve game context where geometry or accessibility differs.

---

# 24. Encounter Relationships

Core encounter relationships include:

```text
encounter-contains-pokemon
encounter-occurs-in-context
encounter-requires-condition
```

Encounter relationships may include:

- Probability
- Level range
- Method
- Time
- Weather
- Special conditions

---

# 25. Trainer Relationships

Core trainer relationships include:

```text
trainer-uses-pokemon
trainer-appears-in-game
trainer-located-at-location
trainer-party-member
```

Trainer relationships must preserve game context because trainer parties often change between releases.

---

# 26. Item Relationships

Core item relationships include:

```text
item-used-for-evolution
item-found-at-location
item-held-by-pokemon
item-available-in-game
item-teaches-move
```

---

# 27. Context Relationships

Context relationships define historical availability.

Examples:

```text
context-enables-pokemon
context-enables-move
context-enables-item
context-enables-ability
context-enables-form
context-enables-mechanic
```

A canonical entity may exist globally while being unavailable in a specific Game Context.

---

# 28. Layer 5: Generated Datasets

## 28.1 Purpose

Generated Datasets provide optimized runtime views.

They are produced from validated canonical and relationship datasets.

They may duplicate data intentionally for performance.

## 28.2 Generation Rules

Generated datasets must be:

- Deterministic
- Reproducible
- Read-only
- Context-aware
- Validated
- Disposable
- Build-versioned

No generated dataset should require manual editing.

---

# 29. Lookup Datasets

Lookup datasets provide direct retrieval by stable identifier.

Examples:

```text
pokemon-lookup
species-lookup
move-lookup
ability-lookup
item-lookup
trainer-lookup
location-lookup
```

Typical lookup structure:

```json
{
    "pokemon:pikachu-default": {
        "name": "Pikachu",
        "speciesId": "species:pikachu"
    }
}
```

Lookup datasets should optimize common application reads.

---

# 30. Search Datasets

Search datasets support user discovery.

Examples:

```text
search-index
autocomplete-index
alias-index
name-index
keyword-index
```

Search records may contain:

```text
canonicalId
displayName
aliases
searchTokens
entityType
contextAvailability
```

Search indexes are rebuildable.

---

# 31. Navigation Datasets

Navigation datasets simplify common queries.

Examples:

```text
pokemon-by-type
pokemon-by-ability
pokemon-by-region
pokemon-by-generation
pokemon-by-game
moves-by-type
items-by-category
trainers-by-region
locations-by-region
```

These views should reference canonical identifiers.

---

# 32. Relationship Views

Frequently traversed graphs should receive optimized views.

Examples:

```text
evolution-graph
learnset-index
encounter-index
machine-compatibility-index
type-effectiveness-index
map-connection-index
progression-index
regional-pokedex-index
```

The view may flatten several relationships when doing so improves runtime access.

The flattened result remains derived data.

---

# 33. Analytical Datasets

Analytical datasets contain calculated information.

Examples:

```text
type-coverage
encounter-statistics
collection-statistics
battle-statistics
completion-statistics
evolution-statistics
```

Calculated values must record the build or source versions used to produce them.

Analytics must not silently become canonical facts.

---

# 34. Progression Datasets

Progression indexes support adventure simulation.

Examples:

```text
progression-index
reachable-location-index
objective-index
requirement-index
obstacle-index
event-index
```

These datasets may pre-compute:

- Available objectives
- Reachable locations
- Unlocked connections
- Blocked connections
- Required items
- Required badges
- Required events

Progression views must distinguish:

```text
normal
developer
glitch-enabled
```

when the project supports multiple rule modes.

---

# 35. Map Runtime Datasets

Map-oriented generated datasets may include:

```text
map-index
map-object-index
collision-index
warp-index
map-connection-index
obstacle-index
tile-index
```

These datasets should allow the frontend to load only the information required for a particular map or region.

---

# 36. Build Metadata Datasets

## 36.1 Build Manifest

Dataset:

```text
build-manifest
```

Records:

- Build ID
- Build timestamp
- Schema version
- Dataset versions
- Generator versions
- Validation versions
- Supported contexts
- Source revisions

## 36.2 Dataset Manifest

Dataset:

```text
dataset-manifest
```

Records:

- Dataset identifier
- Dataset version
- Layer
- Generator
- Input datasets
- Record count
- Checksum
- Status

## 36.3 Validation Summary

Dataset:

```text
validation-summary
```

Records:

- Validation run
- Dataset
- Rules executed
- Errors
- Warnings
- Result

---

# 37. Layer 6: User Datasets

## 37.1 Purpose

User Datasets store mutable trainer-specific information.

They are separate from canonical knowledge.

The canonical database describes Pokémon.

The User Database describes what a particular trainer has done with that knowledge.

---

# 38. User Account Datasets

Core datasets include:

```text
users
user-settings
privacy-settings
notification-settings
```

Sensitive account information should remain isolated from gameplay state wherever practical.

---

# 39. Adventure Datasets

Core datasets include:

```text
adventures
trackers
tracker-state
tracker-map-state
tracker-objectives
```

An Adventure or Tracker references a Game Context.

Example:

```text
tracker:firered-main
    ↓
context:firered
```

---

# 40. Tracker State

Tracker state may contain:

```text
current-location
badges
key-items
field-moves
story-flags
completed-events
defeated-trainers
completed-objectives
```

This state belongs exclusively to the tracker.

---

# 41. Tracker Map State

Map state may contain:

```text
visited-locations
visited-maps
collected-items
defeated-trainers
cleared-obstacles
activated-events
discovered-encounters
```

Canonical map objects remain immutable.

Only their user-specific state is stored in the User Database.

---

# 42. Pokémon Instance Dataset

Dataset:

```text
pokemon-instances
```

Represents a trainer-owned Pokémon.

A Pokémon instance references a canonical Pokémon.

Example:

```text
pokemon-instance:001
    ↓
pokemon:pikachu-default
```

The instance may store:

```text
nickname
level
nature
ability
IVs
EVs
moves
held-item
Poké Ball
shiny
ribbons
marks
original-trainer
notes
```

Canonical Pokémon records must never store these trainer-specific properties.

---

# 43. Team Datasets

Core datasets:

```text
teams
team-members
```

A Team references Pokémon Instances rather than canonical Pokémon when representing an actual trainer team.

A separate team-planning feature may reference canonical Pokémon.

This distinction prevents planned teams from being confused with owned Pokémon.

---

# 44. Collection Datasets

Collection datasets track trainer progress.

Examples:

```text
collection-state
item-collection
form-collection
shiny-collection
ribbon-collection
mark-collection
```

A collection record should reference canonical identifiers.

Example:

```text
collection-state
    ↓
pokemon:pikachu-default
```

---

# 45. Achievement Datasets

Core datasets:

```text
achievement-state
milestones
rewards
```

Achievement definitions may be canonical or application configuration.

Achievement progress is always user-owned.

---

# 46. Challenge Run Datasets

Challenge runs may include:

```text
challenge-runs
challenge-rules
challenge-state
challenge-events
```

Examples:

- Nuzlocke
- Monotype
- Solo runs
- Level caps
- Randomizer-compatible tracking

Challenge rules should be stored separately from normal tracker state.

---

# 47. Notes Dataset

Dataset:

```text
notes
```

Stores trainer-created notes.

Notes may reference:

- Tracker
- Location
- Pokémon Instance
- Trainer
- Event
- Objective

Notes are user content and must never be written into canonical datasets.

---

# 48. AI User Datasets

Possible datasets include:

```text
ai-preferences
ai-history
saved-prompts
recommendation-state
```

AI datasets may contain user-generated or model-generated information.

AI-generated recommendations should remain distinguishable from verified canonical knowledge.

The AI layer must not promote generated suggestions into canonical datasets without explicit verification.

---

# 49. Community Datasets

Possible datasets include:

```text
friends
friend-requests
shared-teams
shared-collections
community-activity
event-participation
```

Community data is optional and should remain separate from private tracker state.

Sharing a team should not automatically expose the user's complete adventure data.

---

# 50. Dataset Ownership Matrix

| Dataset Layer | Owner | Mutable by Application |
|---|---|---:|
| Official Sources | Rights holders | No |
| Raw Sources | Pokémon Companion pipeline | No |
| Canonical Datasets | Pokémon Companion | No at runtime |
| Relationship Datasets | Build pipeline | No at runtime |
| Generated Datasets | Build pipeline | No |
| User Datasets | User | Yes |

Runtime services should never mutate canonical knowledge.

---

# 51. Dataset Dependency Rules

Dependencies should flow in one direction.

Allowed:

```text
Official → Raw
Raw → Canonical
Canonical → Relationships
Canonical + Relationships → Generated
Canonical + Context → User references
User → Application
```

Not allowed:

```text
User → Canonical
Generated → Canonical
Generated → Raw
Canonical → User state
Application runtime → Raw
Application runtime → Official
```

Generated datasets may depend on multiple upstream datasets.

User datasets may reference canonical identifiers but must not become upstream inputs to canonical generation.

---

# 52. Dataset Consumption Rules

Application services should prefer generated datasets for common read operations.

Use canonical or relationship datasets directly when:

- A query is complex
- A generated view does not exist
- An administrative operation requires source-level detail
- A validation operation requires canonical data

Frontend code should generally consume application-facing APIs or runtime datasets rather than raw source data.

---

# 53. Dataset Boundaries

Each dataset has an explicit boundary.

For example:

```text
species
```

owns:

```text
species identity
```

It does not own:

```text
encounters
learnsets
trainer ownership
user progress
```

Likewise:

```text
pokemon-learns-move
```

owns:

```text
learning relationship
```

It does not own:

```text
move identity
pokemon identity
user move selection
```

Clear boundaries prevent uncontrolled dataset growth.

---

# 54. Dataset Naming Standards

Dataset identifiers should use lowercase kebab-case.

Preferred:

```text
pokemon
pokemon-has-ability
evolution-graph
trainer-collections
```

Avoid:

```text
PokemonData
Pokemon_Data
pokemonData
POKEMON
```

Dataset names should describe their responsibility rather than their implementation.

Avoid names such as:

```text
misc
data
stuff
common
everything
```

---

# 55. Singular vs Plural

Entity datasets normally use plural names:

```text
species
pokemon
moves
abilities
items
locations
trainers
```

Relationship datasets describe the relationship:

```text
pokemon-has-type
pokemon-learns-move
pokemon-evolves-into-pokemon
```

Generated views should describe their access pattern:

```text
pokemon-lookup
pokemon-by-type
evolution-graph
search-index
```

---

# 56. Identifier Rules

Dataset identifiers and record identifiers are different concepts.

Dataset:

```text
pokemon
```

Record:

```text
pokemon:pikachu-default
```

Identifiers should:

- Remain stable
- Be globally unique where required
- Not depend on display names
- Not be reused
- Remain language-independent
- Support references across generated datasets

---

# 57. Metadata Standards

Every dataset should expose metadata describing itself.

Recommended metadata:

```text
datasetId
displayName
layer
datasetType
version
status
source
generator
schemaVersion
recordCount
checksum
createdAt
updatedAt
```

Generated datasets should additionally expose:

```text
inputDatasets
buildVersion
generatorVersion
validationVersion
```

---

# 58. Dataset Versioning

Dataset versions exist to protect compatibility.

A version should change when the dataset contract changes or when project policy requires a release boundary.

### Compatible changes

Examples:

- Adding records
- Adding optional metadata
- Adding new supported contexts
- Adding non-breaking indexes

### Breaking changes

Examples:

- Removing required fields
- Changing identifier semantics
- Changing relationship meaning
- Removing supported record structures
- Renaming a dataset without a migration

Breaking changes require:

- Documentation
- Migration planning
- Consumer review
- Validation
- Updated build metadata

---

# 59. Build Versioning

A complete build should identify:

```text
buildVersion
schemaVersion
datasetVersions
generatorVersions
validationVersion
sourceRevisions
```

This allows a deployed runtime dataset to be traced back to its inputs.

---

# 60. Provenance

Every factual dataset should preserve provenance appropriate to its layer.

A useful provenance chain is:

```text
source
    ↓
extraction
    ↓
raw record
    ↓
normalization
    ↓
canonical record
    ↓
relationship
    ↓
generated view
```

Provenance should be sufficient to answer:

- Where did this fact come from?
- Which source version produced it?
- Which transformation produced it?
- Which build contains it?
- When was it verified?

---

# 61. Validation by Layer

| Layer | Primary Validation |
|---|---|
| Official | Source identity and integrity |
| Raw | Extraction correctness |
| Canonical | Entity integrity |
| Relationship | Reference and context integrity |
| Generated | Build and output integrity |
| User | Ownership and state integrity |

Each layer should validate before passing data downstream.

---

# 62. Canonical Validation

Canonical datasets should validate:

- Unique identifiers
- Required fields
- Valid data types
- Valid enumerations
- Provenance
- Context references
- Duplicate concepts
- Historical consistency

A canonical build should fail if a required reference cannot be resolved.

---

# 63. Relationship Validation

Relationship datasets should validate:

- Source exists
- Target exists
- Relationship type is valid
- Context exists
- Conditions resolve
- Duplicate relationships are rejected
- Relationship semantics are valid

Relationships that reference nonexistent canonical entities should fail validation.

---

# 64. Generated Dataset Validation

Generated datasets should validate:

- Input build versions
- Record counts
- Reference integrity
- Output schema
- Determinism
- Completeness
- Duplicate keys
- Manifest consistency

Generated output should never silently contain unresolved identifiers.

---

# 65. User Dataset Validation

User datasets should validate:

- User ownership
- Tracker ownership
- Canonical references
- Game context compatibility
- Team membership
- Pokémon instance ownership
- Permission boundaries
- Synchronization consistency

Invalid user references should be rejected without modifying canonical data.

---

# 66. Tracker Isolation

Trackers must remain independent.

For example:

```text
FireRed Main
FireRed Nuzlocke
FireRed Challenge
LeafGreen Main
Emerald Living Dex
```

Each tracker owns its own:

- Progress
- Map state
- Objectives
- Collections
- Pokémon instances
- Teams
- Notes
- Challenge state

One tracker must not inherit another tracker's state unless the user explicitly performs an operation such as:

```text
clone
import
export
compare
```

---

# 67. Context Isolation

Game Contexts must not be silently mixed.

For example:

```text
context:firered
context:leafgreen
context:emerald
```

A FireRed tracker should not automatically inherit LeafGreen progression rules.

If two contexts share canonical entities, they may reference the same entity identifiers while using different relationships and rules.

---

# 68. Historical Accuracy

Historical accuracy is represented through context-specific datasets and relationships.

Avoid creating:

```text
pokemon-pikachu-gen1
pokemon-pikachu-gen2
pokemon-pikachu-gen3
```

when the underlying concept is the same Pokémon species.

Instead:

```text
pokemon:pikachu-default
```

can be interpreted through context-specific relationships.

Historical differences belong in:

```text
relationships
contexts
rules
generated context views
```

---

# 69. Generated Data Rebuild Rules

Generated datasets must be rebuilt when relevant upstream inputs change.

For example:

```text
pokemon
    +
pokemon-has-type
    ↓
pokemon-by-type
```

If either input changes, the generated view should be rebuilt.

Likewise:

```text
maps
+
map connections
+
requirements
    ↓
progression-index
```

---

# 70. Incremental Generation

The build system may regenerate only affected datasets.

Example:

```text
Move changed
    ↓
Rebuild:
    move-lookup
    move-search-index
    pokemon-learnset-index
    machine-compatibility-index
```

It should not unnecessarily rebuild unrelated user datasets.

Generated dependency metadata should make incremental generation possible.

---

# 71. Dataset Manifests

Every published dataset should have a manifest.

Example:

```json
{
    "datasetId": "pokemon-lookup",
    "version": "1.0.0",
    "layer": "generated",
    "recordCount": 1025,
    "schemaVersion": 1,
    "generatorVersion": "1.4.0",
    "buildVersion": "2026.08.16",
    "validationStatus": "validated"
}
```

The exact manifest structure may evolve with the build system.

---

# 72. Dataset Checksums

Published datasets should support checksums where practical.

Checksums help detect:

- Corruption
- Unexpected modification
- Deployment mismatch
- Incomplete downloads
- Cache inconsistency

Checksums should be calculated after generation and before publication.

---

# 73. Dataset Status

Recommended statuses:

```text
planned
active
deprecated
archived
```

### Planned

Dataset is documented but not implemented.

### Active

Dataset is currently supported.

### Deprecated

Dataset remains available temporarily but should not receive new consumers.

### Archived

Dataset is retained for historical or reproducibility purposes and is no longer active.

---

# 74. Deprecation Rules

A deprecated dataset should:

- Have a replacement where applicable
- Document its replacement
- Define a migration path
- Remain readable for the supported compatibility period
- Be removed only through a documented migration

Generated datasets may have shorter lifetimes because they are reproducible.

---

# 75. Dataset Documentation Requirements

Before implementation, every new dataset should document:

```text
Purpose
Layer
Owner
Source
Consumers
Dependencies
Identifier
Record shape
Generation method
Validation
Versioning
Status
```

Relationship datasets should additionally document:

```text
Source entity
Target entity
Context requirements
Relationship semantics
```

---

# 76. Dataset Review Checklist

A dataset is ready for implementation when:

- Its responsibility is clear
- Its layer is defined
- Its owner is defined
- Its source is known
- Its consumers are known
- Its identifiers are stable
- Its dependencies are documented
- Its validation rules are known
- Its versioning impact is understood

If these questions cannot be answered, the dataset definition is incomplete.

---

# 77. Common Anti-Patterns

## 77.1 Duplicate Canonical Data

Bad:

```text
firered-pikachu
leafgreen-pikachu
```

when both represent the same canonical Pokémon concept.

Prefer context-specific relationships.

## 77.2 Generated Data as Source of Truth

Bad:

```text
Edit evolution-graph.json manually.
```

Prefer modifying canonical or relationship inputs and regenerating the graph.

## 77.3 User Data in Canonical Records

Bad:

```text
pokemon:pikachu
    ownedBy: user:123
```

Ownership belongs in user datasets.

## 77.4 General-Purpose Dataset

Bad:

```text
everything.json
```

Prefer focused datasets with clear boundaries.

## 77.5 Context-Free Historical Data

Bad:

```text
pokemon:pokemon
type:electric
```

without enough context to determine whether the relationship is historically correct.

---

# 78. Dataset Security

Canonical datasets are read-only at runtime.

User datasets require:

- Authentication
- Authorization
- Ownership checks
- Input validation
- Synchronization protection
- Appropriate privacy controls

Community datasets additionally require sharing and visibility controls.

AI datasets require separation between:

```text
verified canonical knowledge
```

and:

```text
generated or inferred information
```

---

# 79. Offline Support

Generated datasets should be suitable for local or offline use where practical.

Offline packages may contain:

```text
canonical runtime subset
generated lookup datasets
search indexes
map datasets
progression datasets
asset references
```

User state may be stored locally and synchronized later.

Offline data must preserve dataset versions so synchronization can detect compatibility issues.

---

# 80. API Consumption

The API layer should expose stable application-facing views.

A service may internally read:

```text
pokemon
pokemon-has-type
pokemon-has-ability
```

while exposing:

```text
GET /pokemon/pikachu
```

The API should not force clients to understand internal dataset boundaries.

Generated datasets may be used to satisfy API requests efficiently.

---

# 81. Frontend Consumption

Frontend systems should generally consume:

```text
API responses
runtime-generated datasets
frontend-specific projections
```

They should not directly depend on:

```text
raw extraction files
official source files
internal build artifacts
```

This keeps frontend code independent from extraction implementation details.

---

# 82. Intelligence Layer Consumption

The Intelligence Layer may consume:

```text
canonical knowledge
relationship views
search indexes
progression indexes
analytical datasets
user state
```

However, AI-generated conclusions must remain distinguishable from verified facts.

The AI layer must not silently rewrite canonical datasets.

---

# 83. Community Data Boundaries

Community datasets must not alter official knowledge.

For example, a user may publish:

```text
recommended FireRed team
```

but this does not change:

```text
pokemon
moves
trainers
encounters
```

Community contributions may become candidate source material, but canonical promotion requires the project's verification process.

---

# 84. Localization

Localized datasets should keep language-specific text separate from language-independent entity identity.

For example:

```text
pokemon:pikachu
```

remains stable while localized records provide:

```text
en: Pikachu
ja: ピカチュウ
ko: 피카츄
```

Localized search indexes should be generated from the appropriate language datasets.

---

# 85. Alias Data

Aliases may include:

- Alternate spellings
- Localized names
- Historical names
- Common abbreviations
- Search-friendly terms

Aliases should point to canonical identifiers.

They should not create duplicate canonical entities.

---

# 86. Data Completeness

Completeness should be measured relative to a defined scope.

Examples:

```text
Generation I complete
FireRed complete
Kanto maps complete
All Generation III moves complete
```

A dataset should never claim universal completeness when only a subset has been verified.

Build metadata should identify the supported scope.

---

# 87. Data Quality Levels

Datasets may use quality levels such as:

```text
draft
extracted
normalized
verified
release
```

The exact terminology may evolve, but the distinction between unverified and release-ready data must remain explicit.

---

# 88. Release Readiness

A dataset is release-ready when:

- Inputs are identified
- Records validate
- References resolve
- Context is correct
- Provenance is available
- Required generated views are built
- Build metadata is complete
- Validation passes

A failed validation should block publication of dependent generated datasets.

---

# 89. Dataset Testing

Dataset tests should cover:

### Unit-Level

- Individual record shape
- Identifier rules
- Enum values

### Relationship-Level

- Reference integrity
- Context applicability
- Relationship uniqueness

### Integration-Level

- Cross-dataset consistency
- Generated output
- API projections

### Regression-Level

- Previously verified game behavior
- Historical context
- Existing tracker compatibility

---

# 90. Regression Protection

Historical data should be protected against accidental changes.

When a verified fact changes, the build should identify:

```text
previous value
new value
source
affected datasets
affected generated views
```

This allows developers to distinguish:

```text
legitimate correction
```

from:

```text
unintended regression
```

---

# 91. Performance Considerations

Datasets should be structured according to actual access patterns.

Common operations include:

```text
get Pokémon by ID
search Pokémon
get moves for Pokémon
get evolution chain
get encounters for location
get trainers for location
get reachable locations
get user tracker state
```

Generated datasets should optimize these operations without changing canonical semantics.

---

# 92. Dataset Size

Dataset size should be controlled by responsibility, not by an arbitrary line count.

However:

- Extremely large monolithic datasets should be avoided.
- Logical domains should be split.
- Generated files should be partitionable.
- Context-specific data should be loadable independently where useful.
- Documentation should remain concise enough to maintain.

The source documentation should describe the architecture, not duplicate every record.

---

# 93. Storage Formats

The implementation may use different storage formats for different purposes.

Possible formats include:

```text
JSON
JSONL
SQLite
PostgreSQL
Parquet
Binary indexes
Compressed archives
```

The storage format is an implementation decision.

The logical dataset contract should remain independent of the physical format.

---

# 94. Dataset Packaging

Datasets may be packaged by:

```text
game
generation
region
feature
language
runtime target
```

Example:

```text
firered/
    pokemon/
    moves/
    items/
    maps/
    encounters/
    trainers/
    progression/
```

Packaging should support both development and production workflows.

---

# 95. Caching

Generated datasets may be cached using:

```text
datasetId
datasetVersion
buildVersion
contextId
language
```

Caches must be invalidated when their input versions change.

---

# 96. Synchronization

User synchronization should compare:

```text
user data version
canonical dataset version
schema version
```

If canonical identifiers remain compatible, user state should continue to reference them.

If a migration is required, it must occur through an explicit migration process.

---

# 97. Migration

Dataset migrations may be required for:

- Identifier changes
- Schema changes
- Relationship changes
- User state changes
- Storage format changes

Migration scripts should be:

- Versioned
- Deterministic
- Tested
- Reversible where practical
- Documented

Generated datasets generally do not require migration because they can be rebuilt.

---

# 98. Backup and Recovery

User datasets require backup and recovery strategies.

Canonical and generated datasets should also be reproducible from versioned build inputs.

Recovery priorities:

1. Protect user state.
2. Restore compatible canonical runtime data.
3. Rebuild generated datasets.
4. Verify build integrity.
5. Resume synchronization.

---

# 99. Future Dataset Expansion

New datasets should normally fit into an existing layer.

Do not introduce a new architectural layer merely because a new feature appears.

Prefer:

```text
new canonical entity
new relationship
new generated view
new user state
```

depending on the feature.

---

# 100. Future Dataset Categories

Possible future datasets include:

### World

```text
buildings
npcs
landmarks
dungeon-layouts
route-connections
map-events
```

### Battle

```text
battle-facilities
battle-formats
rental-teams
battle-rules
```

### Gameplay

```text
side-quests
missions
minigames
contest-data
pokéathlon-data
```

### Events

```text
mystery-gifts
distribution-events
promotional-items
event-pokemon
```

### Collection

```text
ribbons
marks
decorations
fashion-items
trainer-card-data
```

### Intelligence

```text
strategy-datasets
recommendation-data
analytical-reports
ai-knowledge-cache
```

These must remain derived or verified according to their role.

---

# 101. Expansion Rules

When adding a dataset:

1. Determine whether the information already exists.
2. Reuse an existing canonical entity when possible.
3. Add a relationship if the information describes a connection.
4. Add a generated view if the information is derived.
5. Add user state only when the information belongs to a trainer.
6. Document provenance.
7. Define validation.
8. Define consumers.
9. Define versioning.
10. Add the dataset to the registry.

---

# 102. Dataset Lifecycle Status

The master registry should make dataset maturity visible.

Recommended lifecycle:

```text
planned
    ↓
implemented
    ↓
validated
    ↓
active
    ↓
deprecated
    ↓
archived
```

Not every dataset must pass through every state.

Generated datasets may be recreated for every build.

---

# 103. Dataset Governance

Changes to canonical or relationship datasets should be reviewed carefully because they may affect:

- Generated indexes
- APIs
- Frontend behavior
- AI responses
- Adventure progression
- User references

Changes to user datasets should prioritize:

- Privacy
- Compatibility
- Data integrity
- Ownership

---

# 104. Final Dataset Architecture

```text
                    ┌─────────────────────┐
                    │  Official Sources   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Raw Sources      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Canonical Datasets  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Relationship Data   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Generated Datasets  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Application Runtime │
                    └─────────────────────┘


                    ┌─────────────────────┐
                    │    User Datasets    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Application Runtime │
                    └─────────────────────┘
```

The critical boundary is:

```text
Official Knowledge
        ≠
User State
```

The critical dependency rule is:

```text
Source → Raw → Canonical → Relationship → Generated
```

The critical runtime rule is:

```text
Generated data is disposable.
Canonical data is authoritative.
User data is independent.
```

---

# 105. Final Dataset Rules

The following rules are mandatory unless a documented architectural exception exists.

1. Every dataset has one clear responsibility.
2. Every dataset belongs to one architectural layer.
3. Canonical concepts are not duplicated unnecessarily.
4. Relationships are represented explicitly.
5. Historical differences are context-aware.
6. Generated datasets are reproducible.
7. Generated datasets are never manually authoritative.
8. User datasets never modify canonical knowledge.
9. Trackers remain isolated.
10. Dataset identifiers remain stable.
11. Display names are never permanent foreign keys.
12. Dataset provenance must be preserved.
13. Dataset versions must be traceable.
14. Validation must occur before publication.
15. Failed upstream validation blocks dependent publication.
16. New datasets should extend existing layers.
17. Dataset documentation must precede implementation.
18. Physical storage format must not redefine logical ownership.
19. Community and AI data must remain distinguishable from verified canonical knowledge.
20. Future expansion must preserve historical compatibility.

---

# 106. Document Status

**Document:** `DATASETS.md`

**Document Version:** `2.0`

**Status:** Approved

This document is the master catalog and architectural reference for Pokémon Companion datasets.

It defines the responsibilities and boundaries of the project's dataset ecosystem without attempting to enumerate every individual record.

Detailed entity structures belong in the Database Schema.

Detailed extraction and transformation procedures belong in Data Architecture.

Detailed validation algorithms belong in Validation documentation.

Detailed API contracts belong in API documentation.

As Pokémon Companion expands, this document should be updated whenever a new dataset, dataset layer, ownership boundary, or major dataset lifecycle rule is introduced.
