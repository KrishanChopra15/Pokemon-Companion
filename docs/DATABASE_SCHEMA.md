# Database Schema

This document outlines the database architecture used by Pokémon Companion.

The project uses a hybrid database design:

- **Generated JSON Database** for official Pokémon data.
- **MongoDB** for user accounts, progress, and personalized content.

---

# Database Architecture

## Generated JSON Database

The application includes a custom-generated database built from official Pokémon datasets.

Current datasets:

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups

Historical datasets:

- Ability History
- Move History
- Move Effect History

Legacy datasets:

- Legacy Pokémon Types
  - ??? Type
  - Shadow Type

Future datasets:

- Evolutions
- Forms
- Games
- Items
- Learnsets
- Locations
- Sprites

The generated database is validated using the project's database validation pipeline before being committed.

**Status:** Implemented

---

# MongoDB Collections

MongoDB stores user-generated and application-specific data that should not be regenerated from external Pokémon sources.

---

## Users

Stores trainer accounts and authentication information.

Includes:

- Account information
- Password hash
- Settings
- Preferences
- Saved progress

**Status:** Planned

---

## Teams

Stores custom Pokémon teams created by trainers.

Includes:

- Team members
- Nicknames
- Movesets
- Team notes

**Status:** Planned

---

## Collections

Stores each trainer's collection progress.

Includes:

- Owned Pokémon
- Living Dex
- Shiny Collection
- Form Collection
- Regional Pokédex completion

**Status:** Planned

---

## Adventure Tracker

Stores game progress for each trainer.

Includes:

- Current game
- Story progress
- Gym badges
- Elite Four
- Champion status
- Side quests
- Completed objectives

**Status:** Planned

---

## Achievements

Stores unlocked achievements and trainer milestones.

Includes:

- Achievement progress
- Completion dates
- Statistics
- Rewards

**Status:** Planned

---

## Friends

Stores trainer friendships and social features.

Includes:

- Friend requests
- Friends list
- Shared progress
- Trainer comparisons

**Status:** Future

---

## AI Conversations

Stores AI Assistant conversation history.

Includes:

- Chat history
- Saved conversations
- User preferences
- Context memory

**Status:** Future

---

# Data Relationships

```
Generated Database
│
├── Pokémon
│     ├── Species
│     ├── Types
│     ├── Abilities
│     └── Moves
│
├── Version Groups
│
├── History
│     ├── Ability History
│     ├── Move History
│     └── Move Effect History
│
└── Legacy
      └── Pokémon Types
```

```
MongoDB
│
├── Users
│     ├── Teams
│     ├── Collections
│     ├── Adventure Tracker
│     ├── Achievements
│     └── Friends
```

---

# Validation

Every generated database is validated before being committed.

Validation includes:

- File existence
- JSON validation
- Duplicate ID detection
- Duplicate name detection
- Cross-reference validation
- Data integrity validation
- Historical data validation

---

# Future Expansion

The database architecture has been designed to support future Pokémon generations and mechanics without requiring structural changes.

Planned future datasets include:

- Evolutions
- Forms
- Learnsets
- Items
- Games
- Locations
- Sprites
- Encounters
- Trainers
- Regions