# Pokémon Companion Constitution

> **Everything you need for every Pokémon adventure.**

---

# Preamble

Pokémon Companion is an independent, community-driven Pokémon knowledge platform designed to preserve, organize, and present official Pokémon game information with exceptional accuracy.

The goal of this project is not simply to build another Pokédex or another tracker.

The goal is to build the definitive Pokémon knowledge platform that allows trainers to explore every official Pokémon game, understand every mechanic, track every adventure, and manage every collection from a single unified application.

Every architectural decision made throughout this project should support this vision.

---

# Vision

To build the world's most comprehensive Pokémon knowledge platform, providing historically accurate, interconnected, and future-proof information for every official Pokémon game while delivering a seamless experience across every major operating system and device.

Pokémon Companion should become the single place where trainers can learn, explore, plan, and track every aspect of their Pokémon journey.

---

# Mission

Create a platform that combines:

- A canonical Pokémon knowledge database
- Comprehensive game completion tools
- Adventure tracking
- Collection management
- Team building
- Battle assistance
- AI-powered guidance
- Cloud synchronization
- Offline accessibility

into one cohesive ecosystem.

Instead of visiting multiple websites and applications, trainers should be able to accomplish everything from a single platform.

---

# Project Identity

Pokémon Companion is **not** primarily:

- a Pokédex
- a tracker
- a team builder
- a battle calculator
- an AI assistant

Instead,

Pokémon Companion is a **Pokémon Knowledge Platform**.

Every feature of the project exists because it is powered by a single canonical knowledge graph.

The database is not a feature.

The database is the foundation.

Everything else is built on top of it.

---

# Core Philosophy

The project is guided by the following philosophy.

## Knowledge First

Information is the foundation of every feature.

Every entity should exist only once inside the canonical database and be referenced everywhere else.

---

## Official Data First

Whenever possible, official game data is considered the highest authority.

Community sources exist to assist verification—not replace official data.

---

## Historical Accuracy

Pokémon Companion preserves history.

Every game should accurately represent the mechanics, learnsets, encounters, items, evolutions, abilities, locations, and data that existed in that specific version.

The platform should never rewrite history using modern mechanics.

---

## One Platform

The platform should eliminate the need for trainers to switch between multiple Pokémon resources.

Whether a trainer wants to:

- search Pokémon
- inspect moves
- build teams
- track completion
- compare generations
- browse locations
- plan encounters

the workflow should remain inside Pokémon Companion.

---

## Interconnected Knowledge

Every entity should be connected.

For example:

Game
→ Region
→ Location
→ Encounter
→ Pokémon
→ Form
→ Move
→ Ability
→ Item

Users should be able to navigate naturally through these relationships without reaching dead ends.

---

# Engineering Principles

## Canonical Database

A single canonical database is the source of truth.

Generated datasets, search indexes, APIs, and the user interface must derive their information from this database.

---

## Single Source of Truth

Every piece of Pokémon information should exist only once.

No duplicated knowledge.

No conflicting records.

Relationships should reference existing entities instead of copying data.

---

## Database Before Features

Features should never define data.

Data should define features.

Every new feature must be designed around the existing canonical database.

---

## Offline First

The application should function without an internet connection whenever possible.

Core Pokémon data should always remain locally available.

Internet connectivity should enhance the experience rather than be required for it.

---

## Cloud Synchronization

Trainer-specific information should synchronize securely across devices.

This includes:

- adventure progress
- collections
- teams
- achievements
- preferences
- future AI conversations

The canonical Pokémon database should remain separate from user data.

---

## Cross-Platform

Pokémon Companion should provide a consistent experience across:

- Windows
- macOS
- Linux
- Android
- iOS

No platform should become a second-class citizen.

---

## Scalability

Future Pokémon games should integrate without requiring architectural redesign.

The database should be capable of supporting future generations, mechanics, forms, and games through extension rather than replacement.

---

## Maintainability

The project should remain understandable for future contributors.

Clear documentation, modular scripts, reusable utilities, and automated validation take priority over short-term convenience.

---

## Performance

Generated datasets should be optimized for fast loading.

The application should avoid unnecessary runtime computation whenever data can be generated during the build pipeline.

---

# Scope

Pokémon Companion aims to support every official Pokémon title that meaningfully contributes to the Pokémon universe.

This includes, but is not limited to:

## Main Series

Every mainline generation.

---

## Enhanced Versions

Such as:

- Yellow
- Crystal
- Emerald
- Platinum

---

## Remakes

Examples include:

- FireRed
- LeafGreen
- HeartGold
- SoulSilver
- Omega Ruby
- Alpha Sapphire
- Brilliant Diamond
- Shining Pearl

---

## Legends Games

Including current and future Legends titles.

---

## Official Side Games

Where appropriate.

Examples include:

- Pokémon Colosseum
- Pokémon XD: Gale of Darkness
- Pokémon HOME
- Pokémon GO
- Pokémon Battle Revolution
- Pokétopia
- future official titles

Support may expand as the platform evolves.

---

# Source of Truth

Data sources are prioritized according to authority.

## Priority 1

Official game data.

---

## Priority 2

Official documentation and official publications.

---

## Priority 3

Verified extraction from official game assets.

---

## Priority 4

Community reverse engineering used for verification.

---

## Priority 5

Established community databases.

Examples include:

- Veekun
- Pokémon Showdown
- PokéAPI

These sources assist development but do not replace official data.

---

## Priority 6

Manual overrides.

Every manual correction should be documented and justified.

---

# Database Philosophy

Pokémon Companion separates information into distinct layers.

## Canonical Database

Stores normalized Pokémon knowledge.

Never contains user progress.

---

## Generated Database

Optimized datasets produced automatically from the canonical database.

Designed for frontend performance.

---

## User Database

Stores trainer-specific information.

Examples include:

- progress
- collections
- teams
- settings
- achievements

User data must never modify canonical Pokémon data.

---

# Development Principles

The project follows several non-negotiable development rules.

## Architecture Before Code

System design must be completed before implementation begins.

---

## Documentation Before Expansion

Major architectural changes should be documented before code is written.

---

## Validate Everything

Generated data should be validated before becoming part of the canonical database.

---

## Avoid Hallucinated Data

If authoritative information cannot be confirmed, it should be marked for investigation rather than guessed.

Accuracy is always preferred over completeness.

---

## Long-Term Thinking

Every implementation should be evaluated according to whether it will remain maintainable years into the future.

Temporary shortcuts that introduce long-term technical debt should be avoided.

---

# Non-Goals

Pokémon Companion does not aim to:

- replace official Pokémon games
- distribute copyrighted game assets unlawfully
- prioritize speed over accuracy
- duplicate data unnecessarily
- become dependent upon third-party APIs

The project values correctness, longevity, and maintainability above rapid feature development.

---

# Success Criteria

Pokémon Companion will be considered successful when it can:

- accurately represent every supported official Pokémon game
- preserve historical game data
- function offline for core features
- synchronize trainer progress across devices
- provide a deeply interconnected Pokémon knowledge graph
- eliminate the need to consult multiple Pokémon resources
- remain maintainable as future Pokémon generations are released

---

# Living Constitution

This Constitution is the highest-level document governing Pokémon Companion.

All architectural decisions, documentation, scripts, databases, APIs, and application features should remain consistent with the principles defined here.

When future decisions conflict with this Constitution, the Constitution should be reviewed and deliberately amended rather than silently ignored.

The goal is not simply to build software.

The goal is to build a Pokémon knowledge platform that remains accurate, maintainable, and valuable for many years to come.