# API Documentation

This document outlines the planned REST API endpoints for Pokémon Companion.

---

# Base URL

```
/api/v1
```

---

# Authentication

## POST /login

Authenticate an existing trainer.

**Status:** Planned

---

## POST /register

Create a new trainer account.

**Status:** Planned

---

## POST /logout

Logout the current trainer.

**Status:** Planned

---

## GET /me

Return the currently authenticated trainer.

**Status:** Planned

---

# Pokémon

## GET /pokemon

Retrieve a list of Pokémon.

Supports:

- Pagination
- Search
- Filters
- Sorting

**Status:** Planned

---

## GET /pokemon/:id

Retrieve detailed information for a single Pokémon.

**Status:** Planned

---

# Moves

## GET /moves

Retrieve all Pokémon moves.

**Status:** Planned

---

## GET /moves/:id

Retrieve details for a specific move.

**Status:** Planned

---

# Abilities

## GET /abilities

Retrieve all abilities.

**Status:** Planned

---

## GET /abilities/:id

Retrieve a specific ability.

**Status:** Planned

---

# Items

## GET /items

Retrieve all items.

**Status:** Planned

---

## GET /items/:id

Retrieve item details.

**Status:** Planned

---

# Teams

## GET /teams

Retrieve all teams belonging to the authenticated user.

**Status:** Planned

---

## POST /teams

Create a new Pokémon team.

**Status:** Planned

---

## PUT /teams/:id

Update an existing team.

**Status:** Planned

---

## DELETE /teams/:id

Delete a saved team.

**Status:** Planned

---

# Adventure Tracker

## GET /tracker

Retrieve the trainer's adventure progress.

**Status:** Planned

---

## POST /tracker

Create or update adventure progress.

**Status:** Planned

---

# Badges

## GET /badges

Retrieve badge progress.

**Status:** Planned

---

## PUT /badges/:id

Update the status of a Gym Badge.

**Status:** Planned

---

# Collections

## GET /collection

Retrieve the user's Pokémon collection.

**Status:** Planned

---

## PUT /collection

Update collection progress.

**Status:** Planned

---

# Achievements

## GET /achievements

Retrieve unlocked achievements.

**Status:** Planned

---

# Search

## GET /search

Search across Pokémon, moves, abilities, items, and locations.

**Status:** Planned

---

# AI Assistant

## POST /ai/chat

Send a question to the AI Assistant.

**Status:** Future

---

# Friends

## GET /friends

Retrieve the user's friends.

**Status:** Future

---

## POST /friends

Send a friend request.

**Status:** Future

---

## DELETE /friends/:id

Remove a friend.

**Status:** Future