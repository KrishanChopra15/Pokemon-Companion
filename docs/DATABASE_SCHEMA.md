# Database Schema

This document describes the database architecture used by Pokémon Companion.

The project uses a hybrid database design that separates official Pokémon data from user-generated content.

- **Generated JSON Database** stores official Pokémon data generated from external sources.
- **MongoDB** stores user accounts, progress, collections, teams, and personalized data.

This architecture allows official game data to be regenerated whenever new Pokémon games are released while keeping user data completely independent.

---

# Database Architecture

## Generated JSON Database

Pokémon Companion uses a custom-generated JSON database built from official Pokémon datasets.

The data pipeline downloads information from PokéAPI and the Veekun Pokédex Database before generating optimized datasets for the application.

### Core Datasets

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups

### Generated Datasets

- Pokémon Index
- Category Indexes
- Species Forms

### Historical Datasets

- Ability History
- Move History
- Move Effect History

### Legacy Datasets

- Legacy Pokémon Types
  - ???
  - Shadow

### Planned Datasets

- Evolutions
- Learnsets
- Items
- Games
- Locations
- Encounters
- Trainers
- Maps

**Status:** ✅ Implemented

---

# Data Generation Pipeline

The generated database is produced through a modular pipeline.

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
Generated Database
        │
        ▼
Validation Layer
        │
        ▼
Application
```

The separation between downloading and dataset generation allows the project to regenerate data efficiently whenever new Pokémon games are released.

---

# MongoDB Collections

MongoDB stores trainer-specific data that should never be regenerated from official Pokémon sources.

---

## Users

Stores trainer accounts.

Includes:

- Account information
- Authentication
- Password hash
- Settings
- Preferences
- Saved progress

**Status:** Planned

---

## Teams

Stores trainer-created Pokémon teams.

Includes:

- Team members
- Nicknames
- Movesets
- Notes

**Status:** Planned

---

## Collections

Stores trainer collection progress.

Includes:

- Living Dex
- Shiny Collection
- Form Collection
- Regional Pokédex completion
- Collection statistics

**Status:** Planned

---

## Adventure Tracker

Stores game progress.

Includes:

- Current game
- Story progression
- Gym badges
- Elite Four
- Champion
- Side quests
- Completion statistics

**Status:** Planned

---

## Achievements

Stores trainer achievements.

Includes:

- Achievement progress
- Completion dates
- Rewards
- Statistics

**Status:** Planned

---

## Friends

Stores community features.

Includes:

- Friend requests
- Friends list
- Shared collections
- Trainer comparisons

**Status:** Future

---

## AI Conversations

Stores AI Assistant conversations.

Includes:

- Conversation history
- Saved chats
- User preferences
- AI context

**Status:** Future

---

# Data Relationships

## Generated Database

```text
Pokémon
│
├── Species
├── Types
├── Abilities
├── Forms
├── Artwork
└── Sprites

Species
│
├── Pokémon Index
├── Species Forms
└── Evolution Data (Future)

Moves
│
├── Move History
├── Move Effect History
└── Version Groups

Abilities
│
└── Ability History

Types
│
└── Damage Relations
```

---

## MongoDB

```text
Users
│
├── Teams
├── Collections
├── Adventure Tracker
├── Achievements
├── Friends
└── AI Conversations
```

---

# Validation

A comprehensive validation pipeline is currently being developed.

The validation layer will verify:

- File existence
- JSON validity
- Duplicate IDs
- Duplicate names
- Cross-reference integrity
- Generated dataset integrity
- Historical dataset integrity
- Legacy dataset integrity

The goal is to ensure every generated database remains internally consistent before it is used by the application.

---

# Design Principles

The database architecture is designed around several core principles.

### Separation of Concerns

Official Pokémon data and user-generated content are stored independently.

### Deterministic Generation

Running the generation pipeline multiple times with the same source data always produces identical output.

### Modular Pipeline

Each download, generation, and validation step is independent and reusable.

### Scalability

Future Pokémon generations and mechanics can be added without redesigning the database.

### Maintainability

Shared utilities minimize duplicated code and simplify future development.

---

# Future Expansion

The current architecture is designed to support future datasets without requiring structural changes.

Planned additions include:

- Evolutions
- Learnsets
- Items
- Games
- Locations
- Encounter Tables
- Trainers
- Maps
- Regions
- Battle Facilities
- Ribbon Data
- Contest Data

These datasets will integrate into the existing generation pipeline while preserving compatibility with current data.