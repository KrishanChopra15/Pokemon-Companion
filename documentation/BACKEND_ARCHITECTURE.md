# Pokémon Companion Backend Architecture

> **Backend Architecture Specification**
>
> Defines the backend structure, dependency rules, data boundaries, runtime services, application services, and development standards for Pokémon Companion.

---

## 1. Purpose

The Pokémon Companion backend provides the stable application layer between:

- Generated canonical Pokémon datasets
- Game Context data
- Application services
- Dynamic world and progression systems
- Trainer-owned data
- Collection systems
- Battle systems
- Community systems
- Intelligence systems
- Public and private APIs
- Cloud synchronization

The backend is responsible for exposing validated Pokémon knowledge, executing context-aware application logic, and safely managing trainer-owned data.

The backend must remain independent of frontend implementation details.

The backend must also remain independent of live third-party Pokémon APIs during normal application runtime.

External sources may be used during controlled data-generation processes, but runtime canonical information must come from validated generated datasets.

---

## 2. Scope

This document defines:

- Backend project organization
- Architectural layers
- Dependency direction
- Application services
- Request lifecycle
- Canonical data access
- Trainer data access
- Community data boundaries
- Intelligence data boundaries
- Game Context resolution
- Dynamic map services
- Progression simulation
- Collection services
- Battle services
- Validation
- API integration
- Error handling
- Configuration
- Logging
- Performance
- Security
- Testing
- Background processing
- Extensibility standards

This document does **not** define:

- The complete public API endpoint catalog
- The complete canonical database schema
- Frontend implementation
- UI component structure
- Data-source extraction procedures in full detail

Those responsibilities are documented separately.

---

# 3. Architectural Philosophy

Pokémon Companion follows a **foundation-first, data-first, context-aware architecture**.

The platform is built around four major principles:

1. Canonical knowledge must be trustworthy.
2. Game-specific information must remain context-aware.
3. Trainer-owned data must remain isolated and mutable.
4. Higher-level features must consume lower-level services through explicit interfaces.

The architecture therefore separates:

```text
Canonical Knowledge
        ↓
Application Services
        ↓
Trainer / Collection / Battle / World Features
        ↓
Intelligence / Community Features
        ↓
Client Applications
```

Infrastructure provides the technical foundation underneath these layers.

---

# 4. Architectural Layers

Pokémon Companion is organized into the following conceptual layers.

```text
┌─────────────────────────────────────────────┐
│              Client Applications            │
├─────────────────────────────────────────────┤
│       Intelligence / Community Features     │
├─────────────────────────────────────────────┤
│ Collection / Battle / World / Trainer       │
├─────────────────────────────────────────────┤
│              Knowledge Layer                 │
├─────────────────────────────────────────────┤
│            Application Services              │
├─────────────────────────────────────────────┤
│                Infrastructure                │
└─────────────────────────────────────────────┘
```

The general dependency direction is:

**Infrastructure → Knowledge → Trainer → Collection / Battle / World → Intelligence / Community**

This represents architectural responsibility rather than a requirement that every feature directly import every lower-level module.

Dependencies should pass through stable services and interfaces.

---

## 4.1 Infrastructure Layer

The Infrastructure Layer provides the technical foundation required by every other layer.

Primary responsibilities include:

- Data generation
- Dataset validation
- API infrastructure
- Storage adapters
- Cloud synchronization
- Background jobs
- Monitoring
- Logging
- Configuration
- Runtime infrastructure

Core infrastructure features include:

- Data Generation Pipeline
- Validation Framework
- Cloud Synchronization
- API Platform
- Monitoring

Infrastructure should provide reusable capabilities rather than feature-specific business logic.

---

## 4.2 Knowledge Layer

The Knowledge Layer provides authoritative Pokémon information.

Examples include:

- Pokémon
- Species
- Forms
- Moves
- Abilities
- Items
- Types
- Regions
- Locations
- Trainers
- Encounters
- Events
- Maps
- Game Contexts
- Progression Rules
- Assets

The Knowledge Layer is the authoritative source for canonical Pokémon information.

Canonical records are read-only during normal application runtime.

---

## 4.3 Trainer Layer

The Trainer Layer manages trainer-owned information.

Examples include:

- Trainer profiles
- Adventures
- Teams
- Pokémon instances
- Journal entries
- Achievements
- Trainer statistics
- Preferences
- Personal progress

Trainer data may reference canonical knowledge.

Trainer data must never modify canonical knowledge.

---

## 4.4 Collection Layer

The Collection Layer manages trainer-owned collection systems.

Examples include:

- Living Dex
- Regional Pokédex
- Shiny Collection
- Form Collection
- Ribbon Collection
- Mark Collection
- Prestige Collection
- Collection Statistics

Collection records reference canonical Pokémon entities while storing trainer-specific ownership and progress.

---

## 4.5 Battle Layer

The Battle Layer provides battle analysis and simulation capabilities.

Examples include:

- Team Analysis
- Damage Calculator
- Battle Simulator
- Strategy Planner
- Battle Statistics
- Battle Recommendations

Battle systems consume canonical battle data and trainer-created teams.

Battle calculations must respect the selected Game Context.

Battle services must not modify canonical Pokémon records.

---

## 4.6 World Layer

The World Layer provides exploration and geographical functionality.

Examples include:

- World Explorer
- Interactive Maps
- Route Explorer
- Encounter Tables
- Trainer Database
- Hidden Item Finder
- Location Information
- Map Progress

The World Layer combines canonical world information with trainer-specific progression.

---

## 4.7 Intelligence Layer

The Intelligence Layer analyzes existing platform information to provide useful recommendations and interpretations.

Examples include:

- AI Assistant
- Smart Search
- Team Recommendations
- Adventure Guidance
- Collection Analysis
- Battle Recommendations

Intelligence services must distinguish between:

- Canonical facts
- Trainer-owned records
- Community-generated information
- AI-generated recommendations

AI output must never silently become canonical Pokémon knowledge.

---

## 4.8 Community Layer

The Community Layer provides optional trainer interaction.

Examples include:

- Friends
- Shared Teams
- Shared Collections
- Leaderboards
- Community Challenges

Community systems operate on trainer-approved information.

Community-generated data must never become canonical Pokémon knowledge.

---

# 5. Backend Structure

The backend implementation follows a modular structure.

```text
backend/

├── config/
├── constants/
├── controllers/
├── middleware/
├── models/
├── repositories/
├── routes/
├── services/
├── validators/
├── utils/
├── jobs/
├── tests/
├── app.js
└── server.js
```

| Directory | Responsibility |
|---|---|
| `config/` | Environment, paths, feature flags, runtime configuration |
| `constants/` | Shared constants, enums, limits, error codes |
| `controllers/` | HTTP request and response coordination |
| `middleware/` | Authentication, authorization, logging, error handling |
| `models/` | Domain models for mutable trainer-owned data |
| `repositories/` | Canonical and trainer data access |
| `routes/` | URL mapping and middleware registration |
| `services/` | Application and domain business logic |
| `validators/` | Request and domain input validation |
| `utils/` | Stateless reusable helpers |
| `jobs/` | Background processing and maintenance |
| `tests/` | Unit, integration, validation, and architecture tests |

---

# 6. Database-First Runtime

The backend consumes validated generated datasets for canonical Pokémon knowledge.

The normal runtime path is:

```text
Canonical Sources
       ↓
Data Generation Pipeline
       ↓
Validation Framework
       ↓
Validated Generated Datasets
       ↓
Canonical Repositories
       ↓
Application Services
       ↓
Controllers
       ↓
API
```

The backend must not depend on live third-party Pokémon APIs for normal runtime knowledge.

This provides:

- Deterministic results
- Offline-capable canonical access
- Faster requests
- Better historical accuracy
- Controlled versioning
- Reproducible builds
- Reduced external dependency risk

---

# 7. Canonical Data Is Read-Only

Canonical Pokémon knowledge is immutable during application runtime.

Backend services may:

- Query canonical records
- Filter canonical records
- Resolve relationships
- Calculate derived information
- Select Game Context-specific records
- Transform data into API responses

Backend services must not:

- Modify canonical records
- Add trainer-created Pokémon to canonical datasets
- Replace official move data with user-created values
- Alter historical game information through trainer actions
- Persist trainer changes into generated canonical files

Examples of canonical data include:

```text
Species
Forms
Pokémon
Moves
Abilities
Items
Locations
Maps
Encounters
Trainers
Events
Progression Rules
Game Contexts
Assets
```

---

# 8. Trainer Data Is Mutable and Isolated

Trainer-owned data is mutable.

However, every trainer-owned record must remain scoped to its owner.

Examples include:

```text
Trainer Profile
Adventure Tracker
Team
Pokémon Instance
Collection Progress
Achievement Progress
Journal Entry
Map Progress
Settings
Statistics
```

A trainer record may reference canonical entities such as:

```text
pokemon:charizard
move:flamethrower
item:charcoal
location:celadon-city
```

but the reference does not grant permission to modify those canonical records.

---

# 9. Data Ownership Boundaries

Pokémon Companion maintains four important data boundaries.

### Canonical Data

Controlled by the platform.

```text
Species
Moves
Abilities
Items
Maps
Locations
Game Mechanics
```

### Trainer Data

Owned by an individual trainer.

```text
Teams
Collections
Adventure Progress
Achievements
Notes
Settings
```

### Community Data

Created from trainer-approved sharing.

```text
Shared Teams
Shared Collections
Ratings
Feedback
Challenge Results
Community Activity
```

### Intelligence Data

Generated by application intelligence.

```text
Recommendations
Suggested Actions
Priorities
Explanations
Search Interpretations
```

These boundaries must remain distinct.

No community or AI-generated information may silently overwrite trainer or canonical data.

---

# 10. Application Service Layer

The Application Service Layer coordinates use cases across repositories and domain services.

Its responsibilities include:

- Orchestrating multi-step operations
- Resolving dependencies
- Enforcing application-level rules
- Coordinating transactions
- Combining canonical and trainer data
- Calling domain services
- Preparing data for controllers

Application services must not contain HTTP-specific logic.

They should operate independently of Express or any specific web framework.

---

# 11. Service Container

The backend should provide a centralized application service container.

Its purpose is to create and wire shared services and repositories.

Conceptually:

```text
Application Container
        │
        ├── Configuration
        ├── Repositories
        ├── Game Context Engine
        ├── Knowledge Services
        ├── Trainer Services
        ├── Collection Services
        ├── Battle Services
        ├── World Services
        ├── Intelligence Services
        └── Community Services
```

The service container is responsible for:

- Creating shared dependencies
- Registering implementations
- Resolving service dependencies
- Preventing duplicated service instances
- Providing controlled dependency injection

The service container must **not** execute feature logic.

It creates and wires services only.

---

# 12. Application Entry Points

## 12.1 `app.js`

`app.js` creates and configures the application.

Responsibilities:

- Create the HTTP application
- Load application configuration
- Initialize the service container
- Register middleware
- Register route groups
- Configure centralized error handling
- Export the configured application

`app.js` must not start the network listener.

---

## 12.2 `server.js`

`server.js` starts the runtime process.

Responsibilities:

- Load configuration
- Initialize the application
- Start the HTTP server
- Report startup status
- Handle graceful shutdown
- Close resources safely

`server.js` should remain thin.

It must not contain business logic.

---

# 13. Core Architectural Rule

The backend must preserve this fundamental flow:

```text
HTTP
 ↓
Route
 ↓
Middleware
 ↓
Validator
 ↓
Controller
 ↓
Application Service
 ↓
Domain Service
 ↓
Repository
 ↓
Storage
```

No layer should bypass another layer simply because doing so appears convenient.

This keeps the architecture:

- Testable
- Replaceable
- Predictable
- Maintainable
- Scalable

---

## 14. Request Lifecycle

Every API request follows a predictable lifecycle.

```text
Client
  ↓
Route
  ↓
Middleware
  ↓
Validator
  ↓
Controller
  ↓
Application Service
  ↓
Domain Service
  ↓
Repository
  ↓
Generated Dataset / User Store
```

The response follows the reverse direction:

```text
Generated Dataset / User Store
  ↓
Repository
  ↓
Domain Service
  ↓
Application Service
  ↓
Controller
  ↓
API Response
  ↓
Client
```

---

## 14.1 Lifecycle Rules

1. Routes map URLs to controllers.
2. Middleware applies reusable request behavior.
3. Validators reject invalid input before business logic executes.
4. Controllers translate HTTP requests into application-service calls.
5. Application services coordinate the requested use case.
6. Domain services execute feature-specific business rules.
7. Repositories access canonical or trainer-owned data.
8. Controllers convert service results into standardized responses.
9. Centralized error middleware handles unexpected failures.
10. No controller should directly access storage.

---

# 15. Dependency Rules

Dependencies must flow toward lower-level infrastructure.

```text
Routes
   ↓
Controllers
   ↓
Application Services
   ↓
Domain Services
   ↓
Repositories
   ↓
Storage Adapters
```

The dependency direction must remain explicit.

---

## 15.1 Allowed Dependencies

### Routes

Routes may import:

- Controllers
- Middleware
- Validators
- Route configuration

Routes must not contain business logic.

---

### Controllers

Controllers may import:

- Application services
- Request/response utilities
- Error utilities

Controllers must not directly access:

- Databases
- Generated datasets
- Storage adapters
- External APIs

---

### Application Services

Application services may import:

- Domain services
- Repositories
- Validators where appropriate
- Domain models
- Pure utilities

Application services must remain independent of HTTP implementation details.

---

### Domain Services

Domain services may import:

- Repositories
- Domain models
- Constants
- Pure utilities
- Other approved domain services

Domain services must not import:

- Controllers
- Routes
- HTTP request objects
- HTTP response objects

---

### Repositories

Repositories may import:

- Storage adapters
- Dataset readers
- Persistence utilities
- Serialization utilities

Repositories must not import:

- Controllers
- Routes
- Application services

---

### Validators

Validators may import:

- Schemas
- Constants
- Pure validation utilities

Validators must not execute business operations or modify persistent state.

---

## 15.2 Forbidden Dependencies

The following are prohibited:

```text
Repository → Service
Repository → Controller
Repository → Route

Service → Controller
Service → Route

Validator → Controller
Validator → Service Logic

Canonical Repository → Trainer Service
Trainer Repository → Canonical Mutation

Controller → Database
Controller → Generated Dataset
```

Circular dependencies are prohibited.

---

# 16. Repository Architecture

Repositories hide storage implementation details from services.

A service should request data through a repository rather than knowing whether the data comes from:

- JSON
- SQLite
- PostgreSQL
- IndexedDB
- Object storage
- Another supported storage provider

---

# 16.1 Canonical Repositories

Canonical repositories provide read-only access to generated Pokémon knowledge.

Examples:

```text
species-repository
pokemon-repository
form-repository
move-repository
ability-repository
item-repository
type-repository
location-repository
map-repository
encounter-repository
trainer-repository
event-repository
progression-rule-repository
game-context-repository
asset-repository
```

Responsibilities:

- Load generated datasets
- Build lookup maps
- Resolve stable identifiers
- Resolve Game Context-specific records
- Resolve relationships
- Return stable domain objects
- Hide dataset paths
- Prevent runtime mutation

---

# 16.2 Canonical Repository Rules

Canonical repositories must:

- Treat generated data as immutable
- Avoid writing to generated datasets
- Validate requested identifiers
- Resolve the requested Game Context
- Return predictable results
- Avoid exposing raw storage structures unnecessarily

For example:

```text
PokemonService
      ↓
PokemonRepository
      ↓
Generated Pokemon Dataset
```

The service should not know whether the repository internally uses JSON files, SQLite, or another implementation.

---

# 16.3 User Repositories

User repositories manage mutable trainer-owned data.

Examples:

```text
user-repository
profile-repository
tracker-repository
tracker-state-repository
pokemon-instance-repository
team-repository
collection-repository
achievement-repository
journal-repository
sync-repository
```

Responsibilities:

- Enforce user ownership
- Enforce tracker ownership
- Persist trainer changes
- Return user-scoped records
- Maintain synchronization metadata
- Prevent cross-trainer access

---

# 16.4 Community Repositories

Community repositories manage approved shared information.

Examples:

```text
friend-repository
shared-team-repository
shared-collection-repository
leaderboard-repository
challenge-repository
community-feedback-repository
```

Community repositories must respect:

- Trainer privacy
- Sharing permissions
- Ownership
- Visibility rules
- Attribution
- Game Context

Community repositories must never modify the original private trainer record merely because a public representation was created.

---

# 16.5 Storage Adapters

Repositories should use storage adapters rather than binding the application to a single database technology.

Possible storage implementations include:

```text
Canonical:
JSON
SQLite
Generated Binary / Indexed Data

Trainer:
SQLite
PostgreSQL
Other supported relational storage

Local Client:
IndexedDB
Local Storage where appropriate

Assets:
Object Storage
Filesystem
CDN-backed storage
```

The storage implementation may evolve without requiring service or controller rewrites.

---

# 17. Repository Result Rules

Repositories should return domain-oriented results rather than leaking raw storage structures.

For example:

```javascript
const pokemon = await pokemonRepository.findById(
    pokemonId,
    gameContext
);
```

The service should receive a predictable domain representation.

It should not need to know:

```text
/data/generated/pokemon.json
/database/pokemon.db
/storage/pokemon/table
```

Storage paths and persistence details belong inside the repository layer.

---

# 18. Application Service Architecture

Application services represent complete application use cases.

Examples:

```text
GetPokemonDetails
CreateTracker
UpdateTrackerProgress
AnalyzeTeam
CalculateDamage
GetMapState
EvaluateProgression
UpdateCollection
ShareCollection
SubmitChallengeProgress
```

Application services coordinate multiple components when necessary.

For example:

```text
Get Dynamic Map State
        ↓
Game Context Service
        ↓
Map Repository
        ↓
Map State Service
        ↓
Tracker Repository
        ↓
Reachability Service
        ↓
Combined Map Result
```

---

# 19. Service Architecture

Services contain business logic and are organized according to platform responsibilities.

---

## 19.1 Knowledge Services

| Service | Responsibilities |
|---|---|
| Pokémon Service | Pokémon, species, forms, abilities, moves, and evolution relationships |
| Search Service | Search, aliases, autocomplete, filtering, and ranking |
| Game Context Service | Resolve supported games, versions, rulesets, and context metadata |
| World Service | Regions, locations, maps, areas, and connections |
| Encounter Service | Wild encounters, gifts, fishing, trades, and version differences |
| Trainer Knowledge Service | NPC trainers, parties, rematches, and battle metadata |
| Event Service | Story events, NPC events, gifts, static encounters, and event requirements |
| Asset Service | Context-aware sprites, tiles, models, icons, and other assets |

Knowledge services operate primarily on canonical information.

---

# 19.2 Trainer Services

| Service | Responsibilities |
|---|---|
| Trainer Service | Trainer profile and account-related information |
| Tracker Service | Create, update, archive, clone, and select trackers |
| Adventure State Service | Badges, field moves, key items, story flags, and location |
| Team Service | Party and box Pokémon instances |
| Journal Service | Trainer-owned journal entries and notes |
| Achievement Service | Achievement evaluation and progress |
| Trainer Statistics Service | Trainer-owned statistics and progress summaries |
| Preference Service | Trainer-specific application preferences |

---

# 19.3 Collection Services

| Service | Responsibilities |
|---|---|
| Collection Service | General collection ownership and progress |
| Living Dex Service | Living Dex state |
| Regional Dex Service | Regional Pokédex progress |
| Shiny Collection Service | Shiny ownership and progress |
| Form Collection Service | Form ownership and progress |
| Ribbon Collection Service | Ribbon collection |
| Mark Collection Service | Mark collection |
| Prestige Collection Service | Prestige collection |
| Collection Statistics Service | Completion percentages and collection analytics |

Collection services must always distinguish between:

```text
Canonical Pokémon Definition
        +
Trainer Collection State
```

---

# 19.4 Battle Services

| Service | Responsibilities |
|---|---|
| Team Analysis Service | Team weaknesses, strengths, coverage, and recommendations |
| Damage Calculation Service | Context-aware damage calculations |
| Battle Simulation Service | Simulated battle interactions |
| Strategy Service | Strategy planning and battle preparation |
| Battle Statistics Service | Trainer-owned battle statistics |
| Battle Recommendation Service | Context-aware battle recommendations |

Battle calculations must use the appropriate:

- Generation
- Version
- Move mechanics
- Ability mechanics
- Type interactions
- Stat rules
- Damage rules

The service must never silently use modern mechanics for historical games.

---

# 19.5 World Services

| Service | Responsibilities |
|---|---|
| World Service | Regions, locations, maps, and connections |
| Map Service | Map geometry, layers, objects, and connections |
| Map State Service | Combine canonical map state with tracker progress |
| Map Interaction Service | Validate map object interactions |
| Reachability Service | Calculate accessible areas and connections |
| Exploration Service | Discovery, item collection, trainer completion, and encounter discovery |
| Encounter Service | Resolve context-specific encounters |
| Hidden Item Service | Hidden item locations and tracker progress |

---

# 19.6 Intelligence Services

| Service | Responsibilities |
|---|---|
| AI Assistant Service | Natural-language trainer assistance |
| Smart Search Service | Intelligent search interpretation |
| Team Recommendation Service | Team recommendations |
| Adventure Guidance Service | Progression guidance |
| Collection Analysis Service | Collection analysis |
| Battle Recommendation Service | Battle recommendations |

Intelligence services must consume authoritative data through approved services.

They must not create a second canonical Pokémon database.

---

# 19.7 Community Services

| Service | Responsibilities |
|---|---|
| Friends Service | Friend relationships and requests |
| Shared Team Service | Publishing and viewing shared teams |
| Shared Collection Service | Publishing and viewing shared collections |
| Leaderboard Service | Ranking and leaderboard calculations |
| Community Challenge Service | Challenge definitions and participation |
| Community Feedback Service | Likes, ratings, feedback, and moderation-related workflows |

Community services must enforce privacy and visibility rules before exposing trainer-owned information.

---

# 20. Game Context Engine

The Game Context Engine is a central backend capability.

It ensures that historical and game-specific information is resolved correctly.

The general flow is:

```text
Request
   ↓
Context Identifier
   ↓
Game Context Engine
   ↓
Generation
Version Group
Version
Ruleset
Mechanics
Availability
Progression Rules
   ↓
Context-Aware Repository Query
   ↓
Validated Result
```

A Game Context should be treated as a first-class domain concept.

---

# 20.1 Context Resolution

A context may define:

- Game
- Version
- Generation
- Version Group
- Regional Pokédex
- Available Pokémon
- Available Moves
- Available Abilities
- Available Items
- Forms
- Locations
- Encounters
- Trainers
- Mechanics
- Progression Rules
- Assets

---

# 20.2 Context Validation

The Game Context Engine must reject:

- Unknown contexts
- Unsupported games
- Invalid context identifiers
- Incompatible entity combinations
- Unsupported historical data requests

The engine must not silently fall back to another game.

---

# 20.3 Context-Aware Example

```text
GET /contexts/firered/locations/celadon-city
```

The backend should resolve:

```text
context:firered
        ↓
Generation 3
        ↓
FireRed version
        ↓
FireRed map
        ↓
FireRed encounters
        ↓
FireRed trainers
        ↓
FireRed events
        ↓
FireRed progression requirements
```

The result must not accidentally include LeafGreen-specific or modern-game information.

---

# 21. Context Propagation

Once a request establishes a Game Context, that context must remain available throughout the operation.

```text
Controller
   ↓
Application Service
   ↓
Game Context Engine
   ↓
Domain Service
   ↓
Repository
```

A downstream repository must not silently select a different context.

Where practical, context information should be represented explicitly in service and repository method parameters.

---

