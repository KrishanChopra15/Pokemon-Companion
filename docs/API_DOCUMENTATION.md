# API Documentation

This document describes the planned REST API for Pokémon Companion.

The API is designed to provide access to Pokémon data, trainer information, collections, game progress, and future AI-powered features. While the database generation pipeline is complete, most public API endpoints are still under development.

---

# Base URL

```
/api/v1
```

---

# API Status

| Module | Status |
|---------|--------|
| Authentication | 📝 Planned |
| Pokémon | 📝 Planned |
| Species | 📝 Planned |
| Moves | 📝 Planned |
| Abilities | 📝 Planned |
| Types | 📝 Planned |
| Items | 🚧 Planned |
| Teams | 🚧 Planned |
| Adventure Tracker | 🚧 Planned |
| Collections | 🚧 Planned |
| AI Assistant | 🔮 Future |
| Friends | 🔮 Future |

---

# Response Format

Successful requests will return:

```json
{
    "success": true,
    "data": {}
}
```

Errors will return:

```json
{
    "success": false,
    "message": "Error description"
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

Retrieve the currently authenticated trainer.

**Status:** Planned

---

# Pokémon

## GET `/pokemon`

Retrieve a paginated list of Pokémon.

Supports:

- Pagination
- Search
- Sorting
- Filtering
- Regional Pokédex
- Generation filtering
- Type filtering

**Status:** Planned

---

## GET `/pokemon/:id`

Retrieve detailed information for a single Pokémon.

Returns:

- Basic Information
- Stats
- Types
- Abilities
- Forms
- Evolution Chain
- Sprites
- Artwork

**Status:** Planned

---

# Species

## GET `/species`

Retrieve Pokémon species.

**Status:** Planned

---

## GET `/species/:id`

Retrieve detailed species information.

**Status:** Planned

---

# Moves

## GET `/moves`

Retrieve all Pokémon moves.

Supports:

- Search
- Damage Class
- Type
- Generation
- Sorting

**Status:** Planned

---

## GET `/moves/:id`

Retrieve detailed move information.

Includes:

- Current move data
- Historical changes
- Move effects

**Status:** Planned

---

# Abilities

## GET `/abilities`

Retrieve all Pokémon abilities.

**Status:** Planned

---

## GET `/abilities/:id`

Retrieve detailed ability information.

Includes:

- Current ability data
- Historical effect changes

**Status:** Planned

---

# Types

## GET `/types`

Retrieve all Pokémon types.

**Status:** Planned

---

## GET `/types/:id`

Retrieve a specific Pokémon type.

**Status:** Planned

---

# Items

## GET `/items`

Retrieve all items.

**Status:** Planned

---

## GET `/items/:id`

Retrieve detailed item information.

**Status:** Planned

---

# Teams

## GET `/teams`

Retrieve all saved teams.

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

Retrieve Living Dex and collection progress.

**Status:** Planned

---

## PUT `/collection`

Update collection progress.

**Status:** Planned

---

# Achievements

## GET `/achievements`

Retrieve unlocked achievements.

**Status:** Planned

---

# Search

## GET `/search`

Global search across:

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

Send a message to the Pokémon AI Assistant.

Future capabilities include:

- Team recommendations
- Battle advice
- Pokémon suggestions
- Adventure guidance

**Status:** Future

---

# Friends

## GET `/friends`

Retrieve the user's friends.

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

The custom Pokémon database powering these endpoints is generated using automated scripts and validated before release.

Current validated datasets include:

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups
- Historical Move Data
- Historical Ability Data
- Historical Move Effect Data
- Legacy Pokémon Types

Additional endpoints will be implemented as new datasets become available.