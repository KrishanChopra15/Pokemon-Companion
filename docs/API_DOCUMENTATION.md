# API Documentation

This document describes the REST API planned for Pokémon Companion.

The API provides access to Pokémon data, generated datasets, trainer information, collections, progress tracking, and future AI-powered features.

Although the frontend is currently under active development, the underlying data generation pipeline has already been completed and serves as the foundation for all future API endpoints.

---

# Base URL

```
/api/v1
```

---

# API Architecture

The API is built on top of the project's custom-generated Pokémon database.

```text
           PokéAPI
               │
               │
      Veekun Database
               │
               ▼
     Download Scripts
               │
               ▼
      Raw JSON Database
               │
               ▼
    Dataset Generators
               │
               ▼
   Generated JSON Database
               │
               ▼
        REST API
               │
               ▼
Frontend • Mobile • AI
```

This layered architecture separates data generation from API delivery, making the project easier to maintain, test, and extend as future Pokémon games are released.

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

# Pokémon

## GET `/pokemon`

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

## GET `/pokemon/:id`

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

# Species

## GET `/species`

Retrieve Pokémon species.

Supports:

- Search
- Pagination
- Generation filtering

**Status:** In Development

---

## GET `/species/:id`

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

## GET `/species/:id/forms`

Retrieve every generated form for a species.

Returns:

- Default form
- Mega Evolutions
- Regional Forms
- Gigantamax Forms
- Alternate Forms

**Status:** Planned

---

# Moves

## GET `/moves`

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

## GET `/moves/:id`

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

# Abilities

## GET `/abilities`

Retrieve every Pokémon ability.

Supports:

- Search
- Pagination
- Sorting

**Status:** In Development

---

## GET `/abilities/:id`

Retrieve detailed ability information.

Returns:

- Current ability information
- Historical effects
- Flavor text
- Generation information

**Status:** In Development

---

# Types

## GET `/types`

Retrieve all Pokémon types.

Returns:

- Type information
- Colors
- Damage relations

**Status:** In Development

---

## GET `/types/:id`

Retrieve a specific Pokémon type.

Includes:

- Offensive matchups
- Defensive matchups
- Legacy support

**Status:** In Development

---

# Generated Datasets

## GET `/pokemon-index`

Retrieve the optimized Pokémon index generated for the frontend.

**Status:** Planned

---

## GET `/categories/:category`

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

# Items

## GET `/items`

Retrieve every item.

Supports:

- Search
- Category filtering
- Pagination

**Status:** Planned

---

## GET `/items/:id`

Retrieve detailed item information.

Returns:

- Basic information
- Category
- Effect
- Sprite
- Game availability

**Status:** Planned

---

# Teams

## GET `/teams`

Retrieve every saved team for the authenticated trainer.

**Status:** Planned

---

## GET `/teams/:id`

Retrieve a specific team.

**Status:** Planned

---

## POST `/teams`

Create a new team.

**Status:** Planned

---

## PUT `/teams/:id`

Update an existing team.

**Status:** Planned

---

## DELETE `/teams/:id`

Delete a saved team.

**Status:** Planned

---

# Adventure Tracker

## GET `/tracker`

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

## POST `/tracker`

Create or update game progress.

**Status:** Planned

---

# Badges

## GET `/badges`

Retrieve badge progress.

**Status:** Planned

---

## PUT `/badges/:id`

Update badge completion.

**Status:** Planned

---

# Collections

## GET `/collection`

Retrieve trainer collection progress.

Returns:

- Living Dex
- Shiny Dex
- Regional Dexes
- Collection statistics

**Status:** Planned

---

## PUT `/collection`

Update collection progress.

**Status:** Planned

---

# Achievements

## GET `/achievements`

Retrieve unlocked achievements.

Returns:

- Achievement list
- Progress
- Completion percentage

**Status:** Planned

---

# Search

## GET `/search`

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

# AI Assistant

## POST `/ai/chat`

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

# Friends

## GET `/friends`

Retrieve the authenticated trainer's friends.

**Status:** Future

---

## POST `/friends`

Send a friend request.

**Status:** Future

---

## DELETE `/friends/:id`

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

# Development Notes

The REST API is powered entirely by the project's custom-generated Pokémon database.

Current available datasets include:

## Core Datasets

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups

## Generated Datasets

- Pokémon Index
- Category Indexes
- Species Forms

## Historical Datasets

- Ability History
- Move History
- Move Effect History

## Legacy Datasets

- Legacy Pokémon Types
  - ???
  - Shadow

Additional datasets will continue to be added as development progresses, allowing new API endpoints to be introduced without requiring major architectural changes.

---

# Current Development Phase

The data generation pipeline has been completed.

Current development focuses on:

1. REST API implementation
2. Frontend integration
3. Dashboard development
4. Pokédex interface
5. Pokémon detail pages
6. Validation layer
7. Team Builder

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

The Pokémon Companion API is designed around a modular, generated dataset architecture.

By separating data generation from API delivery, the project provides:

- Consistent and validated datasets
- Fast API responses
- Easier maintenance
- Scalable architecture
- Simplified support for future Pokémon generations
- A solid foundation for frontend, mobile, and AI-powered features