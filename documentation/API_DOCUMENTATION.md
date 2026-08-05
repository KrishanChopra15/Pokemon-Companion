# API Documentation

## Purpose

This document defines the public REST API exposed by Pokémon Companion.

Its purpose is to describe how clients interact with the platform through standardized endpoints while remaining independent of the underlying implementation, database design, and internal application architecture.

The API provides access to Pokémon Companion's canonical knowledge, trainer data, collections, battles, world information, intelligence services, and other platform capabilities.

---

## Scope

This document defines the public API contract for Pokémon Companion.

It documents:

- Available API resources.
- Endpoint behavior.
- Request and response conventions.
- Authentication.
- Versioning.
- Filtering.
- Pagination.
- Future API expansion.

This document does not define database schemas, internal architecture, generated datasets, or frontend behavior. Those responsibilities are documented separately within the appropriate project documentation.

---

# Dependencies

The API depends upon:

- Backend Architecture
- Generated Datasets
- Canonical Knowledge
- Validation Framework
- Authentication System (where applicable)

The API exposes platform capabilities but does not define business logic, canonical knowledge, or storage implementation.

---

# Base URL

```
/api/v1
```

---

# API Principles

The Pokémon Companion API is designed around a consistent, resource-oriented REST architecture.

The API should:

- Expose canonical Pokémon knowledge through stable endpoints.
- Provide trainer-specific functionality through authenticated resources.
- Maintain backward compatibility whenever practical.
- Return consistent response structures across all endpoints.
- Support filtering, searching, sorting, and pagination where appropriate.
- Remain independent of the underlying database implementation.

The API should expose platform capabilities without revealing internal implementation details.

---

# Game Context

Many API resources may be queried within a selected Game Context.

When supported, requests may specify a context to retrieve historically accurate information for a specific Pokémon game or ruleset.

If no context is specified, the API returns the project's default canonical representation.

Context handling is documented by individual endpoints where applicable.

---

# API Status

| Module | Status |
|---------|--------|
| Authentication | 📝 Planned |
| Pokémon | 🚧 In Development |
| Species | 🚧 In Development |
| Moves | 🚧 In Development |
| Abilities | 🚧 In Development |
| Types | 🚧 In Development |
| Version Groups | 🚧 In Development |
| Damage Classes | 🚧 In Development |
| Move Targets | 🚧 In Development |
| Generated Datasets | 🚧 In Development |
| Items | 📝 Planned |
| Teams | 📝 Planned |
| Adventure Tracker | 📝 Planned |
| Collections | 📝 Planned |
| AI Assistant | 🔮 Future |
| Friends | 🔮 Future |

---

# Response Format

Successful requests return:

```json
{
    "success": true,
    "data": {}
}
```

Errors return:

```json
{
    "success": false,
    "message": "Error description"
}
```

Future API versions may also include:

```json
{
    "success": true,
    "data": {},
    "meta": {},
    "pagination": {}
}
```

---

# Authentication

## POST `/login`

Authenticate an existing trainer.

**Status:** Planned

---

## POST `/register`

Create a new trainer account.

**Status:** Planned

---

## POST `/logout`

Logout the authenticated trainer.

**Status:** Planned

---

## GET `/me`

Retrieve the authenticated trainer.

**Status:** Planned

---

# Knowledge APIs

## Pokémon

### GET `/pokemon`

Retrieve a paginated list of Pokémon.

Supports:

- Pagination
- Search
- Sorting
- Generation filtering
- Type filtering
- Regional Pokédex filtering
- Form filtering

Returns:

- Basic Pokémon information
- Primary artwork
- Types
- Default form
- Species reference

**Status:** In Development

---

### GET `/pokemon/:id`

Retrieve complete information for a single Pokémon.

Returns:

- Basic Information
- National Number
- Species
- Base Stats
- Height
- Weight
- Types
- Abilities
- Hidden Abilities
- Forms
- Sprites
- Official Artwork
- HOME Artwork
- Dream World Artwork
- Historical Data

**Status:** In Development

---

## Species

### GET `/species`

Retrieve Pokémon species.

Supports:

- Search
- Pagination
- Generation filtering

**Status:** In Development

---

### GET `/species/:id`

Retrieve detailed species information.

Returns:

- Species information
- Pokédex entries
- Evolution references
- Growth information
- Breeding information
- Form references

**Status:** In Development

---

### GET `/species/:id/forms`

Retrieve every generated form for a species.

Returns:

- Default form
- Mega Evolutions
- Regional Forms
- Gigantamax Forms
- Alternate Forms

**Status:** Planned

---

## Moves

### GET `/moves`

Retrieve every Pokémon move.

Supports:

- Search
- Damage Class
- Type
- Generation
- Sorting
- Pagination

**Status:** In Development

---

### GET `/moves/:id`

Retrieve complete move information.

Returns:

- Current move data
- Historical changes
- Effect descriptions
- Version history
- Move metadata
- Contest data
- Flags

**Status:** In Development

---

## Abilities

### GET `/abilities`

Retrieve every Pokémon ability.

Supports:

- Search
- Pagination
- Sorting

**Status:** In Development

---

### GET `/abilities/:id`

Retrieve detailed ability information.

Returns:

- Current ability information
- Historical effects
- Flavor text
- Generation information

**Status:** In Development

---

## Types

### GET `/types`

Retrieve all Pokémon types.

Returns:

- Type information
- Colors
- Damage relations

**Status:** In Development

---

### GET `/types/:id`

Retrieve a specific Pokémon type.

Includes:

- Offensive matchups
- Defensive matchups
- Legacy support

**Status:** In Development

---

## Generated Resources

### GET `/pokemon-index`

Retrieve the optimized Pokémon index generated for the frontend.

**Status:** Planned

---

### GET `/categories/:category`

Retrieve Pokémon belonging to a generated category.

Supported categories:

- Mega
- Regional
- Gigantamax
- Primal
- Totem
- Gender
- Forme
- Alternate

**Status:** Planned

---

## Items

### GET `/items`

Retrieve every item.

Supports:

- Search
- Category filtering
- Pagination

**Status:** Planned

---

### GET `/items/:id`

Retrieve detailed item information.

Returns:

- Basic information
- Category
- Effect
- Sprite
- Game availability

**Status:** Planned

---

## Learnsets

Learnset-related API resources will be documented as the Learnset API is implemented.

**Status:** Planned

---

# Trainer APIs

## Teams

### GET `/teams`

Retrieve every saved team for the authenticated trainer.

**Status:** Planned

---

### GET `/teams/:id`

Retrieve a specific team.

**Status:** Planned

---

### POST `/teams`

Create a new team.

**Status:** Planned

---

### PUT `/teams/:id`

Update an existing team.

**Status:** Planned

---

### DELETE `/teams/:id`

Delete a saved team.

**Status:** Planned

---

## Adventure Tracker

### GET `/tracker`

Retrieve game progress.

Returns:

- Story progress
- Gym badges
- Elite Four progress
- Champion completion
- Pokédex completion
- Play time
- Completion statistics

**Status:** Planned

---

### POST `/tracker`

Create or update game progress.

**Status:** Planned

---

## Badges

### GET `/badges`

Retrieve badge progress.

**Status:** Planned

---

### PUT `/badges/:id`

Update badge completion.

**Status:** Planned

---

## Achievements

### GET `/achievements`

Retrieve unlocked achievements.

Returns:

- Achievement list
- Progress
- Completion percentage

**Status:** Planned

---

# Collection APIs

## Collections

### GET `/collection`

Retrieve trainer collection progress.

Returns:

- Living Dex
- Shiny Dex
- Regional Dexes
- Collection statistics

**Status:** Planned

---

### PUT `/collection`

Update collection progress.

**Status:** Planned

---

# Intelligence APIs

## Search

### GET `/search`

Global search across every supported dataset.

Supports:

- Exact search
- Partial search
- Fuzzy search
- ID lookup

Searches:

- Pokémon
- Species
- Moves
- Abilities
- Types
- Items
- Locations

**Status:** Planned

---

## AI Assistant

### POST `/ai/chat`

Interact with the Pokémon AI Assistant.

Planned capabilities include:

- Team recommendations
- Battle strategy
- Pokémon suggestions
- Adventure guidance
- Type matchup explanations
- Move recommendations
- Smart search

**Status:** Future

---

# Community APIs

## Friends

### GET `/friends`

Retrieve the authenticated trainer's friends.

**Status:** Future

---

### POST `/friends`

Send a friend request.

**Status:** Future

---

### DELETE `/friends/:id`

Remove a friend.

**Status:** Future

---

# Versioning

The API follows semantic versioning.

Current version:

```
v1
```

Future breaking changes will be introduced through new API versions without affecting existing clients.

---

# Future API Goals

Future releases will expand the API with additional functionality, including:

- Evolution endpoints
- Learnset endpoints
- Location endpoints
- Encounter data
- Item database
- Trainer profiles
- Collection sharing
- AI-powered recommendations
- Battle simulation
- Cloud synchronization

The API is designed to remain backward compatible wherever possible while supporting future Pokémon generations and game mechanics.

---

# Summary

The Pokémon Companion API provides a consistent and versioned interface to the platform's canonical knowledge, trainer data, collections, and future platform capabilities.

By exposing standardized REST resources while remaining independent of the underlying implementation, the API provides a stable foundation for web, mobile, desktop, and AI-powered clients.
The API is designed to be:

- Consistent and validated datasets
- Fast API responses
- Easier maintenance
- Scalable architecture
- Simplified support for future Pokémon generations
- A solid foundation for frontend, mobile, and AI-powered features