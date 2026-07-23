# Pokémon Companion

<p align="center">
  <strong>Everything you need for every Pokémon adventure.</strong>
</p>

<p align="center">
An open-source Pokémon companion built to provide a complete database, game tracking, collection management, and future AI-powered tools for every Pokémon game.
</p>

---

# 📖 Overview

Pokémon Companion is a modern web application designed to become the ultimate companion for Pokémon trainers.

The goal of the project is to provide a single platform where players can explore every Pokémon, track game progress, build teams, complete Pokédexes, discover locations, and manage their entire Pokémon journey across every main series title.

The project is built with scalability and long-term maintainability in mind. Its custom database generation pipeline allows new Pokémon games, mechanics, forms, and future generations to be integrated with minimal changes.

---

# ✨ Features

## 📚 Pokédex

- Complete National Pokédex
- Regional Pokédex support
- Living Dex tracker
- Shiny tracker
- Forms & Variants
- Mega Evolutions
- Gigantamax Forms
- Evolution chains

---

## 🌍 World Explorer

- Interactive region maps
- Route information
- Town & city guides
- Hidden items
- Legendary Pokémon locations
- Dungeon exploration

---

## ⚔ Team Builder

- Unlimited custom teams
- Type coverage analysis
- Team statistics
- Weakness checker
- Move recommendations

---

## 🎮 Adventure Tracker

- Story progression
- Gym badge tracker
- Elite Four progress
- Champion completion
- Side quests
- Game completion statistics

---

## 🤖 AI Assistant *(Planned)*

- Pokémon recommendations
- Team suggestions
- Battle strategy
- Adventure guidance
- Intelligent search

---

## 🏆 Trainer Legacy

- Personal achievements
- Collection statistics
- Completion history
- Lifetime trainer progress

---

## 👥 Community *(Planned)*

- Friend comparison
- Public trainer profiles
- Shared collections
- Leaderboards

---

# 🗄 Database

Pokémon Companion uses a custom-generated Pokémon database built from official Pokémon datasets.

Current datasets include:

- Pokémon
- Species
- Abilities
- Moves
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

Placeholder datasets prepared for future development:

- Evolutions
- Forms
- Games
- Items
- Learnsets
- Locations
- Sprites

The database architecture has been designed for future expansion while maintaining compatibility with existing data.

---

# ✅ Database Validation

Every generated database is validated before being committed.

Run the validator using:

```bash
node scripts/validate/validate-database.js
```

Validation includes:

- File existence
- JSON validation
- Duplicate ID detection
- Duplicate name detection
- Cross-reference validation
- Data integrity validation
- Historical data validation

The validation pipeline helps ensure long-term database consistency and catches generator regressions before changes are committed.

---

# ⚙ Database Generation

Database files are automatically generated from external Pokémon datasets.

The project includes scripts for generating:

- Pokémon
- Species
- Abilities
- Moves
- Types
- Version Groups
- Historical data
- Legacy data

Generated files are validated before being added to the repository.

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
- MongoDB *(Future User Data)*

## External Data Sources

- PokéAPI
- Veekun Pokédex Database

---

# 📂 Project Structure

```text
pokemon-companion/

├── database/
│   ├── history/
│   ├── legacy/
│   ├── abilities.json
│   ├── damage-classes.json
│   ├── move-targets.json
│   ├── moves.json
│   ├── pokemon.json
│   ├── species.json
│   ├── types.json
│   └── version-groups.json
│
├── scripts/
│   ├── download/
│   ├── inspect/
│   └── validate/
│
├── frontend/
│
├── docs/
│
├── README.md
└── LICENSE
```

---

# 🚀 Current Progress

## ✅ Completed

### Project

- Project architecture
- Database architecture
- Shared utilities
- Validation framework

### Database

- Pokémon dataset
- Species dataset
- Ability dataset
- Move dataset
- Type dataset
- Damage Classes
- Move Targets
- Version Groups
- Legacy Types

### History

- Ability History
- Move History
- Move Effect History

### Validation

- Phase 1 — File Validation
- Phase 2 — JSON Validation
- Phase 3 — Duplicate Detection
- Phase 4 — Reference Validation
- Phase 5 — Data Integrity
- Phase 6 — History Validation

---

## 🚧 Currently In Development

- Pokédex Interface
- Pokémon Details
- Dashboard
- Frontend Integration

---

## 📅 Planned

- Evolutions
- Forms
- Learnsets
- Locations
- Items
- Games
- Sprites
- Team Builder
- World Explorer
- Adventure Tracker
- AI Assistant
- Community Features

---

# 🎯 Roadmap

## Version 1.0

- Complete Database
- Pokédex
- Pokémon Details
- Dashboard
- Database Validation
- Frontend Foundation

---

## Version 2.0

- Team Builder
- World Explorer
- Adventure Tracker
- Collections
- Trainer Profiles
- Achievements

---

## Version 3.0

- AI Assistant
- Cloud Sync
- Offline Support
- Progressive Web App
- Community Features

---

# 📸 Screenshots

Screenshots will be added as development progresses.

---

# ⚙ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Generate the database (when required):

```bash
node scripts/download/<generator>.js
```

Validate the database:

```bash
node scripts/validate/validate-database.js
```

---

# 🤝 Contributing

Contributions are welcome.

Please ensure that:

- Generated database files pass validation.
- New datasets follow the existing project structure.
- Code follows the project's formatting conventions.
- Documentation is updated alongside new features.

---

# 📄 License

This project is licensed under the MIT License.

---

<p align="center">
Built with ❤️ for Pokémon trainers everywhere.
</p>