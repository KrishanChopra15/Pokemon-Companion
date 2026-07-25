# Database Schema

This document describes the database architecture used by Pokémon Companion.

The project uses a hybrid database design that separates official Pokémon data from user-generated content.

- **Generated JSON Database** stores official Pokémon data generated from external sources.
- **MongoDB** stores trainer accounts, progress, collections, teams, settings, and other personalized data.

This architecture allows official Pokémon data to be regenerated whenever new games are released while keeping user data completely independent.

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
- Forms
- Evolutions
- Learnsets
- Items
- Games
- Locations
- Sprites

### Generated Datasets

- Pokémon Index
- Search Index
- Type Index
- Mega Index
- Gigantamax Index
- Regional Index
- Primal Index
- Totem Index
- Gender Index
- Alternate Index
- Forme Index
- Species Forms
- Evolution Graph *(Planned)*

### Historical Datasets

- Ability History
- Move History
- Move Effect History

### Legacy Datasets

- Legacy Pokémon Types
    - ???
    - Shadow

### Metadata

- Ability Metadata
- Game Metadata
- Item Metadata
- Move Metadata
- Type Metadata

**Status:** 🚧 In Development

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
Frontend • Backend • AI
```

Each stage has a single responsibility.

- **Download** retrieves official data.
- **Generate** transforms raw data into application-optimized datasets.
- **Validate** ensures every dataset is internally consistent.
- **Application** consumes only validated datasets.

---

# Raw Database

The raw database mirrors official Pokémon data as closely as practical.

Raw datasets prioritize completeness over optimization.

Examples include:

- pokemon.json
- species.json
- moves.json
- abilities.json
- evolutions.json
- forms.json
- items.json
- locations.json
- games.json
- learnsets.json
- sprites.json

These datasets serve as the foundation for every generated dataset.

---

# Generated Database

Generated datasets are optimized specifically for Pokémon Companion.

Unlike the raw datasets, generated datasets are designed for:

- Fast lookups
- Frontend rendering
- Search
- AI features
- Team analysis
- Adventure tracking

Generated datasets should avoid expensive runtime processing whenever possible.

Examples:

- Pokémon Index
- Search Index
- Category Indexes
- Species Forms
- Evolution Graph *(planned)*

---

# MongoDB Collections

MongoDB stores trainer-specific information that should never be regenerated from official Pokémon data.

---

## Users

Stores trainer accounts.

Includes:

- Authentication
- Profile
- Preferences
- Settings

**Status:** Planned

---

## Teams

Stores trainer-created Pokémon teams.

Includes:

- Team members
- Nicknames
- Notes
- Saved teams

**Status:** Planned

---

## Collections

Stores collection progress.

Includes:

- Living Dex
- National Dex
- Regional Dex
- Shiny Collection
- Form Collection
- Collection statistics

**Status:** Planned

---

## Adventure Tracker

Stores game progress.

Includes:

- Current game
- Story progress
- Badges
- Elite Four
- Champion
- Play time
- Notes
- Challenge type

**Status:** Planned

---

## Achievements

Stores trainer achievements.

Includes:

- Achievement progress
- Completion dates
- Statistics
- Rewards

**Status:** Planned

---

## Friends

Stores community features.

Includes:

- Friends
- Friend requests
- Shared collections
- Progress comparison

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
├── Evolutions
├── Learnsets
├── Sprites
└── Artwork

Species
│
├── Pokémon Index
├── Species Forms
├── Evolution Graph
└── Search Index

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

Games
│
├── Locations
├── Version Groups
└── Regions
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

A comprehensive validation pipeline ensures every generated dataset is internally consistent before it is used by the application.

Validation includes:

- File existence
- JSON validation
- Duplicate IDs
- Duplicate names
- Broken references
- Missing references
- Generated dataset validation
- Historical dataset validation
- Legacy dataset validation
- Metadata validation

Future validation will also include:

- Evolution graph integrity
- Learnset validation
- Item reference validation
- Location reference validation

---

# Design Principles

The database architecture follows several core principles.

## Separation of Concerns

Official Pokémon data and trainer data remain completely independent.

---

## Deterministic Generation

Running the generation pipeline with identical source data always produces identical output.

---

## Modular Pipeline

Every download, generation, and validation step is independent and reusable.

---

## Scalability

Future Pokémon generations, mechanics, forms, and games can be added without redesigning the database.

---

## Maintainability

Shared utilities minimize duplicate logic and simplify future development.

---

## Performance

Generated datasets are optimized to minimize runtime processing and improve frontend performance.

---

# Future Expansion

The architecture is designed to support future datasets without structural changes.

Planned additions include:

- Evolution Graph
- Encounter Tables
- Trainers
- Maps
- Regions
- Cities
- Routes
- NPC Database
- Trainer Database
- Hidden Items
- Fishing Encounters
- Surf Encounters
- Battle Facilities
- Ribbon Data
- Contest Data
- Mystery Gift Database
- Event Distribution Database

These datasets will integrate into the existing pipeline while preserving compatibility with the current architecture.