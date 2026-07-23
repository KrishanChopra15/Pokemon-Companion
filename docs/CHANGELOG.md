# Changelog

All notable changes to Pokémon Companion will be documented in this file.

This project follows the principles of **Keep a Changelog** and uses **Semantic Versioning** where practical.

---

## [Unreleased]

### Added

#### Database

- Complete Pokémon dataset
- Complete Species dataset
- Complete Moves dataset
- Complete Abilities dataset
- Complete Types dataset
- Damage Classes dataset
- Move Targets dataset
- Version Groups dataset

#### Historical Data

- Ability History dataset
- Move History dataset
- Move Effect History dataset

#### Legacy Data

- Legacy Pokémon Types
  - ??? Type
  - Shadow Type

#### Database Generation

- Automated database generation scripts
- Shared generation utilities
- Historical data generators
- Legacy data generators
- Data inspection scripts

#### Validation Pipeline

- Phase 1 — File existence validation
- Phase 2 — JSON validation
- Phase 3 — Duplicate ID validation
- Phase 4 — Duplicate Name validation
- Phase 5 — Reference validation
- Phase 6 — Data integrity validation
- Phase 7 — Historical data validation

#### Documentation

- Updated README
- Updated API documentation
- Database validation documentation

---

### Changed

#### Database

- Standardized history file architecture
- Historical datasets now use chronological arrays
- Improved database generation consistency
- Improved validation coverage
- Improved project folder organization

#### Validation

- Improved reference validation
- Improved move validation
- Improved Pokémon integrity validation
- Improved historical data validation
- Added validation for legacy Pokémon types

---

### Fixed

- Fixed legacy type validation for ??? and Shadow types
- Fixed move history generation producing empty history entries
- Fixed empty history arrays after generation
- Fixed move effect history generation architecture
- Fixed cross-reference validation issues
- Fixed historical data consistency

---

## [0.2.0] - Dashboard Development

### Added

- Dashboard (My Adventures)
- Dashboard layout
- Quick Actions section
- Team Preview section
- Progress cards
- Achievement section
- Recent Activity section

### Changed

- Improved shared UI components
- Improved responsive layouts
- Navigation consistency

### Fixed

- General styling improvements
- Layout fixes

---

## [0.1.0] - Project Initialization

### Added

#### Project

- Repository setup
- Frontend architecture
- Backend architecture
- Global CSS
- Shared CSS
- Home page
- Responsive layout
- GitHub repository

#### Documentation

- README
- LICENSE
- Development roadmap
- Project specification