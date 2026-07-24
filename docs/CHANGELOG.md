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
- Complete Damage Classes dataset
- Complete Move Targets dataset
- Complete Version Groups dataset

#### Generated Datasets

- Pokémon Index
- Category Indexes
- Species Forms

#### Historical Data

- Ability History dataset
- Move History dataset
- Move Effect History dataset

#### Legacy Data

- Legacy Pokémon Types
  - ??? Type
  - Shadow Type

#### Data Pipeline

- Modular download pipeline
- Dataset generation pipeline
- Shared API client
- Shared database utilities
- Shared JSON utilities
- Shared logger
- Shared formatting utilities
- Shared helper utilities
- Shared reference builders
- Pokémon utility module
- Move utility module

#### Database Generation

- Pokémon downloader
- Species downloader
- Moves downloader
- Abilities downloader
- Types downloader
- Version Groups downloader
- Damage Classes downloader
- Move Targets downloader
- Historical dataset generators
- Legacy dataset generators
- Pokémon Index generator
- Category Index generator
- Species Forms generator
- Data inspection scripts

#### Documentation

- Updated README
- Updated API documentation
- Improved project documentation
- Architecture documentation
- Data pipeline documentation

---

### Changed

#### Architecture

- Refactored the entire data generation pipeline into modular utility modules.
- Removed duplicated helper logic across download and generation scripts.
- Centralized API communication through a shared API client.
- Centralized JSON loading and saving utilities.
- Centralized logging utilities.
- Centralized formatting utilities.
- Centralized reference builders.
- Improved project organization and maintainability.

#### Database

- Standardized history dataset architecture.
- Improved generated dataset consistency.
- Improved category generation.
- Improved Pokémon form generation.
- Improved lookup performance using shared lookup maps.
- Improved sorting consistency across datasets.
- Simplified download scripts by extracting reusable logic.

#### Project Structure

- Added dedicated utility modules.
- Added generated dataset directory.
- Improved script organization.
- Removed legacy utility implementation.

---

### Removed

- Legacy `scripts/utils.js`
- Duplicate helper implementations
- Duplicate lookup map implementations
- Duplicate move processing logic
- Duplicate sorting implementations

---

### Fixed

- Fixed move history generation.
- Fixed move effect history generation.
- Fixed ability history generation.
- Fixed legacy Pokémon type handling.
- Fixed lookup inconsistencies.
- Fixed duplicated helper functions.
- Fixed repeated sorting implementations.
- Fixed generated Pokémon category ordering.
- Fixed species form generation consistency.
- Fixed cross-reference generation.
- Fixed dataset generation consistency.

---

## [0.2.0] - Dashboard Development

### Added

#### Frontend

- Dashboard (My Adventures)
- Dashboard layout
- Quick Actions
- Team Preview
- Progress Cards
- Achievement Section
- Recent Activity
- Shared navigation

### Changed

- Improved responsive layouts.
- Improved shared UI components.
- Improved navigation consistency.

### Fixed

- Dashboard layout improvements.
- General styling fixes.
- Responsive fixes.

---

## [0.1.0] - Project Initialization

### Added

#### Project

- Repository setup
- Frontend architecture
- Backend architecture
- Initial project structure
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
- Initial API documentation