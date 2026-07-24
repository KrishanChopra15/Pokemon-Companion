# Pokémon Companion

<p align="center">

<img src="docs/assets/logo.png" alt="Pokémon Companion" width="180">

</p>

<h1 align="center">Pokémon Companion</h1>

<p align="center">
<strong>Everything you need for every Pokémon adventure.</strong>
</p>

<p align="center">

A modern, open-source Pokémon companion built to provide the most comprehensive Pokémon database, collection tracker, adventure assistant, team builder, and future AI-powered experience across every main-series Pokémon game.

</p>

---

# 📖 Overview

Pokémon Companion is an ambitious long-term project designed to become the ultimate companion application for Pokémon trainers.

Instead of focusing only on a Pokédex, Pokémon Companion aims to provide a complete ecosystem where players can:

- Explore every Pokémon
- Build competitive teams
- Track game progress
- Complete Living Dexes
- Manage collections
- Discover locations
- View historical mechanics
- Compare Pokémon across generations
- Prepare for battles
- Receive AI-powered recommendations

The project is built around a custom data generation pipeline that transforms official Pokémon datasets into a highly optimized JSON database designed specifically for this application.

The architecture has been designed to remain maintainable for future Pokémon generations while requiring minimal updates whenever new games are released.

---

# ✨ Features

## 📚 Pokédex

- Complete National Pokédex
- Regional Pokédex support
- Pokémon forms
- Mega Evolutions
- Gigantamax Forms
- Regional Variants
- Gender Forms
- Alternate Forms
- Evolution Chains
- Base Stats
- Abilities
- Hidden Abilities
- Type Matchups
- Sprites
- Official Artwork

---

## ⚔ Team Builder

- Unlimited Teams
- Team Statistics
- Type Coverage
- Weakness Analysis
- Resistance Analysis
- Role Distribution
- Suggested Improvements

---

## 🎮 Adventure Tracker

- Story Progress
- Gym Badges
- Elite Four Progress
- Champion Completion
- Pokédex Completion
- Side Quests
- Collection Progress

---

## 🌍 World Explorer

- Regions
- Cities
- Routes
- Dungeons
- Hidden Items
- Legendary Locations
- Encounter Tables

---

## 🏆 Trainer Legacy

- Achievements
- Lifetime Statistics
- Living Dex Progress
- Shiny Collection
- Trainer History

---

## 🤖 AI Assistant *(Planned)*

- Team Suggestions
- Pokémon Recommendations
- Battle Strategy
- Smart Search
- Adventure Guidance
- Move Suggestions

---

## 👥 Community *(Planned)*

- Public Profiles
- Shared Collections
- Friend Comparison
- Leaderboards

---

# 🏗 Architecture

Pokémon Companion uses a modular data pipeline that separates raw Pokémon data from generated application datasets.

```text
                PokéAPI
                   │
                   │
        Veekun SQLite Database
                   │
                   ▼
        Download Scripts
        (scripts/download)
                   │
                   ▼
         Raw JSON Database
            (database/)
                   │
                   ▼
       Dataset Generators
       (scripts/generate)
                   │
                   ▼
      Generated Datasets
    (database/generated)
                   │
                   ▼
      Validation Pipeline
     (scripts/validate)
                   │
                   ▼
 Frontend • Backend • AI Features
```

This layered architecture allows the project to remain scalable while making future updates significantly easier.

---

# 🗄 Database

The project uses a custom-generated Pokémon database built from official datasets.

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

- Legacy Types
  - ???
  - Shadow

## Planned Datasets

- Evolutions
- Learnsets
- Games
- Items
- Locations
- Encounters
- Trainers
- Maps

---

# ⚙ Database Generation

The database is generated using a multi-stage pipeline.

```text
Download
    │
    ▼
History Generation
    │
    ▼
Dataset Generation
    │
    ▼
Validation
    │
    ▼
Application
```

Data sources include:

- PokéAPI
- Veekun Pokédex Database

This approach keeps the database normalized, maintainable, and easy to regenerate whenever new Pokémon games are released.

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript

## Backend

- Node.js
- Express.js

## Database

- Custom JSON Database
- MongoDB (Future User Data)

## Data Pipeline

- Node.js
- Better SQLite3
- PokéAPI
- Veekun Database

---

# 📂 Project Structure

```text
pokemon-companion/

├── database/
│
├── generated/
│
├── history/
│
├── legacy/
│
├── external/
│
├── pokemon.json
├── species.json
├── moves.json
├── abilities.json
├── types.json
├── version-groups.json
├── damage-classes.json
└── move-targets.json

scripts/

├── download/
│
├── generate/
│
├── inspect/
│
├── validate/
│
└── utils/
    ├── api.js
    ├── database.js
    ├── formatting.js
    ├── helpers.js
    ├── json.js
    ├── logger.js
    ├── moves.js
    ├── pokemon.js
    └── references.js

frontend/

docs/

README.md

LICENSE
```

# 🚀 Current Progress

## ✅ Completed

### Project Foundation

- Project architecture
- Database architecture
- Modular utility architecture
- Custom JSON data pipeline
- Download pipeline
- Dataset generation pipeline
- Shared logging utilities
- Shared API utilities
- Shared database utilities
- Shared formatting utilities
- Shared reference utilities

---

### Database

#### Core Datasets

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups

#### Generated Datasets

- Pokémon Index
- Category Indexes
- Species Forms

#### Historical Datasets

- Ability History
- Move History
- Move Effect History

#### Legacy Datasets

- Legacy Types
- ??? Type
- Shadow Type

---

### Data Pipeline

#### Download Scripts

- Pokémon
- Species
- Moves
- Abilities
- Types
- Damage Classes
- Move Targets
- Version Groups
- Legacy Types

#### History Generators

- Ability History
- Move History
- Move Effect History

#### Dataset Generators

- Pokémon Index
- Category Indexes
- Species Forms

---

### Utility Modules

- API Client
- Database Utilities
- JSON Utilities
- Logger
- Formatting Helpers
- General Helpers
- Pokémon Helpers
- Move Helpers
- Reference Builders

---

## 🚧 Currently In Development

- Validation Layer
- Backend API
- Pokédex Interface
- Pokémon Details
- Dashboard

---

## 📅 Planned

### Database

- Evolutions
- Learnsets
- Items
- Locations
- Games
- Encounter Tables
- Trainers
- Maps
- Sprites

### Features

- Team Builder
- World Explorer
- Adventure Tracker
- Battle Tools
- Damage Calculator
- Collection Tracker
- AI Assistant
- Community Features

---

# 📈 Project Status

| Component | Status |
|-----------|--------|
| Database Pipeline | ✅ Complete |
| Download Scripts | ✅ Complete |
| Dataset Generators | ✅ Complete |
| Utility Modules | ✅ Complete |
| Generated Datasets | ✅ Complete |
| Validation Layer | 🚧 In Progress |
| Backend API | ⏳ Planned |
| Frontend | 🚧 In Progress |
| AI Features | ⏳ Planned |

---

# 🎯 Roadmap

## Phase 9 — Validation

- Database validator
- Cross-reference validation
- Duplicate detection
- Data integrity checks
- Historical dataset validation
- Generated dataset validation

---

## Phase 10 — Backend

- REST API
- Search API
- Pokémon endpoints
- Move endpoints
- Ability endpoints
- Type endpoints
- Forms endpoints

---

## Phase 11 — Frontend

- Dashboard
- Pokédex
- Pokémon Details
- Search
- Filters
- Move Database
- Ability Database
- Type Chart

---

## Phase 12 — Trainer Tools

- Team Builder
- Team Analyzer
- Damage Calculator
- Collection Tracker
- Adventure Tracker
- Living Dex

---

## Phase 13 — AI & Community

- AI Assistant
- Battle Recommendations
- Team Suggestions
- Smart Search
- Trainer Profiles
- Friends
- Shared Collections
- Leaderboards

---

# 📸 Screenshots

Screenshots and demonstrations will be added as development progresses.

---

# ⚙ Installation

Clone the repository.

```bash
git clone <repository-url>
```

Install dependencies.

```bash
npm install
```

Download datasets.

```bash
node scripts/download/download-version-groups.js
node scripts/download/download-damage-classes.js
node scripts/download/download-move-targets.js
node scripts/download/download-types.js
node scripts/download/download-species.js
node scripts/download/download-pokemon.js
node scripts/download/download-abilities.js
node scripts/download/download-moves.js
```

Generate datasets.

```bash
node scripts/generate/generate-pokemon-index.js
node scripts/generate/generate-category-index.js
node scripts/generate/generate-species-forms.js
```

Generate history datasets.

```bash
node scripts/download/download-ability-history.js
node scripts/download/download-move-history.js
node scripts/download/download-move-effect-history.js
```

Validation support is currently under development and will become part of the standard build process.

---

# 🤝 Contributing

Contributions are welcome.

Please ensure that:

- Code follows the existing project style.
- New datasets are documented.
- Generated files remain deterministic.
- Utility modules are reused whenever possible.
- Documentation is updated alongside code changes.

---

# 📄 License

This project is licensed under the MIT License.

See the LICENSE file for details.

---

# ❤️ Acknowledgements

Pokémon Companion would not be possible without the amazing work of the Pokémon community and the maintainers of the following resources:

- PokéAPI
- Veekun Pokédex Database

Special thanks to everyone contributing to open Pokémon data and tooling.

---

<p align="center">

Built with ❤️ for Pokémon Trainers around the world.

</p>