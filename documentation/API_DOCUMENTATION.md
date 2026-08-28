# API Documentation

## Purpose

This document defines the public REST API exposed by Pokémon Companion.

Its purpose is to provide stable, secure, versioned interfaces through which client applications and platform services can access Pokémon Companion capabilities while remaining independent of internal implementation details, database design, and storage mechanisms.

The API provides controlled access to:

- Canonical Pokémon knowledge
- Game Context data
- Trainer-owned data
- Collection data
- Battle services
- World data
- Intelligence services
- Community services
- Synchronization services
- Search services

The API is a communication boundary between clients and the Pokémon Companion platform.

It must expose stable contracts without exposing internal implementation details.

---

# Scope

This document defines the public API contract for Pokémon Companion.

It documents:

- API architecture
- API resources
- Endpoint conventions
- Request conventions
- Response conventions
- Authentication
- Authorization
- Game Context handling
- Versioning
- Filtering
- Searching
- Sorting
- Pagination
- Error handling
- Data ownership boundaries
- Future API expansion

This document does not define:

- Database schemas
- Internal class structures
- Internal service implementations
- Generated dataset implementation
- Frontend behavior
- UI component structure
- Internal business logic

Those responsibilities belong to their respective project documentation.

---

# API Architecture

The Pokémon Companion API follows a resource-oriented REST architecture.

The API is designed around clear boundaries between:

1. Canonical Knowledge
2. Trainer-Owned Data
3. Community Data
4. Intelligence-Generated Information
5. Infrastructure Services

The API should expose these resources through stable interfaces rather than allowing clients to interact directly with internal storage or generated dataset structures.

---

# Architectural Dependency

The API sits within the broader Pokémon Companion architecture.

The general dependency direction is:

```text
Infrastructure
      ↓
Knowledge
      ↓
Trainer
      ↓
Collection / Battle / World
      ↓
Intelligence / Community
```

The API provides interfaces to these layers but does not replace their internal responsibilities.

For example:

```text
Data Generation Pipeline
          ↓
Validation Framework
          ↓
Generated Datasets
          ↓
API Platform
          ↓
Client Applications
```

Trainer-owned services similarly operate through authenticated API boundaries:

```text
Client
  ↓
Authentication
  ↓
API Platform
  ↓
Application Services
  ↓
Trainer-Owned Data
```

---

# Base URL

The initial API version is:

```text
/api/v1
```

All public API resources should be exposed beneath the versioned API namespace.

Example:

```text
GET /api/v1/pokemon
```

---

# API Principles

The Pokémon Companion API should:

- Expose canonical Pokémon knowledge through stable endpoints.
- Preserve the distinction between canonical and trainer-owned data.
- Respect Game Context for game-dependent information.
- Require authentication for protected trainer resources.
- Enforce authorization for trainer-owned and private data.
- Provide consistent request and response conventions.
- Support filtering, searching, sorting, and pagination where appropriate.
- Validate incoming requests.
- Return predictable errors.
- Remain independent of database implementation.
- Avoid exposing internal implementation details.
- Support future Pokémon generations and games.
- Preserve backward compatibility wherever practical.
- Use versioned contracts for breaking changes.
- Prevent unauthorized modification of canonical data.
- Protect trainer privacy.
- Support scalable client applications.

---

# API Data Boundaries

The API must preserve the ownership boundaries defined by the platform architecture.

## Canonical Data

Canonical data represents authoritative Pokémon knowledge.

Examples include:

- Pokémon species
- Pokémon forms
- Moves
- Abilities
- Items
- Types
- Regions
- Locations
- Official trainers
- Game mechanics
- Encounter definitions
- Historical records

Canonical data is controlled by the platform's canonical datasets and generated data pipeline.

Client applications must not directly modify canonical data through normal public API endpoints.

---

## Trainer-Owned Data

Trainer-owned data represents information created or maintained by an authenticated trainer.

Examples include:

- Teams
- Adventures
- Collections
- Achievements
- Battle statistics
- Trainer statistics
- Journal entries
- Tracker progress
- Personal preferences
- Application settings

Trainer-owned data may reference canonical entities.

For example:

```text
Trainer Team
    ↓
references
    ↓
Canonical Pokémon
```

The trainer may modify their team.

The trainer may not modify the canonical Pokémon record referenced by that team.

---

## Community Data

Community data represents information intentionally shared by trainers.

Examples include:

- Shared Teams
- Shared Collections
- Community Ratings
- Community Feedback
- Leaderboard Records
- Community Challenge Results
- Community Activity

Community data must remain separate from canonical Pokémon knowledge.

Publishing trainer-owned information to the community must never transfer ownership of the underlying trainer data.

---

## Intelligence Data

Intelligence-generated information includes:

- Recommendations
- Suggested actions
- Team suggestions
- Collection analysis
- Adventure guidance
- Search interpretations
- AI explanations

Intelligence-generated information must remain distinguishable from canonical facts.

AI-generated recommendations must not become canonical Pokémon data automatically.

---

# Canonical Data Protection

The API must preserve the canonical data boundary.

The following operations must never be allowed through normal trainer or community endpoints:

```text
Trainer Data ─────X────→ Canonical Data
Community Data ───X────→ Canonical Data
AI Output ─────────X────→ Canonical Data
```

Canonical data is generated and maintained through the platform's data pipeline.

The general flow is:

```text
Canonical Sources
       ↓
Data Generation Pipeline
       ↓
Validation Framework
       ↓
Validated Generated Data
       ↓
API Platform
       ↓
Client Applications
```

A generated dataset that fails a critical validation rule must not become an application-consumable API release artifact.

---

# Game Context

Game Context is a first-class concern of the Pokémon Companion API.

Many resources have different meanings depending on the selected Pokémon game, generation, version group, region, or ruleset.

When an endpoint supports Game Context, the API must resolve the requested information against the applicable context.

Examples include:

- Pokémon availability
- Pokémon forms
- Moves
- Abilities
- Items
- Locations
- Encounters
- Trainers
- Regional Pokédexes
- Battle mechanics
- Game-specific progression
- Game-specific statistics

---

## Context Resolution

A request may provide a Game Context explicitly.

Example:

```text
GET /api/v1/pokemon/25?game_context=firered
```

The exact parameter name may be finalized during API implementation.

The important architectural requirement is that game-dependent information must be resolved through the Game Context system.

---

## Default Context

If an endpoint supports a default representation and no Game Context is supplied, the API may return the project's default canonical representation.

The default behavior must be documented consistently for each affected endpoint.

The API must never silently combine incompatible information from different Game Contexts.

---

## Context Integrity

For example, an endpoint must not combine:

```text
Game A Pokémon availability
+
Game B move data
+
Game C encounter data
```

unless the request explicitly represents a cross-game operation and the API contract permits it.

Game-dependent responses should identify the applicable context whenever ambiguity is possible.

---

# API Versioning

The current public API version is:

```text
v1
```

The base path is:

```text
/api/v1
```

Breaking changes should be introduced through a new API version.

For example:

```text
/api/v1
/api/v2
```

Existing clients should continue to function against the supported version for as long as that version remains available.

---

## Versioning Principles

API versioning should:

- Preserve existing contracts where practical.
- Avoid unnecessary breaking changes.
- Clearly document breaking changes.
- Maintain compatibility during migration periods where practical.
- Prevent internal implementation changes from unnecessarily becoming API changes.

API versioning applies to public contracts, not internal service implementations.

---

# API Status

The following status categories are used throughout this document.

### Completed

The API capability is implemented and considered available.

### In Development

Implementation is actively underway.

### Planned

The capability is part of the current architectural plan but implementation has not been completed.

### Future

The capability belongs to a later development phase.

---

## Current API Status

| Module | Priority | Status |
|---|---|---|
| API Platform | Critical | Planned |
| Pokémon | Critical | In Development |
| Species | Critical | In Development |
| Moves | Critical | In Development |
| Abilities | Critical | In Development |
| Types | Critical | In Development |
| Items | High | Planned |
| Game Context | Critical | In Development |
| Search | High | Planned |
| Authentication | Critical | Planned |
| Trainer Profiles | High | Planned |
| Teams | High | Planned |
| Adventure Tracker | High | Planned |
| Achievements | Medium | Planned |
| Collections | High | Planned |
| Battle Services | High | Planned |
| World Services | High | Planned |
| Intelligence Services | High | Future |
| Shared Teams | Low | Future |
| Shared Collections | Low | Future |
| Leaderboards | Low | Future |
| Community Challenges | Low | Future |
| Cloud Synchronization | Medium | Future |
| Monitoring | Medium | Planned |

---

# Request Conventions

API requests should follow consistent conventions.

Where applicable, requests may contain:

- Path parameters
- Query parameters
- Request bodies
- Authentication credentials
- Game Context information

Example:

```text
GET /api/v1/pokemon?type=fire&page=1&limit=20
```

The exact parameter names may evolve during implementation, but equivalent resources should follow consistent conventions.

---

# Query Parameters

Query parameters may be used for:

- Searching
- Filtering
- Sorting
- Pagination
- Game Context selection
- Field selection where supported

Example:

```text
GET /api/v1/pokemon?generation=1&type=fire
```

Endpoints should reject unsupported parameters rather than silently interpreting them incorrectly.

---

# Pagination

Collection endpoints should support pagination where datasets may contain large numbers of records.

A request may use parameters such as:

```text
?page=1&limit=20
```

Example:

```text
GET /api/v1/pokemon?page=1&limit=20
```

The exact pagination mechanism may evolve as implementation progresses.

Pagination responses should provide sufficient metadata for clients to determine:

- Current page
- Page size
- Total records where available
- Whether another page exists

Example:

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1025,
        "has_next": true
    }
}
```

---

# Filtering

Endpoints should provide filtering where the underlying resource supports meaningful filtering.

Examples include:

```text
type
generation
region
game
game_context
category
collection_type
battle_category
```

Filtering behavior should be documented by individual endpoints.

---

# Sorting

Collection endpoints may support sorting where meaningful.

Example:

```text
GET /api/v1/pokemon?sort=id
```

or:

```text
GET /api/v1/collections?sort=completion
```

Supported sort fields must be explicitly documented.

Clients must not assume arbitrary database fields are available for sorting.

---

# Searching

Search-capable endpoints should support appropriate search behavior.

Depending on the resource, this may include:

- Exact matching
- Partial matching
- Identifier lookup
- Fuzzy matching
- Name matching

Search behavior should remain deterministic and documented.

---

# Response Format

Successful API responses should use a consistent envelope.

Basic response:

```json
{
    "success": true,
    "data": {}
}
```

Collection response:

```json
{
    "success": true,
    "data": [],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "has_next": true
    }
}
```

Additional metadata may be provided when appropriate:

```json
{
    "success": true,
    "data": {},
    "meta": {}
}
```

The API should avoid returning unnecessary implementation-specific metadata.

---

# Error Response

Failed requests should return a predictable machine-readable structure.

Example:

```json
{
    "success": false,
    "error": {
        "code": "RESOURCE_NOT_FOUND",
        "message": "The requested Pokémon could not be found."
    }
}
```

Errors should not expose:

- Database internals
- Stack traces
- Secrets
- Internal file paths
- Authentication credentials
- Private trainer information
- Other sensitive implementation details

---

# Validation

All API requests must be validated before being passed to application services.

Validation may include:

- Required parameter validation
- Type validation
- Format validation
- Enum validation
- Identifier validation
- Authorization validation
- Game Context validation
- Request body validation

Invalid requests should produce clear client-facing errors.

---

# Authentication

Protected trainer resources require authentication.

Authentication establishes the identity of the trainer making the request.

Authorization determines whether that trainer is permitted to perform the requested operation.

These are separate responsibilities.

---

## Authentication Endpoints

### POST `/api/v1/auth/login`

Authenticate an existing trainer.

**Status:** Planned

---

### POST `/api/v1/auth/register`

Create a new trainer account.

**Status:** Planned

---

### POST `/api/v1/auth/logout`

Terminate the current authenticated session.

**Status:** Planned

---

### GET `/api/v1/auth/me`

Retrieve the currently authenticated trainer.

**Status:** Planned

---

# Authorization

Authentication alone does not grant access to every resource.

The API must enforce authorization for:

- Trainer-owned data
- Private collections
- Private teams
- Personal journals
- Personal statistics
- Synchronization data
- Community publishing controls

A trainer must not be able to access another trainer's private data simply by knowing its identifier.

---

# Privacy Enforcement

Privacy settings must be enforced at the API boundary.

Private information must never be exposed through:

- Search
- Shared Collections
- Shared Teams
- Leaderboards
- Community Challenges
- AI recommendations
- Public trainer profiles
- Comparison endpoints

The API must evaluate the applicable visibility rules before returning trainer-owned information.

---

# API Ownership Rule

The API must preserve ownership when trainer data becomes publicly shareable.

For example:

```text
Private Team
    ↓
Trainer chooses to share
    ↓
Shared Team representation
    ↓
Community API
```

The shared representation does not transfer ownership of the original team.

The same principle applies to collections, achievements, statistics, and other trainer-owned information.

---

# Public vs Protected Resources

API resources should be classified as either public or protected.

### Public resources may include:

- Canonical Pokémon knowledge
- Moves
- Abilities
- Types
- Items
- Public game information
- Publicly shared community information

### Protected resources may include:

- Trainer profile data
- Teams
- Collections
- Adventures
- Achievements
- Journal entries
- Battle statistics
- Synchronization data
- Private settings

Individual resources may define more restrictive access requirements.

---

# API Security Principles

The API should:

- Authenticate protected requests.
- Authorize resource access.
- Validate all client input.
- Protect trainer-owned data.
- Encrypt communication.
- Apply appropriate rate limiting.
- Avoid leaking sensitive information.
- Log security-relevant events where appropriate.
- Prevent unauthorized modification of canonical data.

Security must be consistently applied across all API modules.

---

